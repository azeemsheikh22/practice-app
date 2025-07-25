import { useState, useMemo, useEffect, useCallback, memo, lazy, Suspense, useTransition } from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import sideIcon1 from "../../assets/sideicon.PNG";
import sideIcon2 from "../../assets/sideicon2.PNG";
import { useDispatch, useSelector } from "react-redux";
import {
  clearRawVehicleList,
  selectCarData,
  selectSelectedVehicles,
  updateVehicleFilter,
} from "../../features/gpsTrackingSlice";
import { selectRawVehicleList } from "../../features/gpsTrackingSlice";
import { selectConnectionStatus } from "../../features/gpsTrackingSlice";
import { requestVehicleListWithScope } from "../../features/gpsTrackingSlice";
import {
  selectVisuallySelectedItems,
  setVisuallySelectedItems,
} from "../../features/mapInteractionSlice";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";

// Lazy load components for better initial loading
const TreeView = lazy(() => import("../../components/sidebar/TreeView"));
const VehicleList = lazy(() => import("../../components/sidebar/VehicleList"));

// ✅ Custom hook for dynamic height calculation
const useDynamicHeight = () => {
  const [sidebarHeight, setSidebarHeight] = useState("calc(100vh - 6rem)");

  useEffect(() => {
    const calculateHeight = () => {
      const screenHeight = window.innerHeight;
      const navbarHeight = 64; // 4rem = 64px
      const topMargin = 16; // 1rem = 16px
      const bottomMargin = 16; // 1rem = 16px

      // Calculate available height
      const availableHeight =
        screenHeight - navbarHeight - topMargin - bottomMargin;

      // Set minimum and maximum heights based on screen size
      let finalHeight;

      if (screenHeight <= 768) {
        // Mobile/Tablet - Use more space
        finalHeight = Math.max(availableHeight, 500);
      } else if (screenHeight <= 1024) {
        // Medium screens
        finalHeight = Math.max(availableHeight * 0.85, 600);
      } else if (screenHeight <= 1440) {
        // Large screens
        finalHeight = Math.max(availableHeight * 0.82, 700);
      } else {
        // Very large screens - Don't make it too tall
        finalHeight = Math.min(availableHeight * 0.78, 800);
      }

      setSidebarHeight(`${finalHeight}px`);
    };

    calculateHeight();

    // Debounced resize handler
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateHeight, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return sidebarHeight;
};

// ✅ Optimized debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ✅ Optimized deep copy function
const deepCopyItemOptimized = (item) => {
  if (!item) return null;
  
  const copy = { ...item };
  if (Array.isArray(item.children) && item.children.length > 0) {
    copy.children = item.children.map(child => deepCopyItemOptimized(child));
  } else {
    copy.children = [];
  }
  
  return copy;
};

const MapSidebar = memo(({ onWidthChange }) => {
  const [activeTab, setActiveTab] = useState("view");
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("group");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [originalExpandedGroups, setOriginalExpandedGroups] = useState({});
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [isPending, startTransition] = useTransition(); // For smooth tab transitions

  // ✅ Use dynamic height
  const sidebarHeight = useDynamicHeight();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const dispatch = useDispatch();

  // Selectors
  const connectionStatus = useSelector(selectConnectionStatus);
  const visuallySelectedItems = useSelector(selectVisuallySelectedItems);
  const rawCarData = useSelector(selectCarData);
  const rawVehicles = useSelector(selectRawVehicleList);
  const globalSearchQuery = useSelector(
    (state) => state.locationSearch.globalSearchQuery
  );
  const selectedVehiclesFromSlice = useSelector(selectSelectedVehicles);

  console.log(rawVehicles)

  // Memoized car data
  const carData = useMemo(() => {
    return rawCarData || [];
  }, [rawCarData]);

  useEffect(() => {
    if (onWidthChange) {
      const currentWidth = isExpanded ? 340 : 60;
      onWidthChange(currentWidth);
    }
  }, [isExpanded, onWidthChange]);

  // Memoized loading state
  const isLoading = useMemo(() => {
    return (
      connectionStatus === "connecting" ||
      ((!rawVehicles || rawVehicles.length === 0) &&
        connectionStatus !== "error")
    );
  }, [connectionStatus, rawVehicles]);

  // Update local search query when global search query changes
  useEffect(() => {
    setSearchQuery(globalSearchQuery || "");
  }, [globalSearchQuery]);

  // Tree organization function - optimized with memoization
  const organizeDataIntoTree = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const map = new Map();
    const roots = [];

    // First pass: create a map of all items
    for (const item of data) {
      if (item && item.id) {
        map.set(item.id, {
          ...item,
          children: [],
        });
      }
    }

    // Second pass: build the tree
    for (const item of data) {
      if (!item || !item.id) continue;

      if (item.parent === "#") {
        const mapItem = map.get(item.id);
        if (mapItem) {
          roots.push(mapItem);
        }
      } else {
        const parent = map.get(item.parent);
        const child = map.get(item.id);
        if (parent && child) {
          parent.children.push(child);
        } else if (item.parent === "-1" || item.parent === "-2") {
          const specialParent = map.get(item.parent);
          if (specialParent && child) {
            specialParent.children.push(child);
          }
        }
      }
    }

    // Optimized sorting function
    const sortChildren = (node) => {
      if (node?.children?.length > 0) {
        node.children.sort((a, b) => {
          if (a.Type === "Group" && b.Type !== "Group") return -1;
          if (a.Type !== "Group" && b.Type === "Group") return 1;
          return (a.orderby || 0) - (b.orderby || 0);
        });
        node.children.forEach(sortChildren);
      }
    };

    roots.forEach(sortChildren);
    return roots;
  }, []);

  // Memoized tree structure with performance tracking
  const treeStructure = useMemo(() => {
    if (!rawVehicles || rawVehicles.length === 0) return [];
    
    return organizeDataIntoTree(rawVehicles);
  }, [rawVehicles, organizeDataIntoTree]);

  // Auto-expand root nodes effect - optimized
  useEffect(() => {
    if (!rawVehicles?.length) return;
    
    const rootNodes = rawVehicles.filter((item) => item.parent === "#");
    if (rootNodes.length === 0) return;

    const expandedRootNodes = {};
    rootNodes.forEach(node => {
      expandedRootNodes[node.id] = true;
    });

    setExpandedGroups(prev => ({
      ...prev,
      ...expandedRootNodes,
    }));
  }, [rawVehicles]);

  // Helper functions for search - optimized
  const getGroupsToExpand = useCallback((items, searchQuery) => {
    if (!items || !searchQuery || !searchQuery.trim()) return new Set();
    
    const lowerQuery = searchQuery.toLowerCase();
    const groupsToExpand = new Set();

    const checkItem = (item) => {
      if (!item || item.Type !== "Group" || !item.children?.length) return false;
      
      const hasMatchingChild = item.children.some((child) => {
        if (child.Type === "Vehicle") {
          return child.text?.toLowerCase().includes(lowerQuery);
        } else if (child.Type === "Group") {
          return checkItem(child);
        }
        return false;
      });

      if (hasMatchingChild) {
        groupsToExpand.add(item.id);
      }

      item.children.forEach(checkItem);
      return hasMatchingChild;
    };

    items.forEach(checkItem);
    return groupsToExpand;
  }, []);

  // Search effect - optimized
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      if (Object.keys(originalExpandedGroups).length > 0) {
        setExpandedGroups(originalExpandedGroups);
        setOriginalExpandedGroups({});
      }
      return;
    }
    
    if (Object.keys(originalExpandedGroups).length === 0) {
      setOriginalExpandedGroups({ ...expandedGroups });
    }

    const groupsToExpand = getGroupsToExpand(
      treeStructure,
      debouncedSearchQuery
    );

    if (groupsToExpand.size === 0) return;

    setExpandedGroups((prev) => {
      const newState = { ...prev };
      groupsToExpand.forEach((groupId) => {
        newState[groupId] = true;
      });
      return newState;
    });
  }, [
    debouncedSearchQuery,
    treeStructure,
    expandedGroups,
    originalExpandedGroups,
    getGroupsToExpand,
  ]);

  // Search functions - optimized
  const itemMatchesSearch = useCallback((item, query) => {
    if (!item || !query || !query.trim()) return true;
    
    const lowerQuery = query.toLowerCase();
    
    // Check if item text matches
    if (item.text?.toLowerCase().includes(lowerQuery)) return true;

    // Check children recursively
    if (item.children?.length > 0) {
      return item.children.some((child) => itemMatchesSearch(child, lowerQuery));
    }

    return false;
  }, []);

  // Memoized filtered tree with performance optimization
  const filteredTree = useMemo(() => {
    if (!debouncedSearchQuery.trim() || !treeStructure?.length) {
      return treeStructure;
    }

    const filterTree = (items) => {
      if (!items?.length) return [];
      
      return items.reduce((filtered, item) => {
        if (itemMatchesSearch(item, debouncedSearchQuery)) {
          const itemCopy = deepCopyItemOptimized(item);
          
          if (itemCopy.children?.length > 0) {
            itemCopy.children = filterTree(itemCopy.children);
          }
          
          filtered.push(itemCopy);
        }
        return filtered;
      }, []);
    };

    const filtered = filterTree(treeStructure);
    return filtered.length ? filtered : treeStructure;
  }, [treeStructure, debouncedSearchQuery, itemMatchesSearch]);

  // Helper functions for item selection - optimized
  const getAllChildIds = useCallback((item) => {
    if (!item || !item.children?.length) return [];
    
    const ids = [];
    const stack = [...item.children];
    
    while (stack.length > 0) {
      const node = stack.pop();
      ids.push(node.id);
      
      if (node.children?.length > 0) {
        stack.push(...node.children);
      }
    }
    
    return ids;
  }, []);

  const getAllChildValueIds = useCallback((item) => {
    if (!item || !item.children?.length) return [];
    
    const valueIds = [];
    const stack = [...item.children];
    
    while (stack.length > 0) {
      const node = stack.pop();
      
      if (node.Type === "Vehicle" && node.valueId) {
        valueIds.push(node.valueId);
      }
      
      if (node.Type === "Group" && node.children?.length > 0) {
        stack.push(...node.children);
      }
    }
    
    return valueIds;
  }, []);

  // Event handlers - optimized
  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  const handleItemSelect = useCallback(
    (item, isChecked) => {
      if (!item) return;
      
      let newVisuallySelectedItems = [...visuallySelectedItems];
      let newSelectedVehicleIds = [...selectedVehicleIds];

      if (isChecked) {
        // Add current item
        if (!newVisuallySelectedItems.includes(item.id)) {
          newVisuallySelectedItems.push(item.id);
        }

        // Add vehicle ID if it's a vehicle
        if (item.Type === "Vehicle" && item.valueId) {
          if (!newSelectedVehicleIds.includes(item.valueId)) {
            newSelectedVehicleIds.push(item.valueId);
          }
        }

        // Add all children if it's a group
        if (item.Type === "Group" && item.children?.length > 0) {
          const childIds = getAllChildIds(item);
          childIds.forEach((id) => {
            if (!newVisuallySelectedItems.includes(id)) {
              newVisuallySelectedItems.push(id);
            }
          });

          const childValueIds = getAllChildValueIds(item);
          childValueIds.forEach((valueId) => {
            if (!newSelectedVehicleIds.includes(valueId)) {
              newSelectedVehicleIds.push(valueId);
            }
          });
        }
      } else {
        // Remove current item
        newVisuallySelectedItems = newVisuallySelectedItems.filter(
          (id) => id !== item.id
        );

        // Remove vehicle ID if it's a vehicle
        if (item.Type === "Vehicle" && item.valueId) {
          newSelectedVehicleIds = newSelectedVehicleIds.filter(
            (id) => id !== item.valueId
          );
        }

        // Remove all children if it's a group
        if (item.Type === "Group" && item.children?.length > 0) {
          const childIds = getAllChildIds(item);
          newVisuallySelectedItems = newVisuallySelectedItems.filter(
            (id) => !childIds.includes(id)
          );

          const childValueIds = getAllChildValueIds(item);
          newSelectedVehicleIds = newSelectedVehicleIds.filter(
            (id) => !childValueIds.includes(id)
          );
        }
      }

      dispatch(setVisuallySelectedItems(newVisuallySelectedItems));
      setSelectedVehicleIds(newSelectedVehicleIds);

      const numberArray = newSelectedVehicleIds.map((id) => Number(id));
      dispatch(updateVehicleFilter(numberArray));
    },
    [
      visuallySelectedItems,
      selectedVehicleIds,
      getAllChildIds,
      getAllChildValueIds,
      dispatch,
    ]
  );

  const deselectAll = () => {
    setSelectedVehicleIds([]);
    dispatch(setVisuallySelectedItems([]));
    dispatch(updateVehicleFilter([]));
  };

  const handleFilterChange = useCallback(
    (e) => {
      const newFilter = e.target.value;
      
      // Use transition for smoother UI during filter change
      startTransition(() => {
        setSelectedFilter(newFilter);
        setSearchQuery("");
        dispatch(setGlobalSearchQuery(""));

        setSelectedVehicleIds([]);
        dispatch(setVisuallySelectedItems([]));
        dispatch(updateVehicleFilter([]));
        dispatch(clearRawVehicleList());

        let scope = 3;
        if (newFilter === "vehicle") {
          scope = 1;
        } else if (newFilter === "driver") {
          scope = 2;
        }

        dispatch(requestVehicleListWithScope(scope));
      });
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      dispatch(setGlobalSearchQuery(value));
    },
    [dispatch]
  );

  // Tab handlers with transitions for smoother UI
  const handleViewTab = useCallback(() => {
    startTransition(() => {
      setActiveTab("view");
    });
  }, []);
  
  const handleVehiclesTab = useCallback(() => {
    startTransition(() => {
      setActiveTab("vehicles");
    });
  }, []);
  
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className={`bg-white flex flex-col transition-all duration-500 ease-in-out ${isExpanded ? 'w-[340px]' : 'w-[60px]'} h-full overflow-hidden relative`}>
      {/* Loading overlay during transitions */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      )}

      {isExpanded ? (
        // ✅ EXPANDED VIEW - Smooth fade in
        <div className="animate-in fade-in slide-in-from-left duration-300 h-full flex flex-col">
          {/* Top Navigation - Expanded */}
          <div className="flex relative flex-shrink-0 bg-[#1F557F]">
            <div
              className={`flex-1 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 h-[40px] ${activeTab === "view" ? "bg-white/10" : "opacity-50 hover:opacity-75"}`}
              onClick={handleViewTab}
            >
              <img src={sideIcon1} className="h-[22px] transition-transform duration-200" alt="" />
            </div>
            <div
              className={`flex-1 p-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 h-[40px] ${activeTab === "vehicles" ? "bg-white/10" : "opacity-50 hover:opacity-75"}`}
              onClick={handleVehiclesTab}
            >
              <img src={sideIcon2} className="h-[24px] transition-transform duration-200" alt="" />
            </div>

            {/* Expand/Collapse Button */}
            <div
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 group"
              onClick={handleToggleExpand}
            >
              <Minimize2 size={16} className="text-white group-hover:text-white/80 transition-all duration-200 group-hover:rotate-90" />
            </div>
          </div>

          {/* Content Area - Expanded */}
          <div className="flex-grow overflow-hidden border-r-4 border-[#1F557F]">
            {activeTab === "view" && (
              <div className="transition-all duration-300 ease-in-out h-full animate-in fade-in slide-in-from-bottom">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                  </div>
                }>
                  <TreeView
                    selectedFilter={selectedFilter}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    filteredTree={filteredTree}
                    selectedVehicleIds={selectedVehiclesFromSlice}
                    treeData={rawVehicles}
                    selectedItems={visuallySelectedItems}
                    expandedGroups={expandedGroups}
                    onToggleGroup={toggleGroup}
                    onItemSelect={handleItemSelect}
                    onDeselectAll={deselectAll}
                    isLoading={isLoading}
                    sidebarHeight={sidebarHeight}
                  />
                </Suspense>
              </div>
            )}

            {activeTab === "vehicles" && (
              <div className="transition-all duration-300 ease-in-out h-full animate-in fade-in slide-in-from-bottom">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                  </div>
                }>
                  <VehicleList
                    carData={carData}
                    isExpanded={isExpanded}
                    sidebarHeight={sidebarHeight}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ✅ COLLAPSED VIEW - Smooth animations
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
          {/* Expand Button - Top */}
          <div
            className="h-[50px] flex items-center justify-center cursor-pointer bg-[#1F557F] hover:bg-[#1e4a6f] transition-all duration-300 border-b border-white/20 group"
            onClick={handleToggleExpand}
            title="Expand Sidebar"
          >
            <Maximize2 size={18} className="text-white group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
          </div>

          {/* Tab 1 - Vehicle Selection */}
          <div
            className={`flex-1 flex items-center justify-center cursor-pointer transition-all duration-300 bg-[#1F557F] border-b border-white/20 group ${activeTab === "view"
              ? "bg-[#1a4a6b] shadow-inner "
              : "hover:bg-[#1e4a6f] "
              }`}
            onClick={() => {
              if (!isExpanded) {
                handleToggleExpand();
                setTimeout(() => handleViewTab(), 200);
              } else {
                handleViewTab();
              }
            }}
            title="Vehicle Selection"
          >
            <img
              src={sideIcon1}
              className={`h-[25px] transition-all duration-300 group-hover:scale-110 ${activeTab === "view" ? "scale-110 brightness-110" : "opacity-80"
                }`}
              alt="Vehicle Selection"
            />
          </div>

          {/* Tab 2 - Vehicle Status */}
          <div
            className={`flex-1 flex items-center justify-center cursor-pointer transition-all duration-300 bg-[#1F557F] group ${activeTab === "vehicles"
              ? "bg-[#1a4a6b] shadow-inner scale-105"
              : "hover:bg-[#1e4a6f] hover:scale-102"
              }`}
            onClick={() => {
              if (!isExpanded) {
                handleToggleExpand();
                setTimeout(() => handleVehiclesTab(), 200);
              } else {
                handleVehiclesTab();
              }
            }}
            title="Vehicle Status"
          >
            <img
              src={sideIcon2}
              className={`h-[26px] transition-all duration-300 group-hover:scale-110 ${activeTab === "vehicles" ? "scale-110 brightness-110" : "opacity-80"
                }`}
              alt="Vehicle Status"
            />
          </div>
        </div>
      )}
    </div>
  );
});

MapSidebar.displayName = "MapSidebar";

export default MapSidebar;
