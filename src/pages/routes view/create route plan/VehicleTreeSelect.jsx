import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, Search, X, Check, Plus, Minus, Car } from "lucide-react";

const VehicleTreeSelect = ({ value = [], onChange, placeholder = "Select vehicles", multiple = true, treeData = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Initialize selectedVehicles from value prop, only if changed
  useEffect(() => {
    if (Array.isArray(value)) {
      // Shallow compare arrays
      const isSame = value.length === selectedVehicles.length && value.every((v, i) => v === selectedVehicles[i]);
      if (!isSame) {
        setSelectedVehicles(value);
      }
    }
  }, [value]);

  // Only show vehicles under 'Entire Fleet' (id: 6270), no group nodes
  const treeStructure = useMemo(() => {
    // Show all vehicles (Type: 'Vehicle') as children of 'Entire Fleet', regardless of parent
    const vehicles = treeData.filter((item) => item.Type === "Vehicle");
    return [
      {
        id: "6270",
        text: "Entire Fleet",
        children: vehicles,
        Type: "Group",
      },
    ];
  }, [treeData]);

  // Search functionality
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return treeStructure;
    const searchInTree = (items) => {
      return items.reduce((acc, item) => {
        const matches = (item.text || "").toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = item.children ? searchInTree(item.children) : [];
        if (matches || filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
        return acc;
      }, []);
    };
    return searchInTree(treeStructure);
  }, [treeStructure, searchQuery]);

  // Expand/collapse logic
  const handleToggleExpand = useCallback((id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Get all child IDs recursively
  const getAllChildIds = useCallback((item) => {
    let ids = [item.id];
    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        ids = [...ids, ...getAllChildIds(child)];
      });
    }
    return ids;
  }, []);

  // Find node by ID
  const findNodeById = useCallback((id, tree) => {
    for (const item of tree) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findNodeById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Handle selection
  const handleSelection = useCallback((item, isChecked) => {
    let newSelected = [...selectedVehicles];
    if (isChecked) {
      const allIds = getAllChildIds(item);
      allIds.forEach((id) => {
        if (!newSelected.includes(id)) newSelected.push(id);
      });
    } else {
      const allIds = getAllChildIds(item);
      newSelected = newSelected.filter((id) => !allIds.includes(id));
    }
    setSelectedVehicles(newSelected);
    onChange(multiple ? newSelected : newSelected[0] || "");
  }, [selectedVehicles, getAllChildIds, onChange, multiple]);

  // Check if selected
  const isSelected = useCallback((id) => selectedVehicles.includes(id), [selectedVehicles]);

  // Remove selected
  const removeSelected = useCallback((id, e) => {
    e.stopPropagation();
    const newSelected = selectedVehicles.filter((vid) => vid !== id);
    setSelectedVehicles(newSelected);
    onChange(multiple ? newSelected : "");
  }, [selectedVehicles, onChange, multiple]);

  // Clear all
  const clearAll = useCallback((e) => {
    e.stopPropagation();
    setSelectedVehicles([]);
    onChange(multiple ? [] : "");
  }, [onChange, multiple]);

  // Tree item component (only show root and vehicles, no group nodes except root)
  const TreeItem = React.memo(({ item, level = 0 }) => {
    // Only root node (Entire Fleet) can have children
    const expanded = expandedNodes[item.id] !== undefined ? expandedNodes[item.id] : item.id === "6270";
    const selected = isSelected(item.id);
    const hasChildren = item.children && item.children.length > 0;
    // Only show expand/collapse for root
    return (
      <div className="select-none">
        <div className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded-md transition-colors duration-150 ${selected ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"} ${level > 0 ? `ml-${Math.min(level * 3, 12)}` : ""}`}>
          {/* Expand/Collapse for root only */}
          <div className="mr-2 flex-shrink-0 w-6 flex justify-center">
            {item.id === "6270" && hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleExpand(item.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
              >
                {expanded ? <Minus size={14} className="text-gray-600" /> : <Plus size={14} className="text-gray-600" />}
              </button>
            ) : null}
          </div>
          {/* Checkbox and icon for vehicles only */}
          {item.Type === "Vehicle" && (
            <>
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelection(item, !selected); }} className="mr-2 flex-shrink-0 cursor-pointer">
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150 ${selected ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:border-blue-400"}`}>
                  {selected && <Check size={12} />}
                </div>
              </div>
              {/* Vehicle icon (lucide-react Car icon, like TreeItem.jsx) */}
              <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Car size={16} className="text-green-600" />
              </div>
            </>
          )}
          {/* Name */}
          <div
            onClick={(e) => {
              if (item.Type === "Vehicle") {
                e.preventDefault();
                e.stopPropagation();
                handleSelection(item, !selected);
              }
            }}
            className={`flex-1 ${item.Type === "Vehicle" ? "cursor-pointer" : "font-semibold text-[#1e4a6f]"}`}
          >
            <span className="text-sm font-medium text-gray-800 truncate block" title={item.text}>{item.text}</span>
          </div>
        </div>
        {/* Children (only for root) */}
        {item.id === "6270" && hasChildren && expanded && (
          <div className="border-l border-gray-200 ml-3 pl-1">
            {item.children.map((child) => (
              <TreeItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Select Button */}
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full min-h-[40px] px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${isOpen ? "border-[#1e4a6f] ring-2 ring-[#1e4a6f]/20 bg-white" : "border-gray-300 hover:border-[#1e4a6f]/50 bg-white hover:bg-gray-50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedVehicles.length === 0 ? (
              <div className="flex items-center">
                <span className="text-gray-500 text-sm">{placeholder}</span>
              </div>
            ) : selectedVehicles.length <= 2 ? (
              selectedVehicles.map((vid) => {
                const v = treeData.find((item) => item.id === vid);
                return v ? (
                  <span key={v.id} className="inline-flex items-center bg-[#1e4a6f]/10 text-[#1e4a6f] text-xs px-2.5 py-1 rounded-full max-w-[120px] border border-[#1e4a6f]/20">
                    <span className="truncate font-medium">{v.text}</span>
                    <button onClick={(e) => removeSelected(v.id, e)} className="ml-1.5 hover:bg-[#1e4a6f]/20 rounded-full p-0.5 flex-shrink-0 transition-colors duration-150"><X size={10} className="text-[#1e4a6f]" /></button>
                  </span>
                ) : null;
              })
            ) : (
              <div className="flex items-center">
                <div className="flex items-center bg-[#1e4a6f]/10 text-[#1e4a6f] text-xs px-2.5 py-1 rounded-full border border-[#1e4a6f]/20">
                  <span className="font-medium">{selectedVehicles.length} vehicles selected</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {selectedVehicles.length > 0 && (
              <button onClick={clearAll} className="text-gray-400 hover:text-[#1e4a6f] hover:bg-[#1e4a6f]/10 p-1.5 rounded-md transition-all duration-150" title="Clear all selections"><X size={14} /></button>
            )}
            <div className="w-px h-4 bg-gray-300"></div>
            <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>{isOpen ? <ChevronUp size={16} className="text-[#1e4a6f]" /> : <ChevronDown size={16} className="text-gray-400" />}</div>
          </div>
        </div>
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" onClick={(e) => e.stopPropagation()} />
              {searchQuery && (
                <button onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
              )}
            </div>
          </div>
          {/* Tree Content */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredTree.length > 0 ? (
              filteredTree.map((item) => <TreeItem key={item.id} item={item} level={0} />)
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center">
                <div className="flex flex-col items-center">
                  <Search size={24} className="text-gray-300 mb-2" />
                  <div>No vehicles found</div>
                  {searchQuery && <div className="text-xs mt-1">Try adjusting your search</div>}
                </div>
              </div>
            )}
          </div>
          {/* Footer with selection info */}
          {selectedVehicles.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{selectedVehicles.length} vehicle{selectedVehicles.length > 1 ? "s" : ""} selected</span>
                <button onClick={clearAll} className="text-blue-600 hover:text-blue-800 font-medium">Clear All</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleTreeSelect;
