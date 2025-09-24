import { useState, useMemo, useCallback, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

const SelectedPlaceModal = ({ isOpen, onClose, onConfirm, initialSelections = {} }) => {
  const [activeTab, setActiveTab] = useState("geofence");
  const [selectedGeofenceIds, setSelectedGeofenceIds] = useState(new Set(initialSelections.geofences || []));
  const [selectedCategories, setSelectedCategories] = useState(new Set(initialSelections.categories || []));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState(new Set(initialSelections.routes || []));
  const { geofences } = useSelector((state) => state.replay);
  const { categories } = useSelector((state) => state.replay);
  const { geofenceCatList } = useSelector((state) => state.geofence);
  const { routes, loading } = useSelector((state) => state.route);

  // Only use real geofence data for geofence tab
  const geofenceData =
    Array.isArray(geofences) && geofences.length > 0 ? geofences : [];
  // Use categories from replay slice if available, otherwise use geofenceCatList
  const categoryData =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : Array.isArray(geofenceCatList) && geofenceCatList.length > 0
      ? geofenceCatList
      : [];

  const filteredData = useMemo(() => {
    let currentData;
    if (activeTab === "geofence") {
      currentData = geofenceData;
    } else if (activeTab === "category") {
      currentData = categoryData;
    } else {
      currentData = Array.isArray(routes) ? routes : [];
    }
    if (!searchTerm.trim()) return currentData;
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === "geofence") {
      return currentData.filter((item) =>
        (item.geofenceName || "").toLowerCase().includes(searchLower)
      );
    } else if (activeTab === "category") {
      return currentData.filter((item) =>
        (item.Categoryname || "").toLowerCase().includes(searchLower)
      );
    } else {
      return currentData.filter((item) =>
        (item.routeName || "").toLowerCase().includes(searchLower)
      );
    }
  }, [activeTab, geofenceData, categoryData, routes, searchTerm]);

  // For react-window, itemData is filteredData
  const itemData = filteredData;

  useEffect(() => {
    if (isOpen) {
      // Initialize with passed selections
      setSelectedGeofenceIds(new Set(initialSelections.geofences || []));
      setSelectedCategories(new Set(initialSelections.categories || []));
      setSelectedRoutes(new Set(initialSelections.routes || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSelections]);

  const handleSelectAll = () => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
    } else if (activeTab === "category") {
      setSelectedCategories(new Set(categoryData.map((c) => c.Categoryname)));
    } else {
      setSelectedRoutes(
        new Set((Array.isArray(routes) ? routes : []).map((r) => r.routeName))
      );
    }
  };

  const handleDeselectAll = () => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds(new Set());
    } else if (activeTab === "category") {
      setSelectedCategories(new Set());
    } else {
      setSelectedRoutes(new Set());
    }
  };

  const handleItemToggle = (item) => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
    } else if (activeTab === "category") {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(item.Categoryname)) next.delete(item.Categoryname);
        else next.add(item.Categoryname);
        return next;
      });
    } else {
      setSelectedRoutes((prev) => {
        const next = new Set(prev);
        if (next.has(item.routeName)) next.delete(item.routeName);
        else next.add(item.routeName);
        return next;
      });
    }
  };

  // Count selected from full data, not just filtered
  const selectedRoutesArr = Array.isArray(selectedRoutes)
    ? selectedRoutes
    : Array.from(selectedRoutes);
  const selectedCount =
    activeTab === "geofence"
      ? geofenceData.filter((item) => selectedGeofenceIds.has(item.id)).length
      : activeTab === "category"
      ? categoryData.filter((item) => selectedCategories.has(item.Categoryname))
          .length
      : (Array.isArray(routes) ? routes : []).filter((item) =>
          selectedRoutesArr.includes(item.routeName)
        ).length;

  const totalCount =
    activeTab === "geofence"
      ? geofenceData.length
      : activeTab === "category"
      ? categoryData.length
      : Array.isArray(routes)
      ? routes.length
      : 0;

  // Row renderer for react-window
  const renderGeofenceRow = useCallback(
    ({ index, style }) => {
      const item = itemData[index];
      return (
        <div
          key={item.id}
          style={style}
          className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors react-window-list-item"
        >
          <input
            type="checkbox"
            id={`item-geofence-${item.id}`}
            checked={selectedGeofenceIds.has(item.id)}
            onChange={() => handleItemToggle(item)}
            className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor={`item-geofence-${item.id}`}
            className="ml-3 flex-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.geofenceName}
                </p>
              </div>
            </div>
          </label>
        </div>
      );
    },
    [itemData, selectedGeofenceIds, handleItemToggle]
  );

  // Route row renderer for react-window
  const renderRouteRow = useCallback(
    ({ index, style }) => {
      const item = itemData[index];
      return (
        <div
          key={item.id || item.routeName}
          style={style}
          className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors react-window-list-item"
        >
          <input
            type="checkbox"
            id={`item-route-${item.routeName}`}
            checked={selectedRoutesArr.includes(item.routeName)}
            onChange={() => handleItemToggle(item)}
            className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded cursor-pointer"
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
    [itemData, selectedRoutesArr, handleItemToggle]
  );

  if (!isOpen) return null;

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      ></div>
      <motion.div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl z-[10000] mx-4 max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Select Geofence/Route
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
            <button
              onClick={() => {
                setActiveTab("route");
                setSearchTerm("");
              }}
              className={`flex-1 cursor-pointer py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "route"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Routes ({Array.isArray(routes) ? routes.length : 0})
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Filter heading and controls */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            {/* Search Box */}
            <div className="mb-2">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "geofence" ? "geofences" : "categories"
                }...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-transparent"
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
                    <span className="ml-2 text-gray-500">
                      (showing {filteredData.length})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          {/* Scrollable list - only the list gets overflow */}
          <div className="flex-1 px-4 py-2">
            {activeTab === "route" && loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-spin">
                    {/* Simple loader spinner */}
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-blue-600 font-medium">Loading routes...</p>
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
              <div
                className="space-y-1"
                style={{ maxHeight: 290, overflow: "auto" }}
              >
                {filteredData.map((item, index) => {
                  // Count geofences for this category
                  const geofenceCountForCategory = geofenceData.filter(
                    (geofence) => geofence.Categoryname === item.Categoryname
                  ).length;
                  return (
                    <div
                      key={item.id || index}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`item-category-${item.id || index}`}
                        checked={selectedCategories.has(item.Categoryname)}
                        onChange={() => handleItemToggle(item)}
                        className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded cursor-pointer"
                      />
                      <label
                        htmlFor={`item-category-${item.id || index}`}
                        className="ml-3 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.Categoryname}
                            </p>
                          </div>
                  
                        </div>
                      </label>
                    </div>
                  );
                })}
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
        {/* Modal footer with Show Geofence Shapes toggle */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const selectedData = {
                    geofences: Array.from(selectedGeofenceIds),
                    categories: Array.from(selectedCategories), 
                    routes: Array.from(selectedRoutes),
                    geofenceNames: geofenceData.filter(g => selectedGeofenceIds.has(g.id)).map(g => g.geofenceName),
                    categoryNames: Array.from(selectedCategories),
                    routeNames: Array.from(selectedRoutes)
                  };
                  onConfirm && onConfirm(selectedData);
                  onClose();
                }}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ background: "#25689f" }}
              >
               Confirm
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SelectedPlaceModal;
