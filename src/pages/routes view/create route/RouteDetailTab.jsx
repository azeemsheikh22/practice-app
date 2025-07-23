import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, X, GripVertical, Loader, Shield } from "lucide-react";
import CategorySelectionModal from "./CategorySelectionModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchGeofenceCatList } from "../../../features/geofenceSlice";

// Dummy geofence data
const DUMMY_GEOFENCES = [
  {
    id: 1,
    name: "Karachi Main Office",
    lat: 24.8607,
    lng: 67.0011,
    address: "Karachi Main Office, Saddar, Karachi"
  },
  {
    id: 2,
    name: "Lahore Branch",
    lat: 31.5204,
    lng: 74.3587,
    address: "Lahore Branch, Mall Road, Lahore"
  },
  {
    id: 3,
    name: "Islamabad Office",
    lat: 33.6844,
    lng: 73.0479,
    address: "Islamabad Office, Blue Area, Islamabad"
  },
  {
    id: 4,
    name: "Rawalpindi Warehouse",
    lat: 33.5651,
    lng: 73.0169,
    address: "Rawalpindi Warehouse, Saddar, Rawalpindi"
  },
  {
    id: 5,
    name: "Faisalabad Factory",
    lat: 31.4504,
    lng: 73.1350,
    address: "Faisalabad Factory, Industrial Area, Faisalabad"
  },
  {
    id: 6,
    name: "Multan Distribution Center",
    lat: 30.1575,
    lng: 71.5249,
    address: "Multan Distribution Center, Cantt Area, Multan"
  },
  {
    id: 7,
    name: "Peshawar Regional Office",
    lat: 34.0151,
    lng: 71.5249,
    address: "Peshawar Regional Office, University Road, Peshawar"
  },
  {
    id: 8,
    name: "Quetta Branch",
    lat: 30.1798,
    lng: 66.9750,
    address: "Quetta Branch, Jinnah Road, Quetta"
  }
];

