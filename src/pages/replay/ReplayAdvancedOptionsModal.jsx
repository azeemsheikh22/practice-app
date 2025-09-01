import { useState, useMemo, useCallback, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";

const ReplayAdvancedOptionsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("geofence");
  const [selectedGeofenceIds, setSelectedGeofenceIds] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const showShapes = useSelector((state) => state.replay.showShapes);
  const { geofences } = useSelector((state) => state.replay);
  const { geofenceCatList } = useSelector((state) => state.geofence);

  // Only use real geofence data for geofence tab
  const geofenceData =
    Array.isArray(geofences) && geofences.length > 0 ? geofences : [];
  // Use real category data from geofenceCatList if available
  const categoryData =
    Array.isArray(geofenceCatList) && geofenceCatList.length > 0
      ? geofenceCatList
      : [];

  const filteredData = useMemo(() => {
    let currentData = activeTab === "geofence" ? geofenceData : categoryData;
    if (!searchTerm.trim()) return currentData;
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === "geofence") {
      // Search by geofenceName
      return currentData.filter((item) =>
        (item.geofenceName || "").toLowerCase().includes(searchLower)
      );
    } else {
      // Search by Categoryname
      return currentData.filter((item) =>
        (item.Categoryname || "").toLowerCase().includes(searchLower)
      );
    }
  }, [activeTab, geofenceData, categoryData, searchTerm]);

  // For react-window, itemData is filteredData
  const itemData = filteredData;

  // Get showGeofences from redux
  const showGeofences = useSelector((state) => state.replay.showGeofences);

  // When modal opens, initialize selection from Redux showGeofences
  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(showGeofences) && showGeofences.length > 0) {
        setSelectedGeofenceIds(new Set(showGeofences.map((g) => g.id)));
      } else if (geofenceData.length > 0) {
        setSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
      }
      if (categoryData.length > 0) {
        setSelectedCategories(new Set(categoryData.map((c) => c.Categoryname)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, geofenceData, categoryData, showGeofences, geofences]);

  const handleSelectAll = () => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
    } else {
      setSelectedCategories(new Set(categoryData.map((c) => c.Categoryname)));
    }
  };

  const handleDeselectAll = () => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds(new Set());
    } else {
      setSelectedCategories(new Set());
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
    } else {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(item.Categoryname)) next.delete(item.Categoryname);
        else next.add(item.Categoryname);
        return next;
      });
    }
  };

  const selectedCount = filteredData.filter((item) => {
    if (activeTab === "geofence") return selectedGeofenceIds.has(item.id);
    return selectedCategories.has(item.Categoryname);
  }).length;

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
            className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded"
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

  if (!isOpen) return null;

  // Apply Filters handler: only update showGeofences based on selected geofences
  const handleApplyFilters = () => {
    if (activeTab === "geofence") {
      // Only update showGeofences with selected geofences
      const selectedGeofences = geofenceData.filter((g) =>
        selectedGeofenceIds.has(g.id)
      );
      dispatch({
        type: "replay/setShowGeofences",
        payload: selectedGeofences,
      });
    }
    // Do not update showGeofences for category tab
    onClose();
  };

  // Modal content
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div
        className="absolute inset-0 bg-black/60 z-[9998]"
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
                  {selectedCount} of {filteredData.length} selected
                </span>
              </div>
            </div>
          </div>
          {/* Scrollable list - only the list gets overflow */}
          <div className="flex-1 px-4 py-2">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No {activeTab === "geofence" ? "geofences" : "categories"}{" "}
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
            ) : (
              <div
                className="space-y-1"
                style={{ maxHeight: 290, overflow: "auto" }}
              >
                {filteredData.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`item-category-${item.id || index}`}
                      checked={selectedCategories.has(item.Categoryname)}
                      onChange={() => handleItemToggle(item)}
                      className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded"
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
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Modal footer with Show Geofence Shapes toggle */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showShapes}
                onChange={(e) =>
                  dispatch({
                    type: "replay/setShowShapes",
                    payload: e.target.checked,
                  })
                }
                className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded"
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
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ background: "#25689f" }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReplayAdvancedOptionsModal;
