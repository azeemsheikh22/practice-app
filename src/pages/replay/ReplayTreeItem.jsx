import React from "react";
import { Plus, Minus, Car, Truck } from "lucide-react";

const ReplayTreeItem = ({
  item,
  level = 0,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
}) => {
  const isGroup = item.Type === "Group";

  const getItemIcon = (isSelected) => {
    if (isGroup) {
      return null; // No icon for groups
    } else if (item.icon) {
      return <Truck size={14} className={` ${isSelected ? "text-white" : "text-green-600"}`} />;
    } else {
      return <Car size={14} className={` ${isSelected ? "text-white" : "text-[#25689f]"}`} />; // Changed from text-teal-600 to text-[#25689f]
    }
  };

  const handleItemClick = () => {
    if (!isGroup) {
      if (isSelected) {
        onSelect(null);
      } else {
        onSelect(item);
      }
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    onToggleExpand(item.id);
  };

  return (
    <div
      className={`flex items-center py-1.5 px-2 mx-1 rounded cursor-pointer transition-colors ${
        isSelected
          ? "bg-[#25689f] text-white" // Changed from bg-blue-500 to bg-[#25689f]
          : isGroup
          ? "hover:bg-gray-50"
          : "hover:bg-[#25689f]/10" // Changed from hover:bg-blue-50 to hover:bg-[#25689f]/10
      }`}
      onClick={handleItemClick}
      style={{ marginLeft: `${level * 12}px` }}
    >
      {/* Expand/Collapse button */}
      {isGroup && item.children && item.children.length > 0 && (
        <button
          onClick={handleToggleClick}
          className="mr-2 p-0.5 hover:bg-gray-200 rounded cursor-pointer"
        >
          {isExpanded ? (
            <Minus size={12} className={isSelected ? "text-white" : "text-gray-600"} />
          ) : (
            <Plus size={12} className={isSelected ? "text-white" : "text-gray-600"} />
          )}
        </button>
      )}

      {/* Radio button for vehicles only */}
      {!isGroup && (
        <div className="mr-2 flex-shrink-0">
          <div
            className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
              isSelected
                ? "border-white bg-white"
                : "border-gray-400 bg-white"
            }`}
          >
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#25689f]"></div>} {/* Changed from bg-blue-500 to bg-[#25689f] */}
          </div>
        </div>
      )}

      {/* Icon for vehicles only */}
      {!isGroup && (
        <div className="flex-shrink-0 mr-2">
          <div className={isSelected ? "text-white" : ""}>
            {getItemIcon(isSelected)}
          </div>
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-normal truncate ${
            isSelected ? "text-white" : "text-gray-900"
          }`}
          title={item.text}
        >
          {item.text}
        </div>
      </div>
    </div>
  );
};

export default ReplayTreeItem;