const RouteDetailTab = ({ routeForm, setRouteForm, formType = "location" }) => {
  const [draggedItem, setDraggedItem] = React.useState(null);
  const [dragOverIndex, setDragOverIndex] = React.useState(null);

  // Search functionality states
  const [searchStates, setSearchStates] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const searchTimeoutRefs = useRef({});
  const dropdownRefs = useRef({});

  // Add these states after existing states
  const [categoryModalOpen, setCategoryModalOpen] = useState(null); // Track which waypoint's modal is open
  const [waypointCategories, setWaypointCategories] = useState({}); // Store categories for each waypoint

  const dispatch = useDispatch();
  const { geofenceCatList } = useSelector((state) => state.geofence);

  // Add this useEffect to fetch categories
  useEffect(() => {
    if (!geofenceCatList || geofenceCatList.length === 0) {
      dispatch(fetchGeofenceCatList());
    }
  }, [dispatch, geofenceCatList]);

  // Add these functions for category handling
  const handleCategorySelect = (waypointId, category) => {
    setWaypointCategories(prev => ({
      ...prev,
      [waypointId]: category
    }));
    setCategoryModalOpen(null);
  };

  const openCategoryModal = (waypointId) => {
    setCategoryModalOpen(waypointId);
  };

  // Initialize waypoints if not exists (minimum 2 waypoints)
  const initializeWaypoints = () => {
    if (!routeForm.waypoints || routeForm.waypoints.length < 2) {
      setRouteForm({
        ...routeForm,
        waypoints: [
          { id: 1, location: routeForm.startLocation || "" },
          { id: 2, location: routeForm.endLocation || "" },
        ],
      });
    }
  };

  // Initialize waypoints on component mount
  useEffect(() => {
    initializeWaypoints();
  }, []);

  const waypoints = routeForm.waypoints || [
    { id: 1, location: "" },
    { id: 2, location: "" },
  ];

  // LocationSearch functionality (copied from LocationSearch.jsx)
  const isLatLongFormat = useCallback((query) => {
    const latLongPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return latLongPattern.test(query.trim());
  }, []);

  const parseLatLong = useCallback((query) => {
    try {
      const coords = query.split(",").map((coord) => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const [lat, lng] = coords;
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);

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

  // Search geofences function
  const searchGeofences = useCallback((query) => {
    if (!query || query.length < 1) {
      return [];
    }

    const filteredGeofences = DUMMY_GEOFENCES.filter(geofence =>
      geofence.name.toLowerCase().includes(query.toLowerCase()) ||
      geofence.address.toLowerCase().includes(query.toLowerCase())
    );

    return filteredGeofences.map(geofence => ({
      id: geofence.id,
      name: geofence.name,
      lat: geofence.lat,
      lng: geofence.lng,
      type: "geofence",
      address: geofence.address,
      isGeofence: true,
    }));
  }, []);

  const searchLocations = useCallback(
    async (query, waypointId) => {
      if (!query || query.length < 1) {
        setSearchStates((prev) => ({
          ...prev,
          [waypointId]: {
            suggestions: [],
            isLoading: false,
            showDropdown: false,
          },
        }));
        return;
      }

      setSearchStates((prev) => ({
        ...prev,
        [waypointId]: { ...prev[waypointId], isLoading: true },
      }));

      try {
        // If form type is geofence, search geofences
        if (formType === "geofence") {
          const geofenceResults = searchGeofences(query);

          setSearchStates((prev) => ({
            ...prev,
            [waypointId]: {
              suggestions: geofenceResults,
              isLoading: false,
              showDropdown: geofenceResults.length > 0,
            },
          }));
          return;
        }

        // Original location search logic for "location" form type
        if (query.length < 3) {
          setSearchStates((prev) => ({
            ...prev,
            [waypointId]: {
              suggestions: [],
              isLoading: false,
              showDropdown: false,
            },
          }));
          return;
        }

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

            setSearchStates((prev) => ({
              ...prev,
              [waypointId]: {
                suggestions: [latLongSuggestion],
                isLoading: false,
                showDropdown: true,
              },
            }));
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
        setSearchStates((prev) => ({
          ...prev,
          [waypointId]: {
            suggestions: uniqueResults.slice(0, 8),
            isLoading: false,
            showDropdown: uniqueResults.length > 0,
          },
        }));
      } catch (error) {
        console.error("Search error:", error);
        setSearchStates((prev) => ({
          ...prev,
          [waypointId]: {
            suggestions: [],
            isLoading: false,
            showDropdown: false,
          },
        }));
      }
    },
    [
      formType,
      isLatLongFormat,
      parseLatLong,
      searchNominatim,
      searchEsri,
      searchGeofences,
      removeDuplicates,
    ]
  );

  // Add new waypoint
  const addWaypoint = () => {
    const newWaypoint = {
      id: waypoints.length + 1,
      location: "",
    };
    setRouteForm({
      ...routeForm,
      waypoints: [...waypoints, newWaypoint],
    });
  };

  // Remove waypoint (minimum 2 required)
  const removeWaypoint = (waypointId) => {
    if (waypoints.length > 2) {
      const updatedWaypoints = waypoints
        .filter((wp) => wp.id !== waypointId)
        .map((wp, index) => ({ ...wp, id: index + 1 })); // Renumber waypoints

      setRouteForm({
        ...routeForm,
        waypoints: updatedWaypoints,
      });

      // Clean up search state for removed waypoint
      setSearchStates((prev) => {
        const newState = { ...prev };
        delete newState[waypointId];
        return newState;
      });
    }
  };

  // Update waypoint location with search
  const updateWaypoint = (waypointId, location) => {
    const updatedWaypoints = waypoints.map((wp) =>
      wp.id === waypointId ? { ...wp, location } : wp
    );
    setRouteForm({
      ...routeForm,
      waypoints: updatedWaypoints,
    });

    // Handle search
    if (searchTimeoutRefs.current[waypointId]) {
      clearTimeout(searchTimeoutRefs.current[waypointId]);
    }

    const searchDelay = formType === "geofence" ? 100 : 300;
    searchTimeoutRefs.current[waypointId] = setTimeout(() => {
      searchLocations(location, waypointId);
    }, searchDelay);
  };

  // Get dropdown position
  const getDropdownPosition = (waypointId) => {
    const inputElement =
      dropdownRefs.current[waypointId]?.querySelector("input");
    if (!inputElement) return "bottom";

    const rect = inputElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If more space above and not enough space below, show above
    return spaceBelow < 200 && spaceAbove > 200 ? "top" : "bottom";
  };

  // Handle location selection
  const handleLocationClick = (waypointId, location) => {
    const coordinates = `${location.lat.toFixed(6)}, ${location.lng.toFixed(
      6
    )}`;

    const updatedWaypoints = waypoints.map((wp) =>
      wp.id === waypointId ? { ...wp, location: coordinates } : wp
    );

    setRouteForm({
      ...routeForm,
      waypoints: updatedWaypoints,
    });

    // Close dropdown
    setSearchStates((prev) => ({
      ...prev,
      [waypointId]: { suggestions: [], isLoading: false, showDropdown: false },
    }));
    setActiveDropdown(null);
  };

  // Handle input focus
  const handleInputFocus = (waypointId) => {
    setActiveDropdown(waypointId);

    // Set dropdown position
    setDropdownPosition((prev) => ({
      ...prev,
      [waypointId]: getDropdownPosition(waypointId),
    }));

    const currentLocation =
      waypoints.find((wp) => wp.id === waypointId)?.location || "";

    const minLength = formType === "geofence" ? 1 : 3;
    if (currentLocation.length >= minLength) {
      searchLocations(currentLocation, waypointId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].contains(event.target)
      ) {
        setActiveDropdown(null);
        setSearchStates((prev) => ({
          ...prev,
          [activeDropdown]: { ...prev[activeDropdown], showDropdown: false },
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);


  // Replace existing handleDragStart function
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);

    // Create a clean drag image - just hide the default messy one
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImg, 0, 0);

    // Close any open dropdowns during drag
    setActiveDropdown(null);
  };


  // Replace existing handleDragOver function
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Only set drag over index if it's different from dragged item
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverIndex(index);
    }
  };

  // Add this new function
  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverIndex(index);
    }
  };

  // Replace existing handleDragLeave function
  const handleDragLeave = (e) => {
    // Only clear drag over index if we're leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };


  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newWaypoints = [...waypoints];
    const draggedWaypoint = newWaypoints[draggedItem];

    // Remove dragged item
    newWaypoints.splice(draggedItem, 1);

    // Insert at new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newWaypoints.splice(insertIndex, 0, draggedWaypoint);

    // Renumber waypoints
    const renumberedWaypoints = newWaypoints.map((wp, index) => ({
      ...wp,
      id: index + 1,
    }));

    setRouteForm({
      ...routeForm,
      waypoints: renumberedWaypoints,
    });

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6 p-1">
      {/* Route Name Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800 mb-1">
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
          className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
          placeholder="Enter route name"
        />
      </div>

      {/* Waypoints Section */}
      <div className="space-y-4">
        {/* Dynamic Waypoint Inputs */}
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => (
            // Find this div and replace its className:
            <div
              key={waypoint.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}  // Add this line
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              // Find the waypoint div and replace its className:
              className={`relative group cursor-move transition-all duration-200 ${draggedItem === index ? "opacity-50 scale-95" : ""
                } ${dragOverIndex === index && draggedItem !== index
                  ? "border-2 border-blue-400 border-dashed rounded-lg p-2 bg-blue-50"
                  : ""
                } ${activeDropdown === waypoint.id ? "z-[10000]" : "z-10"}`}

              ref={(el) => (dropdownRefs.current[waypoint.id] = el)}
            >

              <div className="flex items-center space-x-3">
                {/* Drag Handle */}

                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors">
                  <GripVertical
                    size={16}
                    className="text-gray-400 hover:text-gray-600"
                  />
                </div>


                {/* Waypoint Number */}
                <div className={`flex-shrink-0 w-8 h-8 ${formType === "geofence"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
                  } text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md`}>
                  {waypoint.id}
                </div>

          
                {/* Location Input with Search */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={waypoint.location}
                    onChange={(e) =>
                      updateWaypoint(waypoint.id, e.target.value)
                    }
                    onFocus={() => handleInputFocus(waypoint.id)}
                    className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                    placeholder={
                      formType === "geofence"
                        ? "Search geofence areas..."
                        : "Search location..."
                    }
                  />

                  {/* Loading Spinner */}
                  {searchStates[waypoint.id]?.isLoading && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                  )}

                  {/* Select Category Button - Below Input */}
                  <button
                    onClick={() => openCategoryModal(waypoint.id)}
                    className={`mt-2 w-full px-2 text-xs font-medium cursor-pointer rounded text-left transition-all duration-200 ${waypointCategories[waypoint.id]
                      ? formType === "geofence"
                        ? "  text-green-700 "
                        : "  text-blue-700 "
                      : "  text-gray-600 "
                      }`}
                  >
                    <span className="block truncate">
                      {waypointCategories[waypoint.id]
                        ? `📂 ${waypointCategories[waypoint.id].Categoryname}`
                        : "📂 Select Category"
                      }
                    </span>
                  </button>


                  {/* Search Dropdown - Fixed z-index */}
                  <AnimatePresence>
                    {activeDropdown === waypoint.id &&
                      searchStates[waypoint.id]?.showDropdown &&
                      searchStates[waypoint.id]?.suggestions?.length > 0 && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y:
                              dropdownPosition[waypoint.id] === "top"
                                ? 10
                                : -10,
                            scale: 0.95,
                          }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y:
                              dropdownPosition[waypoint.id] === "top"
                                ? 10
                                : -10,
                            scale: 0.95,
                          }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto ${dropdownPosition[waypoint.id] === "top"
                            ? "bottom-full mb-1"
                            : "top-full mt-1"
                            }`}
                          style={{
                            zIndex: 10001,
                            position: "absolute",
                          }}
                        >
                          {searchStates[waypoint.id].suggestions.map(
                            (location, idx) => (
                              <motion.div
                                key={location.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() =>
                                  handleLocationClick(waypoint.id, location)
                                }
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {location.isGeofence ? (
                                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                        <Shield className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    ) : location.isCoordinates ? (
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                      </div>
                                    ) : (
                                      <MapPin className="w-4 h-4 text-blue-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {location.isCoordinates
                                        ? `📍 ${location.lat.toFixed(
                                          6
                                        )}, ${location.lng.toFixed(6)}`
                                        : location.name.split(",")[0]}
                                    </p>
                                    {!location.isCoordinates && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {location.address}
                                      </p>
                                    )}
                                    {location.isGeofence && (
                                      <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          <Shield className="w-3 h-3 mr-1" />
                                          Geofence
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          )}
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>



                {/* Remove Button (only show if more than 2 waypoints) */}
                {waypoints.length > 2 && (
                  <button
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="flex-shrink-0 w-8 h-8 bg-red-100 cursor-pointer hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Connection Line (except for last waypoint) */}
              {index < waypoints.length - 1 && (
                <div className={`ml-10 w-0.5 h-4 ${formType === "geofence"
                  ? "bg-gradient-to-b from-green-300 to-green-200"
                  : "bg-gradient-to-b from-gray-300 to-gray-200"
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Add Waypoint Button - Lower z-index */}
        <button
          onClick={addWaypoint}
          className={`w-full py-3 border-2 cursor-pointer border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 group relative z-0 ${formType === "geofence"
            ? "hover:border-green-400 hover:text-green-600 hover:bg-green-50"
            : "hover:border-blue-400"
            }`}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          <span className="text-sm font-medium">Add Waypoint</span>
        </button>
      </div>

      <CategorySelectionModal
        isOpen={categoryModalOpen !== null}
        onClose={() => setCategoryModalOpen(null)}
        onSelect={(category) => handleCategorySelect(categoryModalOpen, category)}
        selectedCategory={categoryModalOpen ? waypointCategories[categoryModalOpen] : null}
      />
    </div>
  );
};

export default RouteDetailTab;


