import React from "react";
import { Plus, Minus, Car, Truck, Package } from "lucide-react";

const ReplayTreeItem = ({
  item,
  level = 0,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
}) => {
  const isGroup = item.Type === "Group";

  // Get vehicle icon with conditional coloring
  const getItemIcon = () => {
    const iconClass = isSelected ? "text-white" : "";

    if (isGroup) {
      return null;
    } else if (item.icon && item.icon.includes("truck.png")) {
      return <Truck size={16} className={`text-blue-600 ${iconClass}`} />;
    } else if (item.text && item.text.toLowerCase().includes("delivery")) {
      return <Package size={16} className={`text-green-600 ${iconClass}`} />;
    } else {
      return <Car size={16} className={`text-teal-600 ${iconClass}`} />;
    }
  };

  

  const handleItemClick = () => {
    if (!isGroup) {
      // Agar same vehicle click kiya to deselect kar do
      if (isSelected) {
        onSelect(null); // Deselect current vehicle
      } else {
        onSelect(item); // Select new vehicle
      }
    }
  };

  return (
    <div className={`ml-${level > 0 ? "4" : "1"} transition-all duration-200`}>
      <div
        className={`flex items-center p-2 rounded-md transition-all duration-200 cursor-pointer ${
          isSelected
            ? "bg-[#D52B1E] border-l-2 border-[#D52B1E]" // Full red background
            : "hover:bg-gray-50 border-l-2 border-transparent"
        }`}
        onClick={handleItemClick}
      >
        {/* Expand/Collapse arrow for groups */}
        {isGroup && item.children && item.children.length > 0 && (
          <div
            className="mr-2 cursor-pointer flex items-center justify-center w-5 h-5"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(item.id);
            }}
          >
            {isExpanded ? (
              <Minus size={14} className="text-gray-500" />
            ) : (
              <Plus size={14} className="text-gray-500" />
            )}
          </div>
        )}

        {/* Indent for child items */}
        {level > 0 && !isGroup && <div className="w-5"></div>}

        {/* Radio button for vehicles (single selection) */}
        {!isGroup && (
          <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                isSelected
                  ? "border-white bg-white" // White border when selected
                  : "border-gray-400 bg-white"
              }`}
            >
              {isSelected && (
                <div className="w-full h-full rounded-full bg-[#D52B1E] scale-50"></div>
              )}
            </div>
          </div>
        )}

        {/* Icon for vehicles only */}
        {!isGroup && (
          <div className="flex-shrink-0 mr-2 w-5 h-5 flex items-center justify-center">
            <div className={isSelected ? "text-white" : ""}>
              {getItemIcon()}
            </div>
          </div>
        )}

        {/* Label */}
        <div
          className={`text-sm font-medium truncate max-w-[200px] ${
            isSelected ? "text-white font-semibold" : "text-gray-900"
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
