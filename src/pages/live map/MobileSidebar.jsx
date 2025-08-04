import { useState, useMemo, useEffect, useCallback, memo, lazy, Suspense, useTransition } from "react";
import { X } from "lucide-react";
import sideIcon1 from "../../assets/sideicon.png";
import sideIcon2 from "../../assets/sideicon2.png";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCarData,
  updateVehicleFilter,
  selectRawVehicleList,
  selectConnectionStatus,
  requestVehicleListWithScope,
  selectSelectedVehicles,
  clearRawVehicleList,
  clearCarDataAndSelectedVehicles,
} from "../../features/gpsTrackingSlice";
import {
  selectVisuallySelectedItems,
  setVisuallySelectedItems,
} from "../../features/mapInteractionSlice";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";

// Lazy load components for better initial loading
const TreeView = lazy(() => import("../../components/sidebar/TreeView"));
const VehicleList = lazy(() => import("../../components/sidebar/VehicleList"));

// ✅ OPTIMIZATION 1: Debounce hook for search - Improved
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

const MobileSidebar = memo(({ onClose, mobileHeight }) => {
  const [activeTab, setActiveTab] = useState("view");
  const [selectedFilter, setSelectedFilter] = useState("group");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [originalExpandedGroups, setOriginalExpandedGroups] = useState({});
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [isPending, startTransition] = useTransition(); // For smooth transitions

  // ✅ OPTIMIZATION 2: Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const dispatch = useDispatch();

  // ✅ OPTIMIZATION 3: Memoized selectors
  const selectedVehiclesFromSlice = useSelector(selectSelectedVehicles);
  const visuallySelectedItems = useSelector(selectVisuallySelectedItems);
  const connectionStatus = useSelector(selectConnectionStatus);
  const rawCarData = useSelector(selectCarData);
  const rawVehicles = useSelector(selectRawVehicleList);
  const globalSearchQuery = useSelector(
    (state) => state.locationSearch.globalSearchQuery
  );

  // ✅ Calculate mobile tree height - Optimized
  const mobileTreeHeight = useMemo(() => {
    if (mobileHeight && typeof mobileHeight === 'number') {
      return `${mobileHeight}px`;
    }
    return mobileHeight || 'calc(100vh - 144px)';
  }, [mobileHeight]);

  // ✅ OPTIMIZATION 4: Memoized car data
  const carData = useMemo(() => {
    return rawCarData || [];
  }, [rawCarData]);

  // ✅ OPTIMIZATION 5: Memoized loading state
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

  // ✅ OPTIMIZATION 6: Memoized tree organization function - Optimized
  const organizeDataIntoTree = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const map = new Map(); // Use Map instead of object for better performance
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

    // ✅ OPTIMIZATION 7: Optimized sorting
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

  // ✅ OPTIMIZATION 8: Memoized tree structure
  const treeStructure = useMemo(() => {
    if (!rawVehicles || rawVehicles.length === 0) return [];
    return organizeDataIntoTree(rawVehicles);
  }, [rawVehicles, organizeDataIntoTree]);

  // Auto-expand root nodes effect - Optimized
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

  // ✅ OPTIMIZATION 9: Memoized helper functions
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

  // ✅ OPTIMIZATION 10: Optimized search effect with debounced query
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

  // ✅ OPTIMIZATION 11: Memoized search functions
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

  // ✅ OPTIMIZATION 12: Optimized filtered tree with better memoization
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

  // ✅ OPTIMIZATION 13: Memoized event handlers
  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // ✅ OPTIMIZATION 14: Memoized helper functions for item selection
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

  const deselectAll = useCallback(() => {
    setSelectedVehicleIds([]);
    dispatch(setVisuallySelectedItems([]));
    dispatch(updateVehicleFilter([]));
    dispatch(clearCarDataAndSelectedVehicles());
  }, [dispatch]);

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

  // ✅ OPTIMIZATION 15: Memoized tab handlers with transitions
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

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden relative"> {/* ✅ Add relative for loading overlay */}
      {/* Loading overlay during transitions */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      )}

      {/* Tabs with close button integrated */}
      <div className="flex mb-2 bg-primary flex-shrink-0"> {/* ✅ Add flex-shrink-0 */}
        <button
          className={`flex-1 py-3 flex items-center justify-center ${activeTab === "view" ? "border-b-4 border-primary" : "text-white"
            }`}
          onClick={handleViewTab}
        >
          <img src={sideIcon1} className="h-5 w-5 mr-2" alt="View" />
          <span className="font-medium text-white text-sm">Groups</span>
        </button>
        <button
          className={`flex-1 py-3 flex items-center justify-center ${activeTab === "vehicles"
            ? "border-b-4 border-primary"
            : "text-gray-500"
            }`}
          onClick={handleVehiclesTab}
        >
          <img src={sideIcon2} className="h-5 w-5 mr-2" alt="Vehicles" />
          <span className="font-medium text-white text-sm">Vehicles</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-3 flex items-center justify-center text-white hover:bg-gray-100 transition-colors duration-200"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content - ✅ Use calculated height with Suspense for lazy loading */}
      <div
        className="flex-1 overflow-hidden"
        style={{ height: mobileTreeHeight }}
      >
        {activeTab === "view" ? (
          <div className="h-full"> {/* ✅ Full height container */}
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
                treeData={rawVehicles}
                selectedItems={visuallySelectedItems}
                selectedVehicleIds={selectedVehiclesFromSlice}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroup}
                onItemSelect={handleItemSelect}
                onDeselectAll={deselectAll}
                isLoading={isLoading}
                isMobile={true} // ✅ Pass mobile flag
                mobileHeight={mobileTreeHeight} // ✅ Pass mobile height
              />
            </Suspense>
          </div>
        ) : (
          <div className="h-full overflow-auto"> {/* ✅ Full height with scroll */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            }>
              <VehicleList
                carData={carData}
                isMobile={true}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
});

MobileSidebar.displayName = "MobileSidebar";

export default MobileSidebar;

