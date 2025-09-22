import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Car, Users, Layers, Plus, Minus, User } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { FixedSizeList as List } from "react-window";
import {
  selectRawVehicleList,
  selectLoading,
  requestVehicleListWithScope,
} from "../../../features/gpsTrackingSlice";

const SelectVehiclesModal = ({
  isOpen,
  onClose,
  onSave,
  type = "vehicle", // vehicle, group, or driver
  initialSelectedItems = [],
  shouldReset = false,
}) => {
  const dispatch = useDispatch();
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems); // Multi selection
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({}); // For expandable groups

  // Debounced search query update
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Get real data and loading state from Redux
  const rawVehicles = useSelector(selectRawVehicleList);
  const isLoading = useSelector(selectLoading);


  // Dispatch data fetch based on type when modal opens
  useEffect(() => {
    if (isOpen) {
      let scope;
      switch (type) {
        case "vehicle":
          scope = 1;
          break;
        case "driver":
          scope = 2;
          break;
        case "group":
          scope = 3;
          break;
        default:
          scope = 1; // Default to vehicles
      }
      dispatch(requestVehicleListWithScope(scope));
    }
  }, [dispatch, isOpen, type]);

  // Reset selection when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      if (shouldReset || selectedItems.length === 0) {
        setSelectedItems(initialSelectedItems || []);
      }
      setSearchQuery("");
      setExpandedGroups({});
    }
  }, [type, isOpen, initialSelectedItems, shouldReset]);

  const getModalTitle = () => {
    switch (type) {
      case "vehicle":
        return "Select Vehicles";
      case "group":
        return "Select Groups";
      case "driver":
        return "Select Drivers";
      default:
        return "Select Items";
    }
  };

  // Filter only groups (no vehicles) for tree structure
  const groupsOnly = useMemo(() => {
    if (!rawVehicles || rawVehicles.length === 0) return [];
    return rawVehicles.filter((item) => item.Type === "Group");
  }, [rawVehicles]);

  // Organize data into tree structure (matching DashboardHeader.jsx)
  const treeStructure = useMemo(() => {
    const organizeDataIntoTree = (data) => {
      if (!data || !Array.isArray(data) || data.length === 0) return [];

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
          node.children.sort((a, b) => {
            const aOrder = a.orderby || 0;
            const bOrder = b.orderby || 0;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return (a.text || "").localeCompare(b.text || "");
          });
          node.children.forEach(sortChildren);
        }
      };

      roots.forEach(sortChildren);
      return roots;
    };

    return organizeDataIntoTree(groupsOnly);
  }, [groupsOnly]);

  // Search functionality for tree (from DashboardHeader)
  const filteredTree = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return treeStructure;

    const searchCache = new Map();

    const searchInTree = (items) => {
      return items.reduce((acc, item) => {
        // Check cache first
        const cacheKey = `${item.id}-${debouncedSearchQuery}`;
        if (searchCache.has(cacheKey)) {
          return searchCache.get(cacheKey);
        }

        const matchesSearch = item.text
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());
        const filteredChildren = item.children
          ? searchInTree(item.children)
          : [];

        let result = [];
        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren,
          });
        }

        // Cache the result
        searchCache.set(cacheKey, result);
        return [...acc, ...result];
      }, []);
    };

    return searchInTree(treeStructure);
  }, [treeStructure, debouncedSearchQuery]);

  // Auto-expand root nodes by default
  useEffect(() => {
    if (treeStructure.length > 0) {
      // Expand all groups whose parent is '#', regardless of id
      const expanded = {};
      treeStructure.forEach((node) => {
        if (node.parent === "#") {
          expanded[node.id] = true;
        }
      });
      setExpandedGroups(expanded);
    }
  }, [treeStructure, isOpen]);

  // Expand all when searching (from DashboardHeader)
  useEffect(() => {
    if (searchQuery.trim()) {
      const allGroupIds = groupsOnly.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
      }, {});
      setExpandedGroups(allGroupIds);
    }
  }, [searchQuery, groupsOnly]);

  // Filter data by type
  const getFilteredItems = useMemo(() => {
    if (!rawVehicles || rawVehicles.length === 0) return [];

    // Filter by type first
    let filteredByType = [];
    switch (type) {
      case "vehicle":
        filteredByType = rawVehicles.filter((item) => item.Type === "Vehicle");
        break;
      case "driver":
        filteredByType = rawVehicles.filter((item) => item.Type === "Driver");
        break;
      case "group":
        // For groups, return tree structure with search applied
        return filteredTree;
      default:
        filteredByType = [];
    }

    // Filter by search query (non-group types)
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      return filteredByType.filter((item) =>
        item.text.toLowerCase().includes(searchLower)
      );
    }

    return filteredByType;
  }, [rawVehicles, type, filteredTree, debouncedSearchQuery]);

  const filteredItems = getFilteredItems;

  // Toggle group expansion (from DashboardHeader)
  const handleToggleExpand = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Multi item selection
  const handleItemSelect = useCallback((item) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some(
        (i) =>
          i.id === item.id ||
          i.valueId === item.valueId ||
          (i.valueId && item.valueId && i.valueId === item.valueId)
      );
      if (isSelected) {
        return prev.filter(
          (i) =>
            i.id !== item.id &&
            i.valueId !== item.valueId &&
            !(i.valueId && item.valueId && i.valueId === item.valueId)
        );
      } else {
        return [...prev, item];
      }
    });
  }, []);

  // Tree Item Component (matching DashboardHeader TreeSelectItem)
  const TreeSelectItem = useCallback(
    ({ item, level = 0 }) => {
      const isExpanded = expandedGroups[item.id];
      const isSelected = selectedItems.some(
        (selected) =>
          selected.id === item.id ||
          selected.valueId === item.valueId ||
          (selected.valueId &&
            item.valueId &&
            selected.valueId === item.valueId)
      );
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.id}>
          <div
            onClick={() => handleItemSelect(item)}
            className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors select-none ${
              isSelected ? "bg-blue-50 border border-blue-300" : ""
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
          >
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand(item.id);
                }}
                className="mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <Minus size={14} className="text-gray-600" />
                ) : (
                  <Plus size={14} className="text-gray-600" />
                )}
              </button>
            )}

            {/* Selection Indicator (Radio button style like DashboardHeader) */}
            <div
              className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300 hover:border-blue-600"
              }`}
            >
              {isSelected && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>

            {/* Group Name */}
            <span
              className={`text-sm font-medium flex-1 select-none ${
                isSelected ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {item.text}
            </span>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="ml-2">
              {item.children.map((child) => (
                <TreeSelectItem key={child.id} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    },
    [expandedGroups, selectedItems, handleToggleExpand, handleItemSelect]
  );

  // Render list item (for virtual scrolling)
  const ListItem = useCallback(
    ({ index, style }) => {
      const item = filteredItems[index];
      const isSelected = selectedItems.some(
        (i) =>
          i.id === item.id ||
          i.valueId === item.valueId ||
          (i.valueId && item.valueId && i.valueId === item.valueId)
      );

      return (
        <div
          style={style}
          className="flex items-center py-1 px-3 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => handleItemSelect(item)}
        >
          {/* Checkbox */}
          <div
            className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
              isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
            }`}
          >
            {isSelected && (
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Type icon */}
          {item.Type === "Vehicle" && (
            <Car size={16} className="text-green-600 mr-2" />
          )}
          {item.Type === "Driver" && (
            <User size={16} className="text-orange-600 mr-2" />
          )}

          {/* Text */}
          <div className="flex-1">
            <span className="text-sm text-gray-900">{item.text}</span>
            {item.Type === "Vehicle" && item.VehicleReg && (
              <span className="text-xs text-gray-500 ml-2">
                ({item.VehicleReg})
              </span>
            )}
          </div>
        </div>
      );
    },
    [filteredItems, selectedItems, handleItemSelect]
  );

  // Render flat list with virtual scrolling
  const renderFlatList = () => {
    return (
      <List
        height={300}
        itemCount={filteredItems.length}
        itemSize={40}
        width="100%"
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {ListItem}
      </List>
    );
  };

  // Get title and icon based on type
  const getTitle = () => {
    switch (type) {
      case "vehicle":
        return "Select Vehicle from your fleet";
      case "driver":
        return "Select Driver from your fleet";
      case "group":
        return "Select Group from your fleet";
      default:
        return "Select Item";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "vehicle":
        return <Car size={20} className="text-green-600" />;
      case "driver":
        return <User size={20} className="text-orange-600" />;
      case "group":
        return <Layers size={20} className="text-blue-600" />;
      default:
        return null;
    }
  };

  // Handle save button click
  const handleSave = () => {
    const selectedIds = selectedItems.map((item) => item.valueId || item.id);
    onSave(selectedIds, selectedItems); // Send both IDs and full items
    onClose();
  };

  if (!isOpen) return null;

  // Use modal-root for overlay, fallback to document.body
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }

  // Select All handler
  const handleSelectAll = () => {
    if (type === "group") {
      // For groups, flatten all group nodes
      const flattenTree = (nodes) => {
        let all = [];
        nodes.forEach((node) => {
          all.push(node);
          if (node.children && node.children.length > 0) {
            all = all.concat(flattenTree(node.children));
          }
        });
        return all;
      };
      setSelectedItems(flattenTree(filteredItems));
    } else {
      setSelectedItems(filteredItems);
    }
  };

  // Deselect All handler
  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  // Overlay click closes modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <motion.div
        className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl z-10 mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-800">
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Search box */}
          <div className="mb-4 flex items-center">
            <label htmlFor="search" className="mr-2 font-medium text-gray-700">
              Search:
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25689f] text-sm cursor-pointer"
              placeholder={`Search ${type}s...`}
            />
          </div>

          {/* Item list */}
          <div className="space-y-1 mb-4 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              // Loading state
              <div className="py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25689f] mb-4"></div>
                  <div className="text-gray-500 font-medium">
                    Loading {type}s...
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Please wait while we fetch your data
                  </div>
                </div>
              </div>
            ) : filteredItems.length > 0 ? (
              type === "group" ? (
                // Tree view for groups (using TreeSelectItem from DashboardHeader)
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <TreeSelectItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                // Flat list for vehicles with virtual scrolling
                <div className="h-[300px]">{renderFlatList()}</div>
              )
            ) : (
              <div className="py-8 text-center">
                <div className="flex flex-col items-center">
                  {getIcon()}
                  <div className="mt-3 text-gray-500 font-medium">
                    No {type}s found
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {searchQuery
                      ? `No ${type}s match "${searchQuery}"`
                      : `No ${type}s available in your fleet`}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex gap-6">
              <button
                onClick={handleSelectAll}
                disabled={isLoading || filteredItems.length === 0}
                className={`bg-transparent text-sm font-semibold text-[#25689f] underline underline-offset-4 px-0 py-0 transition-colors cursor-pointer ${
                  filteredItems.length > 0 && !isLoading
                    ? "hover:text-[#1F557F]"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                disabled={isLoading || selectedItems.length === 0}
                className={`bg-transparent text-sm font-semibold text-[#25689f] underline underline-offset-4 px-0 py-0 transition-colors cursor-pointer ${
                  selectedItems.length > 0 && !isLoading
                    ? "hover:text-[#1F557F]"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Deselect All
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm rounded transition-colors cursor-pointer ${
                selectedItems.length > 0 && !isLoading
                  ? "bg-[#25689f] text-white hover:bg-[#1F557F]"
                  : "bg-[#25689f] text-white hover:bg-[#1F557F]"
              }`}
            >
              {isLoading ? "Loading..." : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    modalRoot
  );
};

export default SelectVehiclesModal;