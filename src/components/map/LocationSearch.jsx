import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import { Search, MapPin, X, Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";

const LocationSearch = forwardRef(
  (
    {
      onLocationSelect,
      searchQuery,
      setSearchQuery,
      onClose,
      isMobile = false,
    },
    ref
  ) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const dispatch = useDispatch();

    // Expose input ref to parent
    React.useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

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
            allResults.push(...nominatimResults);
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
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
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
    }, [setSearchQuery, dispatch]);

    // Optimized close handler
    const handleClose = useCallback(() => {
      clearSearch();
      if (onClose) {
        onClose();
      }
    }, [clearSearch, onClose]);

    // NEW: Optimized input change handler with global search dispatch
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

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Optimized Search Input */}
        <div className="flex items-center bg-white rounded-sm shadow-md overflow-hidden h-[42px] border border-gray-200 transition-all duration-200 hover:shadow-lg focus-within:shadow-lg focus-within:border-blue-300">
          <div className="flex items-center px-3 text-gray-500">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for almost everything..."
            className="h-full w-64 focus:outline-none text-sm text-gray-700 bg-transparent"
            onFocus={handleInputFocus}
            autoComplete="off"
            spellCheck="false"
          />

          <div className="flex items-center px-2">
            {isLoading && (
              <Loader size={16} className="animate-spin text-gray-500 mr-1" />
            )}

            {/* Close search button */}
            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
              title="Close search"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Optimized Dropdown with better animations */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-xl z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((location, index) => (
              <div
                key={location.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                onClick={() => handleLocationClick(location)}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-start">
                  <MapPin
                    size={16}
                    className={`mt-1 mr-3 flex-shrink-0 transition-colors duration-150 ${
                      location.isCoordinates ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-grow min-w-0">
                    <div
                      className={`text-sm font-medium truncate transition-colors duration-150 ${
                        location.isCoordinates
                          ? "text-blue-900"
                          : "text-gray-900"
                      }`}
                    >
                      {location.isCoordinates
                        ? location.name
                        : location.name.split(",")[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {location.isCoordinates
                        ? "Geographic Coordinates"
                        : location.address}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optimized No Results Message */}
        {showDropdown &&
          !isLoading &&
          searchQuery.length >= 3 &&
          suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 animate-in fade-in duration-200">
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {isLatLongFormat(searchQuery)
                  ? "Invalid coordinates format. Use: latitude, longitude"
                  : `No locations found for "${searchQuery}"`}
              </div>
            </div>
          )}
      </div>
    );
  }
);

LocationSearch.displayName = "LocationSearch";

export default LocationSearch;
