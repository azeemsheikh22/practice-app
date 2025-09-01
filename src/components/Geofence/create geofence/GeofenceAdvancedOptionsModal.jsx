import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGeofenceCatList,
} from "../../../features/geofenceSlice";

const GeofenceAdvancedOptionsModal = ({ isOpen, onClose }) => {
  const [localSelectedCategories, setLocalSelectedCategories] = useState(
    new Set()
  );

  // ✅ ADD SEARCH STATE FOR PERFORMANCE
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleItems, setVisibleItems] = useState(50); // Virtual scrolling

  const {
    geofenceCatList,
    geofenceCatListLoading,
    geofenceCatListError,
  } = useSelector((state) => state.geofence);

  const dispatch = useDispatch();

  // FETCH DATA ON COMPONENT MOUNT
  useEffect(() => {
    if (!geofenceCatList || geofenceCatList.length === 0) {
      dispatch(fetchGeofenceCatList());
    }
  }, [dispatch, geofenceCatList]);

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

  // Get data from API
  const categoryData = extractCategoriesFromAPI(geofenceCatList);

  // ✅ MEMOIZED FILTERED DATA FOR PERFORMANCE
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return categoryData;
    }

    const searchLower = searchTerm.toLowerCase();
    return categoryData.filter((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
  }, [categoryData, searchTerm]);

  // ✅ VIRTUAL SCROLLING - Only render visible items
  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleItems);
  }, [filteredData, visibleItems]);

  // Initialize category selections - BY DEFAULT UNCHECK (empty Set)
  useEffect(() => {
    if (isOpen && categoryData.length > 0) {
      // ✅ BY DEFAULT UNCHECK - empty Set
      setLocalSelectedCategories(new Set());
    }
  }, [isOpen, categoryData.length]);

  // ✅ LOAD MORE ITEMS ON SCROLL
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setVisibleItems((prev) => Math.min(prev + 50, filteredData.length));
    }
  };

  if (!isOpen) return null;

  // SELECT ALL FUNCTION
  const handleSelectAll = () => {
    const allCategoryNames = filteredData.map((c) => c.name);
    setLocalSelectedCategories(
      new Set([...localSelectedCategories, ...allCategoryNames])
    );
  };

  // DESELECT ALL FUNCTION
  const handleDeselectAll = () => {
    const filteredNames = new Set(filteredData.map((c) => c.name));
    setLocalSelectedCategories(
      new Set(
        [...localSelectedCategories].filter(
          (name) => !filteredNames.has(name)
        )
      )
    );
  };

  // TOGGLE INDIVIDUAL ITEM
  const handleItemToggle = (item) => {
    const newSelected = new Set(localSelectedCategories);
    const categoryName = typeof item === "object" ? item.name : item;

    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      newSelected.add(categoryName);
    }

    setLocalSelectedCategories(newSelected);
  };

  // SAVE SETTINGS FUNCTION
  const handleSaveSettings = () => {
    const selectedCategoryArray = Array.from(localSelectedCategories);

    console.log("=== SAVE SETTINGS DEBUG ===");
    console.log("Selected Categories:", selectedCategoryArray);

    // Future: Add your save logic here
    console.log("Settings saved successfully!");
    onClose();
  };

  // CURRENT SELECTED LOGIC
  const safeCurrentSelected =
    localSelectedCategories instanceof Set ? localSelectedCategories : new Set();

  // ✅ CALCULATE SELECTED COUNT FROM FILTERED DATA
  const selectedCount = filteredData.filter((item) => {
    return safeCurrentSelected.has(item.name);
  }).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <motion.div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl z-10 mx-4 max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header - COMPRESSED */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">
              Advanced Geofence Options - Categories
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Filter heading and controls - COMPRESSED */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            {/* Search Box */}
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleItems(50);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 bg-blue-600 text-white cursor-pointer text-xs rounded-md hover:bg-blue-700 transition-colors"
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

          {/* Scrollable list - OPTIMIZED */}
          <div
            className="flex-1 overflow-y-auto px-4 py-2"
            onScroll={handleScroll}
          >
            {geofenceCatListLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading categories...</p>
                </div>
              </div>
            ) : geofenceCatListError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-red-400" />
                  </div>
                  <p className="text-red-500 font-medium">Error loading categories</p>
                  <p className="text-red-400 text-sm mt-1">{geofenceCatListError}</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No categories found</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {displayedData.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`category-${item.id || index}`}
                      checked={safeCurrentSelected.has(item.name)}
                      onChange={() => handleItemToggle(item)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`category-${item.id || index}`}
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {/* Load more indicator */}
                {displayedData.length < filteredData.length && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">
                      Showing {displayedData.length} of {filteredData.length}{" "}
                      categories
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

        {/* Modal footer - COMPRESSED */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {localSelectedCategories.size} categories selected
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 cursor-pointer py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeofenceAdvancedOptionsModal;
