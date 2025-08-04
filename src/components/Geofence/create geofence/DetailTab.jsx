import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, MapPin, Loader, X } from "lucide-react";
import TreeSelect from "./TreeSelect";
import { fetchGeofenceCatList, setSelectedCategoryForDrawing } from "../../../features/geofenceSlice";
import {
  searchLocations,
  clearSearchResults,
  setSelectedLocation,
} from "../../../features/locationSearchSlice";

const DetailTab = ({ detailForm, setDetailForm, editMode, editGeofenceData }) => {

  // Edit mode: agar editMode true hai aur editGeofenceData aaye to form autofill karo
  useEffect(() => {
    if (
      editMode &&
      editGeofenceData &&
      Array.isArray(editGeofenceData) &&
      editGeofenceData.length > 0
    ) {
      const data = editGeofenceData[0];
      setDetailForm((prev) => ({
        ...prev,
        geofenceName: data.geofenceName || "",
        address: data.address || "",
        group: data.group_id || "",
        city: data.city || "",
        category: data.CategoryValue ? data.CategoryValue.toString() : "",
        description: data.geofenceDescription || "",
      }));
    }
  }, [editMode, editGeofenceData, setDetailForm]);
  const dispatch = useDispatch();

  // Get geofence category list
  const { geofenceCatList, geofenceCatListLoading, geofenceCatListError, selectedCategoryForDrawing } =
    useSelector((state) => state.geofence);

  // Get location search data
  const { searchResults, loading: locationLoading } = useSelector(
    (state) => state.locationSearch
  );


  // Custom dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Address search states
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressSearchTimeout, setAddressSearchTimeout] = useState(null);
  const addressDropdownRef = useRef(null);

  // Fetch category list on component mount
  useEffect(() => {
    dispatch(fetchGeofenceCatList());
  }, [dispatch]);

  // ✅ NEW: Sync selectedCategoryForDrawing with detailForm.category
  useEffect(() => {
    if (selectedCategoryForDrawing && !detailForm.category) {
      setDetailForm(prev => ({
        ...prev,
        category: selectedCategoryForDrawing.id.toString(),
      }));
    }
  }, [selectedCategoryForDrawing, detailForm.category, setDetailForm]);

  // ✅ NEW: Set default UnCategorized when categories load
  useEffect(() => {
    if (geofenceCatList && geofenceCatList.length > 0 && !detailForm.category && !selectedCategoryForDrawing) {
      const unCategorized = geofenceCatList.find(
        (cat) => cat.Categoryname === "UnCategorized"
      );
      if (unCategorized) {
        setDetailForm(prev => ({
          ...prev,
          category: unCategorized.id.toString(),
        }));
        dispatch(setSelectedCategoryForDrawing(unCategorized));
      }
    }
  }, [geofenceCatList, detailForm.category, selectedCategoryForDrawing, setDetailForm, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target)
      ) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle address search with debounce
  const handleAddressSearch = (query) => {
    if (addressSearchTimeout) {
      clearTimeout(addressSearchTimeout);
    }

    const timeout = setTimeout(() => {
      if (query && query.length >= 3) {
        dispatch(searchLocations(query));
        setShowAddressDropdown(true);
      } else {
        dispatch(clearSearchResults());
        setShowAddressDropdown(false);
      }
    }, 300);

    setAddressSearchTimeout(timeout);
  };

  // Get selected category details
  const getSelectedCategory = () => {
    if (!detailForm.category || !geofenceCatList) return null;
    return geofenceCatList.find(
      (cat) => cat.id.toString() === detailForm.category.toString()
    );
  };

  // Handle address location selection
  const handleAddressLocationSelect = (location) => {
    setDetailForm({
      ...detailForm,
      address: location.display_name || location.address,
      addressCoordinates: {
        lat: location.lat,
        lon: location.lon,
      },
    });

    const coordinates = {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      display_name: location.display_name || location.address,
      type: "address_search",
    };
    dispatch(setSelectedLocation(coordinates));

    setShowAddressDropdown(false);
    dispatch(clearSearchResults());
  };

  // Function to check if input is coordinates
  const isCoordinateFormat = (query) => {
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(query.trim());
  };

  // Parse coordinates from string
  const parseCoordinates = (query) => {
    try {
      const coords = query.split(",").map((coord) => parseFloat(coord.trim()));
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
  };

  // Handle address input change
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setDetailForm({
      ...detailForm,
      address: value,
    });

    // Check if input is coordinates
    if (isCoordinateFormat(value)) {
      const coords = parseCoordinates(value);
      if (coords) {
        const coordinates = {
          lat: coords.lat,
          lon: coords.lng,
          display_name: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
          type: "coordinates",
        };
        dispatch(setSelectedLocation(coordinates));
        setShowAddressDropdown(false);
        return;
      }
    }

    // Regular search
    handleAddressSearch(value);
  };

  const selectedCategory = getSelectedCategory();

  // Handle category selection
  const handleCategorySelect = (category) => {
    setDetailForm({
      ...detailForm,
      category: category.id.toString(),
    });
    setIsDropdownOpen(false);

    // ✅ Redux mein selected category update karo
    dispatch(setSelectedCategoryForDrawing(category));
  };

  // Handle address input focus
  const handleAddressInputFocus = () => {
    if (detailForm.address && detailForm.address.length >= 3) {
      handleAddressSearch(detailForm.address);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Address Field with Custom Search Dropdown */}
      <div className="relative" ref={addressDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={detailForm.address}
            onChange={handleAddressInputChange}
            onFocus={handleAddressInputFocus}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f]"
            placeholder="Enter address"
          />

          {/* Loading indicator */}
          {locationLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader size={16} className="animate-spin text-gray-400" />
            </div>
          )}

          {/* Clear button */}
          {detailForm.address && !locationLoading && (
            <button
              type="button"
              onClick={() => {
                setDetailForm({ ...detailForm, address: "" });
                setShowAddressDropdown(false);
                dispatch(clearSearchResults());
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Address Search Dropdown */}
        {showAddressDropdown && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleAddressLocationSelect(location)}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start">
                  <MapPin
                    size={16}
                    className="mt-1 mr-3 flex-shrink-0 text-gray-400"
                  />
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {location.display_name?.split(",")[0] ||
                        location.address?.split(",")[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {location.display_name || location.address}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showAddressDropdown &&
          !locationLoading &&
          detailForm.address.length >= 3 &&
          searchResults &&
          searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <div className="px-3 py-3 text-sm text-gray-500 text-center">
                No locations found for "{detailForm.address}"
              </div>
            </div>
          )}
      </div>

      {/* Group Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Group
        </label>
        <TreeSelect
          value={detailForm.group}
          onChange={(value) =>
            setDetailForm({
              ...detailForm,
              group: value,
            })
          }
          placeholder="Select group"
        />
      </div>

      {/* Geofence Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Geofence Name
        </label>
        <input
          type="text"
          value={detailForm.geofenceName}
          onChange={(e) =>
            setDetailForm({
              ...detailForm,
              geofenceName: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f]"
          placeholder="Enter geofence name"
        />
      </div>

      {/* City Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          value={detailForm.city}
          onChange={(e) =>
            setDetailForm({
              ...detailForm,
              city: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f]"
          placeholder="Enter city"
        />
      </div>

      {/* Custom Category Dropdown with Icons and Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={geofenceCatListLoading}
            className="w-full px-3 py-2 cursor-pointer border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 flex-1">
              {geofenceCatListLoading ? (
                <span className="text-gray-500">Loading categories...</span>
              ) : selectedCategory ? (
                <>
                  {/* Selected Category Icon */}
                  <div className="flex-shrink-0">
                    <img
                      src={`/icons/${selectedCategory.icon}`}
                      alt={selectedCategory.Categoryname}
                      className="w-5 h-5 rounded"
                      onError={(e) => {
                        e.target.src = "/icons/default-geofence.png";
                      }}
                    />
                  </div>

                  {/* Selected Category Color */}
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: `#${selectedCategory.color}` }}
                  ></div>

                  {/* Selected Category Name */}
                  <span className="text-gray-900 font-medium truncate">
                    {selectedCategory.Categoryname}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Select category</span>
              )}
            </div>

            {/* Dropdown Arrow */}
            <div className="flex-shrink-0 ml-2">
              {isDropdownOpen ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {geofenceCatListError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  Error loading categories: {geofenceCatListError}
                </div>
              ) : geofenceCatList && geofenceCatList.length > 0 ? (
                <>
                  {/* Clear Selection Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setDetailForm({
                        ...detailForm,
                        category: "",
                      });
                      dispatch(setSelectedCategoryForDrawing(null));
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                  >
                    <span className="text-gray-500 italic">
                      Clear selection
                    </span>
                  </button>

                  {/* Category Options */}
                  {geofenceCatList.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center gap-3 ${selectedCategory?.id === category.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                        }`}
                    >
                      {/* Category Icon */}
                      <div className="flex-shrink-0">
                        <img
                          src={`/icons/${category.icon}`}
                          alt={category.Categoryname}
                          className="w-5 h-5 rounded"
                          onError={(e) => {
                            e.target.src = "/icons/default-geofence.png";
                          }}
                        />
                      </div>

                      {/* Category Color */}
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: `#${category.color}` }}
                      ></div>

                      {/* Category Name */}
                      <span className="text-gray-900 font-medium truncate flex-1">
                        {category.Categoryname}
                      </span>

                      {/* Selected Indicator */}
                      {selectedCategory?.id === category.id && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No categories available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error state */}
        {geofenceCatListError && (
          <div className="mt-2 text-sm text-red-600">
            Error loading categories: {geofenceCatListError}
          </div>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={detailForm.description}
          onChange={(e) =>
            setDetailForm({
              ...detailForm,
              description: e.target.value,
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] resize-none"
          placeholder="Enter description (optional)"
        />
      </div>
    </motion.div>
  );
};

export default DetailTab;

