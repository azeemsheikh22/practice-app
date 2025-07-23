import React from "react";
import { Plus, Minus, Car, Users } from "lucide-react";

const TreeItem = ({
  item,
  level = 0,
  isSelected,
  isIndeterminate = false, // ✅ NEW: Indeterminate state prop
  isExpanded,
  onToggleExpand,
  onSelect,
}) => {
  const isGroup = item.Type === "Group";
  
  // ✅ FIX: Check if group actually has children
  const hasChildren = isGroup && item.children && Array.isArray(item.children) && item.children.length > 0;

  // ✅ FIXED: Separate handlers for expand and select
  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) { // ✅ Only allow expand if has children
      onToggleExpand(item.id);
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    const isChecked = e.target.checked;
    onSelect(item, isChecked);
  };

  const getIcon = () => {
    switch (item.Type) {
      case "Vehicle":
        return <Car size={16} className="text-green-600" />;
      case "Driver":
        return <Users size={16} className="text-violet-600" />;
      default:
        return null; // No icon for groups
    }
  };

  // ✅ NEW: Render checkbox with indeterminate state
  const renderCheckbox = () => {
    if (isIndeterminate) {
      // Indeterminate state (some children selected) - DARK FILLED
      return (
        <div className="transition-transform duration-200 ease-in-out transform scale-100">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" fill="currentColor" />
            <path d="M8 12h8" stroke="white" strokeWidth="2" /> {/* White line on dark background */}
          </svg>
        </div>
      );
    } else if (isSelected) {
      // Fully selected state
      return (
        <div className="transition-transform duration-200 ease-in-out transform scale-100">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      );
    } else {
      // Unselected state
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      );
    }
  };


  return (
    <div
      className={`flex items-center p-2 rounded-md transition-all duration-200 ease-in-out transform translate-y-0 opacity-100 hover:bg-gray-50`}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
    >
      {/* ✅ FIXED: Plus/Minus button only if group has children */}
      {isGroup && hasChildren ? (
        <button
          onClick={handleToggleExpand}
          className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors duration-200"
        >
          {isExpanded ? (
            <Minus size={14} className="text-gray-600" />
          ) : (
            <Plus size={14} className="text-gray-600" />
          )}
        </button>
      ) : (
        // ✅ FIX: Add spacing for items without expand button
        <div className="mr-2 flex-shrink-0 w-5 h-5" />
      )}

      {/* Checkbox - separate from expand button */}
      <input
        type="checkbox"
        id={`item-${item.id}`}
        checked={isSelected}
        onChange={handleSelect}
        className="sr-only"
      />
      
      <label
        htmlFor={`item-${item.id}`}
        className="flex items-center cursor-pointer w-full select-none"
      >
        {/* ✅ NEW: Checkbox visual with indeterminate support */}
        <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {renderCheckbox()}
        </div>

        {/* Icon only for Vehicle and Driver */}
        {getIcon() && (
          <div className="flex-shrink-0 mr-2 w-5 h-5 flex items-center justify-center">
            {getIcon()}
          </div>
        )}

        {/* Label */}
        <div
          className="text-dark text-[12px] truncate max-w-[180px] font-medium"
          title={item.text}
        >
          {item.text}
        </div>
      </label>
    </div>
  );
};

export default TreeItem;
