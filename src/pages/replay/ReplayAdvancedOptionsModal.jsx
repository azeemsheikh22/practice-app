import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Settings } from "lucide-react";

const dummyGeofences = [
  { id: 1, name: "Geofence A", category: "Zone 1", color: "#25689f" },
  { id: 2, name: "Geofence B", category: "Zone 2", color: "#10b981" },
  { id: 3, name: "Geofence C", category: "Zone 1", color: "#ef4444" },
];
const dummyCategories = [
  { id: 1, name: "Zone 1", color: "#25689f" },
  { id: 2, name: "Zone 2", color: "#10b981" },
];

const ReplayAdvancedOptionsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("geofence");
  const [selectedGeofenceIds, setSelectedGeofenceIds] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleItems, setVisibleItems] = useState(50);
  const [showShapes, setShowShapes] = useState(true);

  const geofenceData = dummyGeofences;
  const categoryData = dummyCategories;

  const filteredData = useMemo(() => {
    let currentData = activeTab === "geofence" ? geofenceData : categoryData;
    if (!searchTerm.trim()) return currentData;
    const searchLower = searchTerm.toLowerCase();
    return currentData.filter((item) =>
      (item.name || "").toLowerCase().includes(searchLower)
    );
  }, [activeTab, geofenceData, categoryData, searchTerm]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleItems);
  }, [filteredData, visibleItems]);

  const handleSelectAll = () => {
    if (activeTab === "geofence") {
      setSelectedGeofenceIds(new Set(geofenceData.map((g) => g.id)));
    } else {
      setSelectedCategories(new Set(categoryData.map((c) => c.name)));
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
        if (next.has(item.name)) next.delete(item.name);
        else next.add(item.name);
        return next;
      });
    }
  };

  const selectedCount = filteredData.filter((item) => {
    if (activeTab === "geofence") return selectedGeofenceIds.has(item.id);
    return selectedCategories.has(item.name);
  }).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black/60 z-[9998]" onClick={onClose}></div>
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
                setVisibleItems(50);
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
                setVisibleItems(50);
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
                    : "categories"
                }...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleItems(50);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 cursor-pointer text-xs rounded-md"
                  style={{ background: '#25689f', color: 'white' }}
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
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No {activeTab === "geofence" ? "geofences" : "categories"} found
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {displayedData.map((item, index) => (
                  <div
                    key={activeTab === "geofence" ? item.id : item.id || index}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`item-${activeTab === "geofence" ? item.id : item.id || index}`}
                      checked={
                        activeTab === "geofence"
                          ? selectedGeofenceIds.has(item.id)
                          : selectedCategories.has(item.name)
                      }
                      onChange={() => handleItemToggle(item)}
                    className="h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`item-${activeTab === "geofence" ? item.id : item.id || index}`}
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {activeTab === "geofence" && item.category && (
                            <p className="text-xs text-gray-500 truncate">
                              {item.category}
                            </p>
                          )}
                        </div>
                        {item.color && (
                          <div
                            className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
                {displayedData.length < filteredData.length && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">
                      Showing {displayedData.length} of {filteredData.length} items
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Scroll down to load more
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Show Shapes Toggle */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="flex items-center cursor-pointer select-none">
              <span
                className="inline-flex items-center justify-center h-5 w-5 rounded-full"
                style={{ color: '#25689f' }}
              >
                <Settings size={18} />
              </span>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Show Geofence Shapes
              </span>
            </span>
          </div>
        </div>
        {/* Modal footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm cursor-pointer font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ background: '#25689f' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReplayAdvancedOptionsModal;
