import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectRawVehicleList } from "../../../features/gpsTrackingSlice";
import icon1 from "../../../assets/sideicon.PNG";

const TreeSelect = ({
  value = [],
  onChange,
  placeholder = "Select groups",
  multiple = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const rawVehicles = useSelector(selectRawVehicleList);

  // Filter only groups (no vehicles) - Memoized to prevent re-calculation
  const groupsOnly = useMemo(() => {
    return rawVehicles.filter((item) => item.Type === "Group");
  }, [rawVehicles]);

  // Organize data into tree structure - Memoized
  const treeStructure = useMemo(() => {
    const organizeDataIntoTree = (data) => {
      const map = {};
      const roots = [];

      // First pass: create a map of all items
      data.forEach((item) => {
        map[item.id] = {
          ...item,
          children: [],
        };
      });

      // Second pass: build the tree
      data.forEach((item) => {
        if (item.parent === "#") {
          roots.push(map[item.id]);
        } else if (map[item.parent]) {
          map[item.parent].children.push(map[item.id]);
        }
      });

      // Sort children
      const sortChildren = (node) => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => (a.orderby || 0) - (b.orderby || 0));
          node.children.forEach((child) => sortChildren(child));
        }
      };

      roots.forEach((root) => sortChildren(root));
      return roots;
    };

    return organizeDataIntoTree(groupsOnly);
  }, [groupsOnly]);

  // Search functionality - Memoized
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return treeStructure;

    const searchInTree = (items) => {
      return items.reduce((acc, item) => {
        const matchesSearch = item.text
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const filteredChildren = item.children
          ? searchInTree(item.children)
          : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    };

    return searchInTree(treeStructure);
  }, [treeStructure, searchQuery]);

  // Auto-expand root nodes - Fixed to prevent infinite re-renders
  useEffect(() => {
    if (groupsOnly.length > 0) {
      const rootNodes = groupsOnly.filter((item) => item.parent === "#");

      // Only update if there are new root nodes
      setExpandedGroups((prev) => {
        const newExpanded = { ...prev };
        let hasChanges = false;

        rootNodes.forEach((node) => {
          if (!(node.id in newExpanded)) {
            newExpanded[node.id] = true;
            hasChanges = true;
          }
        });

        return hasChanges ? newExpanded : prev;
      });
    }
  }, [groupsOnly.length]); // Only depend on length, not the entire array

  // Expand all when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allGroupIds = groupsOnly.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
      }, {});
      setExpandedGroups(allGroupIds);
    }
  }, [searchQuery, groupsOnly.length]); // Only depend on length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle expand/collapse - Memoized callback
  const handleToggleExpand = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Get all child group IDs recursively - Memoized
  const getAllChildIds = useCallback((item) => {
    let ids = [item.id];
    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        ids = [...ids, ...getAllChildIds(child)];
      });
    }
    return ids;
  }, []);

  // Find group by ID in tree structure - Memoized
  const findGroupById = useCallback((id, tree) => {
    for (const item of tree) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findGroupById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Handle group selection - Memoized callback
  const handleGroupSelection = useCallback(
    (item, isChecked) => {
      let newSelectedGroups = [...selectedGroups];

      if (isChecked) {
        // Add this group and all its children
        const allIds = getAllChildIds(item);
        allIds.forEach((id) => {
          if (!newSelectedGroups.find((g) => g.id === id)) {
            const groupItem = findGroupById(id, treeStructure);
            if (groupItem) {
              newSelectedGroups.push(groupItem);
            }
          }
        });
      } else {
        // Remove this group and all its children
        const allIds = getAllChildIds(item);
        newSelectedGroups = newSelectedGroups.filter(
          (g) => !allIds.includes(g.id)
        );
      }

      setSelectedGroups(newSelectedGroups);
      onChange(
        multiple
          ? newSelectedGroups.map((g) => g.id)
          : newSelectedGroups[0]?.id || ""
      );
    },
    [
      selectedGroups,
      getAllChildIds,
      findGroupById,
      treeStructure,
      multiple,
      onChange,
    ]
  );

  // Check if group is selected - Memoized
  const isGroupSelected = useCallback(
    (groupId) => {
      return selectedGroups.some((g) => g.id === groupId);
    },
    [selectedGroups]
  );

  // Remove selected group
  const removeSelectedGroup = useCallback(
    (groupId, event) => {
      event.stopPropagation();
      const newSelectedGroups = selectedGroups.filter((g) => g.id !== groupId);
      setSelectedGroups(newSelectedGroups);
      onChange(multiple ? newSelectedGroups.map((g) => g.id) : "");
    },
    [selectedGroups, multiple, onChange]
  );

  // Clear all selections
  const clearAll = useCallback(
    (event) => {
      event.stopPropagation();
      setSelectedGroups([]);
      onChange(multiple ? [] : "");
    },
    [multiple, onChange]
  );

  // Custom TreeItem - Memoized component
  const TreeSelectItem = React.memo(({ item, level = 0 }) => {
    const isExpanded = expandedGroups[item.id];
    const isSelected = isGroupSelected(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="select-none">
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded-md transition-colors duration-150
          ${
            isSelected
              ? "bg-blue-50 border-l-2 border-blue-500"
              : "border-l-2 border-transparent"
          }
          ${level > 0 ? `ml-${Math.min(level * 3, 12)}` : ""}`}
        >
          {/* Expand/Collapse Button */}
          <div className="mr-2 flex-shrink-0 w-6 flex justify-center">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleExpand(item.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
              >
                {isExpanded ? (
                  <Minus size={14} className="text-gray-600" />
                ) : (
                  <Plus size={14} className="text-gray-600" />
                )}
              </button>
            ) : null}
          </div>

          {/* Custom Checkbox */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGroupSelection(item, !isSelected);
            }}
            className="mr-3 flex-shrink-0 cursor-pointer"
          >
            <div
              className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150
              ${
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {isSelected && <Check size={12} />}
            </div>
          </div>

          {/* Group Name */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGroupSelection(item, !isSelected);
            }}
            className="flex-1 cursor-pointer"
          >
            <span
              className="text-sm font-medium text-gray-800 truncate block"
              title={item.text}
            >
              {item.text}
            </span>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-3 pl-1">
            {item.children.map((child) => (
              <TreeSelectItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Select Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[40px] px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
          isOpen
            ? "border-[#1e4a6f] ring-2 ring-[#1e4a6f]/20 bg-white"
            : "border-gray-300 hover:border-[#1e4a6f]/50 bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedGroups.length === 0 ? (
              <div className="flex items-center">
          
                <span className="text-gray-500 text-sm">{placeholder}</span>
              </div>
            ) : selectedGroups.length <= 2 ? (
              selectedGroups.map((group) => (
                <span
                  key={group.id}
                  className="inline-flex items-center bg-[#1e4a6f]/10 text-[#1e4a6f] text-xs px-2.5 py-1 rounded-full max-w-[120px] border border-[#1e4a6f]/20"
                >

                  <span className="truncate font-medium">{group.text}</span>
                  <button
                    onClick={(e) => removeSelectedGroup(group.id, e)}
                    className="ml-1.5 hover:bg-[#1e4a6f]/20 rounded-full p-0.5 flex-shrink-0 transition-colors duration-150"
                  >
                    <X size={10} className="text-[#1e4a6f]" />
                  </button>
                </span>
              ))
            ) : (
              <div className="flex items-center">
                <div className="flex items-center bg-[#1e4a6f]/10 text-[#1e4a6f] text-xs px-2.5 py-1 rounded-full border border-[#1e4a6f]/20">
                  <span className="font-medium">
                    {selectedGroups.length} groups selected
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {selectedGroups.length > 0 && (
              <button
                onClick={clearAll}
                className="text-gray-400 hover:text-[#1e4a6f] hover:bg-[#1e4a6f]/10 p-1.5 rounded-md transition-all duration-150"
                title="Clear all selections"
              >
                <X size={14} />
              </button>
            )}
            <div className="w-px h-4 bg-gray-300"></div>
            <div
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              {isOpen ? (
                <ChevronUp size={16} className="text-[#1e4a6f]" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tree Content */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredTree.length > 0 ? (
              filteredTree.map((item) => (
                <TreeSelectItem key={item.id} item={item} level={0} />
              ))
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center">
                <div className="flex flex-col items-center">
                  <Search size={24} className="text-gray-300 mb-2" />
                  <div>No groups found</div>
                  {searchQuery && (
                    <div className="text-xs mt-1">
                      Try adjusting your search
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with selection info */}
          {selectedGroups.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedGroups.length} group
                  {selectedGroups.length > 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={clearAll}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeSelect;
