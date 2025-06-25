import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader, X, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchLocations,
  clearSearchResults,
} from "../../../features/locationSearchSlice";

const RouteDetailTab = ({ routeForm, setRouteForm }) => {
  const dispatch = useDispatch();
  
  // Get location search data
  const { searchResults, loading: locationLoading } = useSelector(
    (state) => state.locationSearch
  );

  // Search states
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [startSearchTimeout, setStartSearchTimeout] = useState(null);
  const [endSearchTimeout, setEndSearchTimeout] = useState(null);
  
  const startDropdownRef = useRef(null);
  const endDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDropdownRef.current && !startDropdownRef.current.contains(event.target)) {
        setShowStartDropdown(false);
      }
      if (endDropdownRef.current && !endDropdownRef.current.contains(event.target)) {
        setShowEndDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search with debounce
  const handleLocationSearch = (query, setDropdown, setTimeoutState) => {
    if (setTimeoutState.current) {
      clearTimeout(setTimeoutState.current);
    }

    const timeout = setTimeout(() => {
      if (query && query.length >= 3) {
        dispatch(searchLocations(query));
        setDropdown(true);
      } else {
        dispatch(clearSearchResults());
        setDropdown(false);
      }
    }, 300);

    setTimeoutState.current = timeout;
  };

  // Handle location selection
  const handleLocationSelect = (location, field) => {
    setRouteForm({
      ...routeForm,
      [field]: location.display_name || location.address,
      [`${field}Coordinates`]: {
        lat: location.lat,
        lon: location.lon,
      },
    });

    if (field === 'startLocation') {
      setShowStartDropdown(false);
    } else {
      setShowEndDropdown(false);
    }
    dispatch(clearSearchResults());
  };

  // Add waypoint
  const addWaypoint = () => {
    setRouteForm({
      ...routeForm,
      waypoints: [...routeForm.waypoints, ""],
    });
  };

  // Remove waypoint
  const removeWaypoint = (index) => {
    const newWaypoints = routeForm.waypoints.filter((_, i) => i !== index);
    setRouteForm({
      ...routeForm,
      waypoints: newWaypoints,
    });
  };

  // Update waypoint
  const updateWaypoint = (index, value) => {
    const newWaypoints = [...routeForm.waypoints];
    newWaypoints[index] = value;
    setRouteForm({
      ...routeForm,
      waypoints: newWaypoints,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Route Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Route Name
        </label>
        <input
          type="text"
          value={routeForm.routeName}
          onChange={(e) =>
            setRouteForm({
              ...routeForm,
              routeName: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter route name"
        />
      </div>

      {/* Start Location Field */}
      <div className="relative" ref={startDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Location
        </label>
        <div className="relative">
          <input
            type="text"
            value={routeForm.startLocation}
            onChange={(e) => {
              setRouteForm({ ...routeForm, startLocation: e.target.value });
              handleLocationSearch(e.target.value, setShowStartDropdown, { current: startSearchTimeout });
            }}
            onFocus={() => {
              if (routeForm.startLocation && routeForm.startLocation.length >= 3) {
                handleLocationSearch(routeForm.startLocation, setShowStartDropdown, { current: startSearchTimeout });
              }
            }}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter start location"
          />

          {locationLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader size={16} className="animate-spin text-gray-400" />
            </div>
          )}

          {routeForm.startLocation && !locationLoading && (
            <button
              type="button"
              onClick={() => {
                setRouteForm({ ...routeForm, startLocation: "" });
                setShowStartDropdown(false);
                dispatch(clearSearchResults());
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Start Location Dropdown */}
        {showStartDropdown && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleLocationSelect(location, 'startLocation')}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start">
                  <MapPin size={16} className="mt-1 mr-3 flex-shrink-0 text-gray-400" />
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {location.display_name?.split(",")[0] || location.address?.split(",")[0]}
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
      </div>

      {/* End Location Field */}
      <div className="relative" ref={endDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Location
        </label>
        <div className="relative">
          <input
            type="text"
            value={routeForm.endLocation}
            onChange={(e) => {
              setRouteForm({ ...routeForm, endLocation: e.target.value });
              handleLocationSearch(e.target.value, setShowEndDropdown, { current: endSearchTimeout });
            }}
            onFocus={() => {
              if (routeForm.endLocation && routeForm.endLocation.length >= 3) {
                handleLocationSearch(routeForm.endLocation, setShowEndDropdown, { current: endSearchTimeout });
              }
            }}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter end location"
          />

          {locationLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader size={16} className="animate-spin text-gray-400" />
            </div>
          )}

          {routeForm.endLocation && !locationLoading && (
            <button
              type="button"
              onClick={() => {
                setRouteForm({ ...routeForm, endLocation: "" });
                setShowEndDropdown(false);
                dispatch(clearSearchResults());
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* End Location Dropdown */}
        {showEndDropdown && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleLocationSelect(location, 'endLocation')}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start">
                  <MapPin size={16} className="mt-1 mr-3 flex-shrink-0 text-gray-400" />
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {location.display_name?.split(",")[0] || location.address?.split(",")[0]}
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
      </div>

      {/* Waypoints Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Waypoints (Optional)
          </label>
          <button
            type="button"
            onClick={addWaypoint}
            className="flex items-center text-sm text-blue-500 hover:text-blue-600"
          >
            <Plus size={14} className="mr-1" />
            Add Waypoint
          </button>
        </div>

        {routeForm.waypoints.map((waypoint, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={waypoint}
              onChange={(e) => updateWaypoint(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Waypoint ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeWaypoint(index)}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Route Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Route Type
        </label>
        <select
          value={routeForm.routeType}
          onChange={(e) =>
            setRouteForm({
              ...routeForm,
              routeType: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="fastest">Fastest Route</option>
          <option value="shortest">Shortest Route</option>
          <option value="avoid-highways">Avoid Highways</option>
          <option value="avoid-tolls">Avoid Tolls</option>
        </select>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Type
        </label>
        <select
          value={routeForm.vehicleType}
          onChange={(e) =>
            setRouteForm({
              ...routeForm,
              vehicleType: e.target.value,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="car">Car</option>
          <option value="truck">Truck</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="bicycle">Bicycle</option>
          <option value="walking">Walking</option>
        </select>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={routeForm.description}
          onChange={(e) =>
            setRouteForm({
              ...routeForm,
              description: e.target.value,
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Enter route description (optional)"
        />
      </div>
    </motion.div>
  );
};

export default RouteDetailTab;
