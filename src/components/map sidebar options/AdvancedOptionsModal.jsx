import { useState, useEffect, useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedGeofenceIds,
  setSelectedCategories,
  applyGeofenceFilters,
  resetGeofenceFilters,
  fetchGeofenceForUser,
  fetchGeofenceCatList,
  setShowShapes,
} from "../../features/geofenceSlice";
// Import route actions
import {
  fetchRouteListForUser,
  setSelectedRouteNames,
  applyRouteFilters,
  resetRouteFilters,
} from "../../features/routeSlice";

const AdvancedOptionsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("geofence");
  const [localSelectedGeofenceIds, setLocalSelectedGeofenceIds] = useState(
    new Set()
  );
  const [localSelectedCategories, setLocalSelectedCategories] = useState(
    new Set()
  );
  const [localSelectedRouteNames, setLocalSelectedRouteNames] = useState(
    new Set()
  );

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const {
    userGeofences,
    geofenceCatList,
    selectedGeofenceIds: reduxSelectedIds,
    selectedCategories: reduxSelectedCategories,
    filtersApplied,
    showShapes,
  } = useSelector((state) => state.geofence);

  // Route selectors
  const {
    routes,
    selectedRouteNames: reduxSelectedRouteNames,
    routeFiltersApplied,
    loading: routesLoading,
  } = useSelector((state) => state.route);

  const dispatch = useDispatch();

  // Handle show shapes toggle
  const handleShowShapesToggle = (e) => {
    dispatch(setShowShapes(e.target.checked));
  };

  // ✅ FETCH DATA ON COMPONENT MOUNT - but NOT routes automatically
  useEffect(() => {
    if (!userGeofences || userGeofences.length === 0) {
      dispatch(fetchGeofenceForUser());
    }
    if (!geofenceCatList || geofenceCatList.length === 0) {
      dispatch(fetchGeofenceCatList());
    }
    // ✅ DON'T fetch routes automatically
  }, [dispatch, userGeofences, geofenceCatList]);

  // ✅ FETCH ROUTES ONLY WHEN ROUTE TAB IS CLICKED
  const handleRouteTabClick = () => {
    setActiveTab("route");
    setSearchTerm("");

    // ✅ Fetch routes only when tab is clicked
    if (!routes || routes.length === 0) {
      dispatch(fetchRouteListForUser());
    }
  };

  // Extract categories from geofenceCatList API
  const extractCategoriesFromAPI = (catListData) => {
    if (!catListData || !Array.isArray(catListData)) return [];

    return catListData
      .filter(
        (category) =>
          category.Categoryname && category.Categoryname.trim() !== ""
      )
      .map((category) => ({
        id: category.id,
        name: category.Categoryname,
        color: category.color,
        icon: category.icon,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Extract geofence data from userGeofences API
  const extractGeofenceFromAPI = (userGeofencesData) => {
    if (!userGeofencesData || !Array.isArray(userGeofencesData)) return [];

    return userGeofencesData
      .filter((geofence) => geofence.id && geofence.geofenceName)
      .map((geofence) => ({
        id: geofence.id,
        name: geofence.geofenceName,
        category: geofence.Categoryname,
        categoryValue: geofence.CategoryValue,
        showOnMap: geofence.chkShowOnMap,
        description: geofence.geofenceDescription,
        shapeType: geofence.ShapeType,
        color: geofence.ColorGeoFence,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Extract route data from routes API
  const extractRouteFromAPI = (routesData) => {
    if (!routesData || !Array.isArray(routesData)) return [];

    return routesData
      .filter((route) => route.routeName && route.routeName.trim() !== "")
      .map((route) => ({
        routeName: route.routeName,
        originLatLng: route.originLatLng,
        destinationLatLng: route.destinationLatLng,
        routeString: route.routeString,
        OriginID: route.OriginID,
        DestinationID: route.DestinationID,
      }))
      .sort((a, b) => a.routeName.localeCompare(b.routeName));
  };

  // Get data from APIs
  const categoryData = extractCategoriesFromAPI(geofenceCatList);
  const geofenceData = extractGeofenceFromAPI(userGeofences);
  const routeData = extractRouteFromAPI(routes);

  // MEMOIZED FILTERED DATA FOR PERFORMANCE
  const filteredData = useMemo(() => {
    let currentData;
    if (activeTab === "geofence") {
      currentData = geofenceData;
    } else if (activeTab === "category") {
      currentData = categoryData;
    } else {
      currentData = routeData;
    }

    if (!searchTerm.trim()) {
      return currentData;
    }

    const searchLower = searchTerm.toLowerCase();
    return currentData.filter((item) => {
      if (activeTab === "route") {
        return item.routeName.toLowerCase().includes(searchLower);
      }
      return (
        item.name.toLowerCase().includes(searchLower) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
      );
    });
  }, [activeTab, geofenceData, categoryData, routeData, searchTerm]);

  // Initialize geofence selections
  useEffect(() => {
    if (isOpen && geofenceData.length > 0) {
      if (filtersApplied) {
        setLocalSelectedGeofenceIds(new Set(reduxSelectedIds));
      } else {
        setLocalSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
      }
    }
  }, [isOpen, geofenceData.length, reduxSelectedIds, filtersApplied]);

  // Initialize category selections
  useEffect(() => {
    if (isOpen && categoryData.length > 0) {
      if (filtersApplied) {
        setLocalSelectedCategories(new Set(reduxSelectedCategories));
      } else {
        setLocalSelectedCategories(new Set(categoryData.map((c) => c.name)));
      }
    }
  }, [isOpen, categoryData.length, reduxSelectedCategories, filtersApplied]);

  // ✅ Initialize route selections
  useEffect(() => {
    if (isOpen && routeData.length > 0) {
      if (routeFiltersApplied) {
        setLocalSelectedRouteNames(new Set(reduxSelectedRouteNames));
      } else {
        setLocalSelectedRouteNames(new Set(routeData.map((r) => r.routeName)));
      }
    }
  }, [isOpen, routeData.length, reduxSelectedRouteNames, routeFiltersApplied]);

  if (!isOpen) return null;

  // SELECT ALL FUNCTION
  const handleSelectAll = () => {
    if (activeTab === "geofence") {
      // Always select all from full data, not just filtered/search results
      setLocalSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
    } else if (activeTab === "category") {
      // Always select all from full data, not just filtered/search results
      setLocalSelectedCategories(new Set(categoryData.map((c) => c.name)));
    } else {
      // Route tab: Always select all from full data, not just filtered/search results
      setLocalSelectedRouteNames(new Set(routeData.map((r) => r.routeName)));
    }
  };

  // DESELECT ALL FUNCTION
  const handleDeselectAll = () => {
    if (activeTab === "geofence") {
      // Always deselect all from full data, not just filtered/search results
      setLocalSelectedGeofenceIds(new Set());
    } else if (activeTab === "category") {
      // Always deselect all from full data, not just filtered/search results
      setLocalSelectedCategories(new Set());
    } else {
      // Route tab: Always deselect all from full data, not just filtered/search results
      setLocalSelectedRouteNames(new Set());
    }
  };

  // TOGGLE INDIVIDUAL ITEM
  const handleItemToggle = (item) => {
    if (activeTab === "geofence") {
      const newSelected = new Set(localSelectedGeofenceIds);
      const itemId = typeof item === "object" ? item.id : item;

      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }

      setLocalSelectedGeofenceIds(newSelected);
    } else if (activeTab === "category") {
      const newSelected = new Set(localSelectedCategories);
      const categoryName = typeof item === "object" ? item.name : item;

      if (newSelected.has(categoryName)) {
        newSelected.delete(categoryName);
      } else {
        newSelected.add(categoryName);
      }

      setLocalSelectedCategories(newSelected);
    } else {
      // ✅ Route toggle
      const newSelected = new Set(localSelectedRouteNames);
      const routeName = typeof item === "object" ? item.routeName : item;

      if (newSelected.has(routeName)) {
        newSelected.delete(routeName);
      } else {
        newSelected.add(routeName);
      }

      setLocalSelectedRouteNames(newSelected);
    }
  };

  // ✅ SAVE SETTINGS FUNCTION - Updated logic
  const handleSaveSettings = () => {
    const selectedIdArray = Array.from(localSelectedGeofenceIds);
    const selectedCategoryArray = Array.from(localSelectedCategories);
    const selectedRouteArray = Array.from(localSelectedRouteNames);

    // Dispatch all selections
    dispatch(setSelectedGeofenceIds(selectedIdArray));
    dispatch(setSelectedCategories(selectedCategoryArray));
    dispatch(setSelectedRouteNames(selectedRouteArray)); // ✅ This will update routemap automatically

    // Apply filters logic
    const nothingSelected =
      selectedIdArray.length === 0 ||
      selectedCategoryArray.length === 0 ||
      selectedRouteArray.length === 0;

    const allGeofencesSelected = selectedIdArray.length === geofenceData.length;
    const allCategoriesSelected =
      selectedCategoryArray.length === categoryData.length;
    const allRoutesSelected = selectedRouteArray.length === routeData.length;

    if (nothingSelected) {
      dispatch(applyGeofenceFilters());
      dispatch(applyRouteFilters());
    } else if (
      allGeofencesSelected &&
      allCategoriesSelected &&
      allRoutesSelected
    ) {
      dispatch(resetGeofenceFilters());
      dispatch(resetRouteFilters());
    } else {
      dispatch(applyGeofenceFilters());
      dispatch(applyRouteFilters());
    }

    onClose();
  };

  // CURRENT DATA AND SELECTED LOGIC
  const getCurrentSelected = () => {
    if (activeTab === "geofence") {
      return localSelectedGeofenceIds;
    } else if (activeTab === "category") {
      return localSelectedCategories;
    } else {
      return localSelectedRouteNames;
    }
  };

  const currentSelected = getCurrentSelected();
  const safeCurrentSelected =
    currentSelected instanceof Set ? currentSelected : new Set();

  // Count selected from full data, not just filtered
  const selectedCount = (activeTab === "geofence")
    ? geofenceData.filter((item) => safeCurrentSelected.has(item.id)).length
    : activeTab === "category"
    ? categoryData.filter((item) => safeCurrentSelected.has(item.name)).length
    : routeData.filter((item) => safeCurrentSelected.has(item.routeName)).length;

  // Always show full data count after 'of'
  const totalCount = activeTab === "geofence"
    ? geofenceData.length
    : activeTab === "category"
    ? categoryData.length
    : routeData.length;

  // Row renderer for react-window (Geofence)
  const renderGeofenceRow = useCallback(
    ({ index, style }) => {
      const item = filteredData[index];
      return (
        <div
          key={item.id}
          style={style}
          className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors react-window-list-item"
        >
          <input
            type="checkbox"
            id={`item-geofence-${item.id}`}
            checked={safeCurrentSelected.has(item.id)}
            onChange={() => handleItemToggle(item)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor={`item-geofence-${item.id}`}
            className="ml-3 flex-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
              </div>
            </div>
          </label>
        </div>
      );
    },
    [filteredData, safeCurrentSelected, handleItemToggle]
  );

  // Row renderer for react-window (Category)
  const renderCategoryRow = useCallback(
    ({ index, style }) => {
      const item = filteredData[index];
      // Count geofences for this category
      const geofenceCountForCategory = geofenceData.filter(
        (geofence) => geofence.category === item.name
      ).length;

      return (
        <div
          key={item.id || index}
          style={style}
          className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors react-window-list-item"
        >
          <input
            type="checkbox"
            id={`item-category-${item.id || index}`}
            checked={safeCurrentSelected.has(item.name)}
            onChange={() => handleItemToggle(item)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor={`item-category-${item.id || index}`}
            className="ml-3 flex-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {geofenceCountForCategory}
                </span>
              </div>
            </div>
          </label>
        </div>
      );
    },
    [filteredData, safeCurrentSelected, handleItemToggle, geofenceData]
  );

  // Row renderer for react-window (Route)
  const renderRouteRow = useCallback(
    ({ index, style }) => {
      const item = filteredData[index];
      return (
        <div
          key={item.routeName}
          style={style}
          className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors react-window-list-item"
        >
          <input
            type="checkbox"
            id={`item-route-${item.routeName}`}
            checked={safeCurrentSelected.has(item.routeName)}
            onChange={() => handleItemToggle(item)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor={`item-route-${item.routeName}`}
            className="ml-3 flex-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.routeName}
                </p>
              </div>
            </div>
          </label>
        </div>
      );
    },
    [filteredData, safeCurrentSelected, handleItemToggle]
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[905]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl z-10 mx-4 max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Advanced Options
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab("geofence");
                setSearchTerm("");
              }}
              className={`flex-1 cursor-pointer py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "geofence"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Geofence ({geofenceData.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("category");
                setSearchTerm("");
              }}
              className={`flex-1 cursor-pointer py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "category"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Category ({categoryData.length})
            </button>
            {/* ✅ ROUTE TAB - with API call on click */}
            <button
              onClick={handleRouteTabClick}
              className={`flex-1 cursor-pointer py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "route"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={routesLoading}
            >
              {routesLoading ? "Loading..." : `Routes (${routeData.length})`}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Filter heading and controls */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            {/* Search Box */}
            <div className="mb-2">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "geofence"
                    ? "geofences"
                    : activeTab === "category"
                    ? "categories"
                    : "routes"
                }...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 cursor-pointer text-xs rounded-md"
                  style={{ background: "#25689f", color: "white" }}
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 bg-gray-600 text-white cursor-pointer text-xs rounded-md hover:bg-gray-700 transition-colors"
                >
                  Deselect All
                </button>
              </div>

              <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                <span className="font-medium">
                  {selectedCount} of {totalCount} selected
                  {searchTerm.trim() && (
                    <span className="ml-2 text-gray-500">(showing {filteredData.length})</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 px-4 py-2">
            {/* ✅ Show loading for routes */}
            {activeTab === "route" && routesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading routes...</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No{" "}
                    {activeTab === "geofence"
                      ? "geofences"
                      : activeTab === "category"
                      ? "categories"
                      : "routes"}{" "}
                    found
                  </p>
                </div>
              </div>
            ) : activeTab === "geofence" ? (
              <div style={{ height: 290, overflow: "auto" }}>
                <List
                  height={290}
                  itemCount={filteredData.length}
                  itemSize={48}
                  width={"100%"}
                  itemData={filteredData}
                  className="react-window-list"
                >
                  {renderGeofenceRow}
                </List>
              </div>
            ) : activeTab === "category" ? (
              <div style={{ height: 290, overflow: "auto" }}>
                <List
                  height={290}
                  itemCount={filteredData.length}
                  itemSize={48}
                  width={"100%"}
                  itemData={filteredData}
                  className="react-window-list"
                >
                  {renderCategoryRow}
                </List>
              </div>
            ) : (
              <div style={{ height: 290, overflow: "auto" }}>
                <List
                  height={290}
                  itemCount={filteredData.length}
                  itemSize={48}
                  width={"100%"}
                  itemData={filteredData}
                  className="react-window-list"
                >
                  {renderRouteRow}
                </List>
              </div>
            )}
          </div>
        </div>

        {/* Show Shapes Toggle - ✅ Hide when route tab is active */}
  {/* Move Show Geofence Shapes to footer row */}

        {/* Modal footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showShapes}
                onChange={handleShowShapesToggle}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Show Geofence Shapes
              </span>
            </label>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-[#25689f] border border-transparent rounded-md hover:bg-[#1d5b8f] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedOptionsModal;
