import React, { useState } from "react";
import { useSelector } from "react-redux";
import { X, Plus, Save, Trash2, Edit3 } from "lucide-react";
import { motion } from "framer-motion";

const ManageCategoriesModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    categoryName: "",
    type: "authorization",
    color: "#25689f", // ✅ Changed default color to blue theme
    icon: "1",
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  // All 28 icons array - ab public folder se load karenge
  const iconsList = [
    { id: "1", src: "/icons/1.png" },
    { id: "2", src: "/icons/2.png" },
    { id: "3", src: "/icons/3.png" },
    { id: "4", src: "/icons/4.png" },
    { id: "5", src: "/icons/5.png" },
    { id: "6", src: "/icons/6.png" },
    { id: "7", src: "/icons/7.png" },
    { id: "8", src: "/icons/8.png" },
    { id: "9", src: "/icons/9.png" },
    { id: "10", src: "/icons/10.png" },
    { id: "11", src: "/icons/11.png" },
    { id: "12", src: "/icons/12.png" },
    { id: "13", src: "/icons/13.png" },
    { id: "14", src: "/icons/14.png" },
    { id: "15", src: "/icons/15.png" },
    { id: "16", src: "/icons/16.png" },
    { id: "17", src: "/icons/17.png" },
    { id: "18", src: "/icons/18.png" },
    { id: "19", src: "/icons/19.png" },
    { id: "20", src: "/icons/20.png" },
    { id: "21", src: "/icons/21.png" },
    { id: "22", src: "/icons/22.png" },
    { id: "23", src: "/icons/23.png" },
    { id: "24", src: "/icons/24.png" },
    { id: "25", src: "/icons/25.png" },
    { id: "26", src: "/icons/26.png" },
    { id: "27", src: "/icons/27.png" },
    { id: "28", src: "/icons/28.png" },
  ];

  // Use real category data from Redux
  const {
    geofenceCatList,
    geofenceCatListLoading,
    geofenceCatListError,
    selectedCategoryForDrawing,
  } = useSelector((state) => state.geofence);

  // For local add/edit/delete, you may need to implement API or Redux actions. For now, only show real data.

  const [editingCategory, setEditingCategory] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIconSelect = (iconId) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconId,
    }));
    setShowIconPicker(false);
  };

  const getSelectedIcon = () => {
    const selectedIcon = iconsList.find((icon) => icon.id === formData.icon);
    return selectedIcon ? selectedIcon.src : "/icons/1.png";
  };

  const handleSave = () => {
    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    if (editingCategory) {
      setExistingCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: formData.categoryName,
                type: formData.type,
                color: formData.color,
                icon: formData.icon,
              }
            : cat
        )
      );
      setEditingCategory(null);
    } else {
      const newCategory = {
        id: Date.now(),
        name: formData.categoryName,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
      };
      setExistingCategories((prev) => [...prev, newCategory]);
    }

    setFormData({
      categoryName: "",
      type: "authorization",
      color: "#25689f", // ✅ Reset to blue theme
      icon: "1",
    });
    setShowIconPicker(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.name,
      type: category.type,
      color: category.color || "#25689f", // ✅ Default to blue theme
      icon: category.icon || "1",
    });
    setActiveTab("create");
    setShowIconPicker(false);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setExistingCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryId)
      );
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "authorization":
        return "bg-green-100 text-green-800 border-green-200";
      case "unauthorization":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1002]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <motion.div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl z-10 mx-4 max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Manage Categories
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs - ✅ Updated with blue theme */}
          <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "create"
                  ? "bg-white text-[#25689f] shadow-sm" // ✅ Changed to blue theme
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {editingCategory ? "Edit Category" : "Create New Category"}
            </button>
            <button
              onClick={() => {
                setActiveTab("manage");
                setEditingCategory(null);
                setFormData({
                  categoryName: "",
                  type: "authorization",
                  color: "#25689f", // ✅ Reset to blue theme
                  icon: "1",
                });
                setShowIconPicker(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "manage"
                  ? "bg-white text-[#25689f] shadow-sm" // ✅ Changed to blue theme
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              Manage Existing
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === "create" ? (
            /* Create New Category Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors" // ✅ Added blue focus
                  />
                </div>

                {/* Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors" // ✅ Added blue focus
                  >
                    <option value="authorization">Authorization</option>
                    <option value="unauthorization">Unauthorization</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                {/* Icon Picker */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors cursor-pointer" // ✅ Added blue focus
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={getSelectedIcon()}
                        alt={`Icon ${formData.icon}`}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.target.src = "/icons/1.png";
                        }}
                      />
                      <span>Icon {formData.icon}</span>
                    </div>
                    <X className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Icon Options */}
                  {showIconPicker && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 h-64 overflow-y-auto">
                      <div className="grid grid-cols-7 gap-2">
                        {iconsList.map((icon) => (
                          <button
                            key={icon.id}
                            type="button"
                            onClick={() => handleIconSelect(icon.id)}
                            className={`p-2 rounded border-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                              formData.icon === icon.id
                                ? "border-[#25689f] bg-[#25689f]/10" // ✅ Changed to blue theme
                                : "border-gray-300"
                            }`}
                            title={`Icon ${icon.id}`}
                          >
                            <img
                              src={icon.src}
                              alt={`Icon ${icon.id}`}
                              className="w-6 h-6"
                              onError={(e) => {
                                e.target.src = "/icons/1.png";
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Picker with Native HTML5 Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors" // ✅ Added blue focus
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#25689f" // ✅ Changed placeholder to blue
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors" // ✅ Added blue focus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click color box to open picker or enter hex code
                  </p>
               
                </div>
              </div>

              {/* Preview */}
              {formData.categoryName && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Preview:
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={getSelectedIcon()}
                        alt={`Icon ${formData.icon}`}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.target.src = "/icons/1.png";
                        }}
                      />
                      <span className="font-medium text-gray-900">
                        {formData.categoryName}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                        formData.type
                      )}`}
                    >
                      {formData.type}
                    </span>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: formData.color }}
                      title={`Color: ${formData.color}`}
                    ></div>
                  </div>
                </div>
              )}
              {/* Action Buttons - ✅ Updated with blue theme */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setFormData({
                      categoryName: "",
                      type: "authorization",
                      color: "#25689f", // ✅ Reset to blue theme
                      icon: "1",
                    });
                    setEditingCategory(null);
                    setShowIconPicker(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#25689f] border border-transparent rounded-lg hover:bg-[#1F557F] transition-colors flex items-center cursor-pointer" // ✅ Changed to blue theme
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </div>
          ) : (
            /* Manage Existing Categories */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">
                  Existing Categories (76)
                </h4>
              </div>

              {geofenceCatListLoading ? (
                <div className="text-center py-8 text-gray-500">Loading categories...</div>
              ) : geofenceCatListError ? (
                <div className="text-center py-8 text-red-600">Error: {geofenceCatListError}</div>
              ) : !geofenceCatList || geofenceCatList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg font-medium mb-2">No categories found</div>
                  <div className="text-gray-400 text-sm">Create your first category to get started</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {geofenceCatList.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            iconsList.find((icon) => icon.id === category.icon?.toString())?.src || "/icons/1.png"
                          }
                          alt={`Icon ${category.icon}`}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.target.src = "/icons/1.png";
                          }}
                        />
                        <div className="font-medium text-gray-900">
                          {category.Categoryname}
                        </div>
                        {/* Remove 'authorization' from type display, only show if not 'authorization' */}
                        {category.type && category.type !== "authorization" && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(category.type)}`}
                          >
                            {category.type}
                          </span>
                        )}
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: `#${category.color}` }}
                          title={`Color: #${category.color}`}
                        ></div>
                      </div>
                      {/* Static Edit/Delete buttons (do not work) */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-[#25689f] hover:bg-[#25689f]/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                          disabled
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                          disabled
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageCategoriesModal;
