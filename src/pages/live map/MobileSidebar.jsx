import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";
import sideIcon1 from "../../assets/sideicon.png";
import sideIcon2 from "../../assets/sideicon2.png";
import TreeView from "../../components/sidebar/TreeView";
import VehicleList from "../../components/sidebar/VehicleList";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCarData,
  updateVehicleFilter,
  selectRawVehicleList,
  selectConnectionStatus,
  requestVehicleListWithScope,
  selectSelectedVehicles,
  clearRawVehicleList,
} from "../../features/gpsTrackingSlice";
import {
  selectVisuallySelectedItems,
  setVisuallySelectedItems,
} from "../../features/mapInteractionSlice";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";

// ✅ OPTIMIZATION 1: Debounce hook for search
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

const MobileSidebar = memo(({ onClose }) => {
  const [activeTab, setActiveTab] = useState("view");
  const [selectedFilter, setSelectedFilter] = useState("group");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [originalExpandedGroups, setOriginalExpandedGroups] = useState({});
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

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

  // ✅ OPTIMIZATION 6: Memoized tree organization function
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
    return organizeDataIntoTree(rawVehicles);
  }, [rawVehicles, organizeDataIntoTree]);

  // Auto-expand root nodes effect
  useEffect(() => {
    if (rawVehicles?.length > 0) {
      const rootNodes = rawVehicles.filter((item) => item.parent === "#");

      if (rootNodes.length > 0) {
        const expandedRootNodes = rootNodes.reduce((acc, node) => {
          acc[node.id] = true;
          return acc;
        }, {});

        setExpandedGroups((prev) => ({
          ...prev,
          ...expandedRootNodes,
        }));
      }
    }
  }, [rawVehicles]);

  // ✅ OPTIMIZATION 9: Memoized helper functions
  const getGroupsToExpand = useCallback((items, searchQuery) => {
    const groupsToExpand = new Set();

    const checkItem = (item) => {
      if (item.Type === "Group" && item.children?.length > 0) {
        const hasMatchingChild = item.children.some((child) => {
          if (child.Type === "Vehicle") {
            return child.text
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
          } else if (child.Type === "Group") {
            return checkItem(child);
          }
          return false;
        });

        if (hasMatchingChild) {
          groupsToExpand.add(item.id);
        }

        item.children.forEach(checkItem);
      }
    };

    items.forEach(checkItem);
    return groupsToExpand;
  }, []);

  // ✅ OPTIMIZATION 10: Optimized search effect with debounced query
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      if (Object.keys(originalExpandedGroups).length === 0) {
        setOriginalExpandedGroups({ ...expandedGroups });
      }

      const groupsToExpand = getGroupsToExpand(
        treeStructure,
        debouncedSearchQuery
      );

      setExpandedGroups((prev) => {
        const newState = { ...prev };
        groupsToExpand.forEach((groupId) => {
          newState[groupId] = true;
        });
        return newState;
      });
    } else {
      if (Object.keys(originalExpandedGroups).length > 0) {
        setExpandedGroups(originalExpandedGroups);
        setOriginalExpandedGroups({});
      }
    }
  }, [
    debouncedSearchQuery,
    treeStructure,
    expandedGroups,
    originalExpandedGroups,
    getGroupsToExpand,
  ]);

  // ✅ OPTIMIZATION 11: Memoized search functions
  const itemMatchesSearch = useCallback((item, query) => {
    const matchesText = item.text?.toLowerCase().includes(query.toLowerCase());
    if (matchesText) return true;

    if (item.children?.length > 0) {
      return item.children.some((child) => itemMatchesSearch(child, query));
    }

    return false;
  }, []);

  const deepCopyItem = useCallback((item) => {
    return {
      ...item,
      children: item.children
        ? item.children.map((child) => deepCopyItem(child))
        : [],
    };
  }, []);

  // ✅ OPTIMIZATION 12: Optimized filtered tree with better memoization
  const filteredTree = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return treeStructure;
    }

    const filterTree = (items) => {
      const filteredItems = [];

      for (const item of items) {
        if (itemMatchesSearch(item, debouncedSearchQuery)) {
          const itemCopy = deepCopyItem(item);

          if (itemCopy.children?.length > 0) {
            itemCopy.children = filterTree(itemCopy.children);
          }

          filteredItems.push(itemCopy);
        }
      }

      return filteredItems;
    };

    const filtered = filterTree(treeStructure);

    if (filtered.length === 0) {
      return treeStructure;
    }

    return filtered;
  }, [treeStructure, debouncedSearchQuery, itemMatchesSearch, deepCopyItem]);

  // ✅ OPTIMIZATION 13: Memoized event handlers
  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // ✅ OPTIMIZATION 14: Memoized helper functions for item selection
  const getAllChildIds = useCallback((item) => {
    const ids = [];

    const collectIds = (node) => {
      if (node.children?.length > 0) {
        for (const child of node.children) {
          ids.push(child.id);
          collectIds(child);
        }
      }
    };

    collectIds(item);
    return ids;
  }, []);

  const getAllChildValueIds = useCallback((item) => {
    const valueIds = [];

    const collectValueIds = (node) => {
      if (node.children?.length > 0) {
        for (const child of node.children) {
          if (child.Type === "Vehicle" && child.valueId) {
            valueIds.push(child.valueId);
          }
          if (child.Type === "Group") {
            collectValueIds(child);
          }
        }
      }
    };

    collectValueIds(item);
    return valueIds;
  }, []);

  const handleItemSelect = useCallback(
    (item, isChecked) => {
      let newVisuallySelectedItems = [...visuallySelectedItems];
      let newSelectedVehicleIds = [...selectedVehicleIds];

      if (isChecked) {
        if (!newVisuallySelectedItems.includes(item.id)) {
          newVisuallySelectedItems.push(item.id);
        }

        if (item.Type === "Vehicle" && item.valueId) {
          if (!newSelectedVehicleIds.includes(item.valueId)) {
            newSelectedVehicleIds.push(item.valueId);
          }
        }

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
        newVisuallySelectedItems = newVisuallySelectedItems.filter(
          (id) => id !== item.id
        );

        if (item.Type === "Vehicle" && item.valueId) {
          newSelectedVehicleIds = newSelectedVehicleIds.filter(
            (id) => id !== item.valueId
          );
        }

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
  }, [dispatch]);

  const handleFilterChange = useCallback(
    (e) => {
      const newFilter = e.target.value;
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

  // ✅ OPTIMIZATION 15: Memoized tab handlers
  const handleViewTab = useCallback(() => setActiveTab("view"), []);
  const handleVehiclesTab = useCallback(() => setActiveTab("vehicles"), []);

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Tabs with close button integrated */}
      <div className="flex mb-2">
        <button
          className={`flex-1 py-3 flex items-center justify-center ${
            activeTab === "view" ? "border-b-4 border-primary" : "text-gray-500"
          }`}
          onClick={handleViewTab}
        >
          <img src={sideIcon1} className="h-6 w-6 mr-2" alt="View" />
          <span className="font-medium">Groups</span>
        </button>
        <button
          className={`flex-1 py-3 flex items-center justify-center ${
            activeTab === "vehicles"
              ? "border-b-4 border-primary"
              : "text-gray-500"
          }`}
          onClick={handleVehiclesTab}
        >
          <img src={sideIcon2} className="h-6 w-6 mr-2" alt="Vehicles" />
          <span className="font-medium">Vehicles</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-3 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto">
        {activeTab === "view" ? (
          <div className="px-2">
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
            />
          </div>
        ) : (
          <div className="px-2">
            <VehicleList carData={carData} />
          </div>
        )}
      </div>
    </div>
  );
});

MobileSidebar.displayName = "MobileSidebar";

export default MobileSidebar;
