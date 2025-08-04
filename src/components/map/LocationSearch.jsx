import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, X, Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";

const LocationSearch = forwardRef(
  (
    {
      onLocationSelect,
      searchQuery,
      setSearchQuery,
      onClear,
      isMobile = false,
    },
    ref
  ) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const dispatch = useDispatch();

    // Expose input ref to parent
    React.useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    // Calculate dropdown position
    const updateDropdownPosition = useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, []);

    // Update position when dropdown shows
    useEffect(() => {
      if (showDropdown) {
        updateDropdownPosition();
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition);

        return () => {
          window.removeEventListener('resize', updateDropdownPosition);
          window.removeEventListener('scroll', updateDropdownPosition);
        };
      }
    }, [showDropdown, updateDropdownPosition]);

    // Memoized coordinate validation functions
    const isLatLongFormat = useCallback((query) => {
      const latLongPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
      return latLongPattern.test(query.trim());
    }, []);

    const parseLatLong = useCallback((query) => {
      try {
        const coords = query
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const [lat, lng] = coords;
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    }, []);

    // Optimized duplicate removal
    const removeDuplicates = useCallback((results) => {
      return results.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              Math.abs(t.lat - item.lat) < 0.001 &&
              Math.abs(t.lng - item.lng) < 0.001
          )
      );
    }, []);

    // Memoized search functions
    const searchNominatim = useCallback(async (query) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=6&countrycodes=pk&addressdetails=1`,
        {
          headers: {
            "User-Agent": "TrackingApp/1.0",
          },
        }
      );

      if (!response.ok) throw new Error("Nominatim API failed");

      const data = await response.json();
      return data.map((item) => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        address: item.display_name,
      }));
    }, []);

    const searchEsri = useCallback(async (query) => {
      const url =
        `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?` +
        `f=json&singleLine=${encodeURIComponent(
          query
        )}&maxLocations=6&countryCode=PAK`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Esri API failed");

      const data = await response.json();
      if (!data.candidates) return [];

      return data.candidates.map((item, index) => ({
        id: `esri_${index}_${Date.now()}`,
        name: item.address,
        lat: item.location.y,
        lng: item.location.x,
        type: "address",
        address: item.address,
      }));
    }, []);

    // Optimized main search function
    const searchLocations = useCallback(
      async (query) => {
        if (!query || query.length < 3) {
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }

        setIsLoading(true);
        try {
          // Check for coordinates first
          if (isLatLongFormat(query)) {
            const coords = parseLatLong(query);
            if (coords) {
              const latLongSuggestion = {
                id: "latlng_" + Date.now(),
                name: `📍 ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                lat: coords.lat,
                lng: coords.lng,
                type: "coordinates",
                address: `Coordinates: ${coords.lat.toFixed(
                  6
                )}, ${coords.lng.toFixed(6)}`,
                isCoordinates: true,
              };

              setSuggestions([latLongSuggestion]);
              setShowDropdown(true);
              setIsLoading(false);
              return;
            }
          }

          // Search with multiple providers
          const allResults = [];

          // Primary: Nominatim (OSM)
          try {
            const nominatimResults = await searchNominatim(query);
            allResults.push(...nominatimResults);g
          } catch (error) {
            console.error("Nominatim failed:", error);
          }

          // Secondary: Esri (only if we need more results)
          if (allResults.length < 5) {
            try {
              const esriResults = await searchEsri(query);
              allResults.push(...esriResults);
            } catch (error) {
              console.error("Esri failed:", error);
            }
          }

          // Remove duplicates and limit results
          const uniqueResults = removeDuplicates(allResults);
          setSuggestions(uniqueResults.slice(0, 8));
          setShowDropdown(uniqueResults.length > 0);
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
          setShowDropdown(false);
        } finally {
          setIsLoading(false);
        }
      },
      [
        isLatLongFormat,
        parseLatLong,
        searchNominatim,
        searchEsri,
        removeDuplicates,
      ]
    );

    // Optimized debounced search with cleanup
    useEffect(() => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Reduced debounce time for better responsiveness
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 200);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [searchQuery, searchLocations]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target) &&
          (!dropdownRef.current || !dropdownRef.current.contains(event.target))
        ) {
          setShowDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Optimized location click handler
    const handleLocationClick = useCallback(
      (location) => {
        const displayText = location.isCoordinates
          ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
          : location.name.split(",")[0];

        setSearchQuery(displayText);
        setShowDropdown(false);
        setSuggestions([]);
        onLocationSelect(location);
      },
      [setSearchQuery, onLocationSelect]
    );

    // Optimized clear search
    const clearSearch = useCallback(() => {
      setSearchQuery("");
      setSuggestions([]);
      setShowDropdown(false);
      // Clear global search query as well
      dispatch(setGlobalSearchQuery(""));
      if (onClear) {
        onClear();
      }
    }, [setSearchQuery, dispatch, onClear]);

    // Optimized input change handler with global search dispatch
    const handleInputChange = useCallback(
      (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Dispatch to global search query for tree search
        dispatch(setGlobalSearchQuery(value));
      },
      [setSearchQuery, dispatch]
    );

    // Optimized input focus handler
    const handleInputFocus = useCallback(() => {
      if (suggestions.length > 0) {
        setShowDropdown(true);
      }
    }, [suggestions.length]);

    // Dropdown component
    const DropdownContent = () => (
      <div
        ref={dropdownRef}
        className="bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: Math.max(dropdownPosition.width, 295),
          zIndex: 999999,
          minWidth: '295px'
        }}
      >
        {suggestions.length > 0 ? (
          suggestions.map((location, index) => (
            <div
              key={location.id}
              className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
              onClick={() => handleLocationClick(location)}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start">
                <MapPin
                  size={16}
                  className={`mt-1 mr-3 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${location.isCoordinates
                    ? "text-blue-500 group-hover:text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                    }`}
                />
                <div className="flex-grow min-w-0">
                  <div
                    className={`text-sm font-semibold truncate transition-colors duration-200 ${location.isCoordinates
                      ? "text-blue-900 group-hover:text-blue-800"
                      : "text-gray-900 group-hover:text-gray-800"
                      }`}
                  >
                    {location.isCoordinates
                      ? location.name
                      : location.name.split(",")[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-200">
                    {location.isCoordinates
                      ? "Geographic Coordinates"
                      : location.address}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && searchQuery.length >= 3 && (
            <div className="px-4 py-4 text-sm text-gray-500 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Search size={20} className="text-gray-300" />
                <div>
                  {isLatLongFormat(searchQuery)
                    ? "Invalid coordinates format. Use: latitude, longitude"
                    : `No locations found for "${searchQuery}"`}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    );

    return (
      <div className="relative" ref={containerRef}>
        {/* Desktop Optimized Search Input */}
        <div className="flex items-center bg-white backdrop-blur-sm rounded-sm overflow-hidden border border-white/30 transition-all duration-200 hover:bg-white hover:shadow-xl focus-within:bg-white focus-within:shadow-xl focus-within:border-blue-200 h-[28px] min-w-[380px]">
          <div className="flex items-center px-3 text-gray-500">
            <Search size={16} className="text-gray-600" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for almost everything..."
            className="h-full flex-1 focus:outline-none text-[12px] text-gray-700 placeholder:text-gray-600 bg-transparent"
            onFocus={handleInputFocus}
            autoComplete="off"
            spellCheck="false"
          />

          <div className="flex items-center px-2">
            {isLoading && (
              <Loader size={14} className="animate-spin text-blue-500 mr-2" />
            )}

            {/* Clear search button - only show if there's content */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="h-6 w-6 hover:bg-gray-100 cursor-pointer rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 group"
                title="Clear search"
              >
                <X size={12} className="text-gray-500 group-hover:text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* Render dropdown using Portal */}
        {showDropdown && createPortal(<DropdownContent />, document.body)}
      </div>
    );
  }
);

LocationSearch.displayName = "LocationSearch";

export default LocationSearch;

