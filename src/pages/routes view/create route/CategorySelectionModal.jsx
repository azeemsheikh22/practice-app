import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const CategorySelectionModal = ({ isOpen, onClose, onSelect, selectedCategory = null }) => {
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory);

  const { geofenceCatList } = useSelector((state) => state.geofence);

  // Update local state when selectedCategory prop changes
  useEffect(() => {
    setLocalSelectedCategory(selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleCategorySelect = (category) => {
    setLocalSelectedCategory(category);
  };

  const handleDone = () => {
    onSelect(localSelectedCategory);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedCategory(selectedCategory); // Reset to original
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[2000]">
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel}></div>

      <motion.div
        className="relative w-full max-w-xl bg-white rounded-lg shadow-xl z-10 mx-4 max-h-[70vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Select Category
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Categories list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {geofenceCatList && geofenceCatList.length > 0 ? (
              <div className="space-y-2">
                {geofenceCatList.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <input
                      type="radio"
                      id={`category-${category.id}`}
                      name="category"
                      checked={localSelectedCategory?.id === category.id}
                      onChange={() => handleCategorySelect(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {category.Categoryname}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <X size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No categories found</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {localSelectedCategory ? (
                <span className="font-medium text-blue-600">
                  {localSelectedCategory.Categoryname} selected
                </span>
              ) : (
                <span>No category selected</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelectionModal;
