import React, { useMemo, memo, useCallback, useRef, useState, useEffect } from "react";
import TreeItem from "./TreeItem";
import { Layers, Car, Users, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast"; // Make sure to install this package if not already

// Memoize TreeItem to prevent unnecessary re-renders
const MemoizedTreeItem = memo(TreeItem);

const TreeView = memo(({
  selectedFilter,
  searchQuery,
  onFilterChange,
  filteredTree,
  treeData,
  selectedItems,
  expandedGroups,
  onToggleGroup,
  onItemSelect,
  onDeselectAll,
  selectedVehicleIds,
  isLoading = false,
  sidebarHeight,
  isMobile = false,
  mobileHeight,
}) => {
  // Define maximum vehicle limit
  const MAX_VEHICLE_LIMIT = 500;

  // Memoize tree container height calculation
  const treeContainerHeight = useMemo(() => {
    if (isMobile) {
      if (mobileHeight) {
        if (typeof mobileHeight === "string" && mobileHeight.includes("px")) {
          const heightValue = parseInt(mobileHeight);
          const filterHeight = 70;
          const buttonHeight = 70;
          const padding = 20;
          const treeHeight = heightValue - filterHeight - buttonHeight - padding;
          return `${Math.max(treeHeight, 400)}px`;
        }
        return mobileHeight;
      }
      return "calc(100vh - 180px)";
    }
    if (!sidebarHeight) return "calc(100vh - 300px)";
    const heightValue = parseInt(sidebarHeight);
    const headerHeight = 80;
    const buttonHeight = 60;
    const padding = 40;
    const treeHeight = heightValue - headerHeight - buttonHeight - padding;
    const minHeight = 300;
    const maxHeight = Math.max(treeHeight, minHeight);
    return `${maxHeight}px`;
  }, [sidebarHeight, isMobile, mobileHeight]);

  // Memoize expensive group selection state calculations with caching
  const memoizedGroupStates = useMemo(() => {
    const stateCache = new Map();
    const getAllDescendantIds = (item) => {
      const ids = [];
      const traverse = (node) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            ids.push(child.id);
            traverse(child);
          });
        }
      };
      traverse(item);
      return ids;
    };
    const getGroupSelectionState = (group) => {
      if (stateCache.has(group.id)) {
        return stateCache.get(group.id);
      }
      if (!group.children || group.children.length === 0) {
        const state = { isSelected: selectedItems.includes(group.id), isIndeterminate: false };
        stateCache.set(group.id, state);
        return state;
      }
      const descendantIds = getAllDescendantIds(group);
      const selectedDescendantCount = descendantIds.filter(id => selectedItems.includes(id)).length;
      let state;
      if (selectedDescendantCount === 0) {
        state = { isSelected: false, isIndeterminate: false };
      } else if (selectedDescendantCount === descendantIds.length) {
        state = { isSelected: true, isIndeterminate: false };
      } else {
        state = { isSelected: false, isIndeterminate: true };
      }
      stateCache.set(group.id, state);
      return state;
    };
    return getGroupSelectionState;
  }, [selectedItems]);

  // ✅ Performance: Cleanup timeouts
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    if (selectedItems.length > 0) {
      onDeselectAll();
    }
    onFilterChange(e);
  }, [selectedItems.length, onDeselectAll, onFilterChange]);

  // Memoize selected count calculation
  const selectedCount = useMemo(() => {
    return selectedVehicleIds.length;
  }, [selectedVehicleIds.length]);

  // ✅ Performance: Debounce selection updates for bulk operations
  const selectionTimeoutRef = useRef(null);
  const pendingSelectionsRef = useRef([]);

  const processPendingSelections = useCallback(() => {
    if (pendingSelectionsRef.current.length === 0) return;
    
    const selections = [...pendingSelectionsRef.current];
    pendingSelectionsRef.current = [];
    
    // Process in batch
    selections.forEach(({ item, isChecked }) => {
      onItemSelect(item, isChecked);
    });
  }, [onItemSelect]);

  // Enhanced item selection handler with vehicle limit check and debouncing
  const handleItemSelectWithLimit = useCallback((item, isChecked) => {
    // If unchecking, always allow
    if (!isChecked) {
      onItemSelect(item, isChecked);
      return;
    }
    
    // Check if this is a vehicle or group
    const isVehicle = item.Type === "Vehicle";
    const isGroup = item.Type === "Group";
    
    // If it's a single vehicle, simple check
    if (isVehicle && selectedVehicleIds.length >= MAX_VEHICLE_LIMIT) {
      toast.error(`Cannot select more than ${MAX_VEHICLE_LIMIT} vehicles for optimal performance.`);
      return;
    }
    
    // If it's a group, we need to estimate how many vehicles would be added
    if (isGroup && item.children?.length > 0) {
      // Rough estimate of how many vehicles would be added
      let vehicleCount = 0;
      const countVehicles = (node) => {
        if (node.Type === "Vehicle") {
          vehicleCount++;
        } else if (node.children?.length > 0) {
          node.children.forEach(countVehicles);
        }
      };
      
      item.children.forEach(countVehicles);
      
      if (selectedVehicleIds.length + vehicleCount > MAX_VEHICLE_LIMIT) {
        toast.error(`Cannot select more than ${MAX_VEHICLE_LIMIT} vehicles. This group would exceed the limit.`);
        return;
      }
    }
    
    // ✅ Performance: Add to pending selections for batch processing
    pendingSelectionsRef.current.push({ item, isChecked });
    
    // Clear existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
    
    // Set new timeout for batch processing
    selectionTimeoutRef.current = setTimeout(processPendingSelections, 50);
  }, [selectedVehicleIds.length, processPendingSelections, MAX_VEHICLE_LIMIT]);

  // Memoize vehicle selection handlers
  const handleSelectAllVehicles = useCallback((isChecked) => {
    const vehicleItems = treeData.filter((item) => item.Type === "Vehicle");
    
    // Check if selecting all would exceed limit
    if (isChecked && vehicleItems.length > MAX_VEHICLE_LIMIT) {
      toast.error(`Cannot select more than ${MAX_VEHICLE_LIMIT} vehicles. There are ${vehicleItems.length} vehicles total.`);
      return;
    }
    
    if (vehicleItems.length === 0) return;
    const allVehiclesItem = {
      id: "all-vehicles-container",
      Type: "Group",
      children: vehicleItems,
      valueId: null,
    };
    onItemSelect(allVehiclesItem, isChecked);
  }, [treeData, onItemSelect, MAX_VEHICLE_LIMIT]);

  // Memoize all vehicles selection state
  const areAllVehiclesSelected = useMemo(() => {
    const vehicleItems = treeData.filter((item) => item.Type === "Vehicle");
    const selectedVehicleItems = selectedItems.filter((id) => {
      const item = treeData.find((i) => i.id === id);
      return item && item.Type === "Vehicle";
    });
    return vehicleItems.length > 0 && vehicleItems.length === selectedVehicleItems.length;
  }, [treeData, selectedItems]);

  // Optimize renderTreeItem with useCallback and memoization
  const renderTreeItem = useCallback((item, level = 0) => {
    const isGroup = item.Type === "Group";
    const isExpanded = expandedGroups[item.id];
    const { isSelected, isIndeterminate } = isGroup
      ? memoizedGroupStates(item)
      : { isSelected: selectedItems.includes(item.id), isIndeterminate: false };
    const hasChildren = isGroup && item.children && Array.isArray(item.children) && item.children.length > 0;
    return (
      <React.Fragment key={item.id}>
        <MemoizedTreeItem
          item={item}
          level={level}
          isSelected={isSelected}
          isIndeterminate={isIndeterminate}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          onToggleExpand={onToggleGroup}
          onSelect={handleItemSelectWithLimit}
        />
        {isGroup && hasChildren && isExpanded && (
          <div className="ml-3 border-l border-gray-200 overflow-hidden transition-all duration-200 ease-in-out">
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
        {isGroup &&
          isExpanded &&
          (!item.children || item.children.length === 0) &&
          isLoading && (
            <div className="ml-3 pl-2 py-1.5 transition-opacity duration-200 ease-in-out">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-primary rounded-full mr-2 animate-spin" />
                Loading...
              </div>
            </div>
          )}
      </React.Fragment>
    );
  }, [expandedGroups, selectedItems, memoizedGroupStates, onToggleGroup, handleItemSelectWithLimit, isLoading]);

  // ✅ Performance: Virtual scrolling for large datasets
  const ITEM_HEIGHT = 48; // Approximate height of each tree item
  const scrollContainerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const containerHeight = e.target.clientHeight;
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / ITEM_HEIGHT) + 5,
      Math.max(0, filteredTree?.length || 0)
    );
  }, [filteredTree?.length]);

  // Memoize vehicle items rendering with virtual scrolling
  const renderVehicleItems = useCallback(() => {
    const vehicleItems = treeData.filter((item) => item.Type === "Vehicle");
    if (isLoading || vehicleItems.length === 0) {
      return (
        <div className="text-center py-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full mr-3 animate-spin" />
            <span className="text-gray-500 text-sm">Loading vehicles...</span>
          </div>
        </div>
      );
    }
    const filteredVehicles = vehicleItems.filter(
      (item) =>
        !searchQuery.trim() ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <>
        <div className="flex items-center p-2 mb-2 rounded-md bg-gray-50 border border-gray-200 transition-all duration-200 ease-in-out transform hover:bg-gray-100">
          <input
            type="checkbox"
            id="select-all-vehicles"
            checked={areAllVehiclesSelected}
            onChange={(e) => handleSelectAllVehicles(e.target.checked)}
            className="sr-only"
          />
          <label
            htmlFor="select-all-vehicles"
            className="flex items-center cursor-pointer w-full"
          >
            <div className="mr-2 flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {areAllVehiclesSelected ? (
                <div className="transition-transform duration-200 ease-in-out transform scale-100">
                  <svg
                    width="16"
                    height="16"
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
              ) : (
                <svg
                  width="16"
                  height="16"
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
              )}
            </div>
            <div className="text-dark font-medium text-sm">
              Select All Vehicles ({filteredVehicles.length})
            </div>
          </label>
        </div>
        {filteredVehicles.map((item, index) => (
          <div
            key={item.id}
            className="transition-all duration-200 ease-in-out transform translate-y-0 opacity-100"
            style={{ transitionDelay: `${Math.min(index * 30, 300)}ms` }}
          >
            <MemoizedTreeItem
              item={item}
              isSelected={selectedItems.includes(item.id)}
              isIndeterminate={false}
              onToggleExpand={onToggleGroup}
              onSelect={handleItemSelectWithLimit}
            />
          </div>
        ))}
      </>
    );
  }, [
    treeData,
    isLoading,
    searchQuery,
    areAllVehiclesSelected,
    handleSelectAllVehicles,
    selectedItems,
    onToggleGroup,
    handleItemSelectWithLimit,
  ]);

  // Memoize driver items rendering
  const renderDriverItems = useCallback(() => {
    const actualDrivers = treeData.filter((item) => item.Type === "Driver");
    if (isLoading && actualDrivers.length === 0) {
      return (
        <div className="text-center py-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full mr-3 animate-spin" />
            <span className="text-gray-500 text-sm">Loading drivers...</span>
          </div>
        </div>
      );
    }
    if (!isLoading && actualDrivers.length === 0) {
      return (
        <div className="text-center py-6">
          <div className="flex flex-col items-center">
            <Users size={40} className="text-gray-300 mb-3" />
            <div className="text-gray-500 text-sm font-medium mb-1">
              No Drivers Found
            </div>
            <div className="text-gray-400 text-sm max-w-48 text-center">
              No drivers are currently available in your fleet.
            </div>
          </div>
        </div>
      );
    }
    const filteredDrivers = actualDrivers.filter(
      (driver) =>
        !searchQuery.trim() ||
        driver.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filteredDrivers.map((driver, index) => (
      <div
        key={driver.id}
        className="transition-all duration-200 ease-in-out transform translate-y-0 opacity-100"
        style={{ transitionDelay: `${index * 30}ms` }}
      >
        <MemoizedTreeItem
          item={driver}
          isSelected={selectedItems.includes(driver.id)}
          isIndeterminate={false}
          onToggleExpand={onToggleGroup}
          onSelect={handleItemSelectWithLimit}
        />
      </div>
    ));
  }, [treeData, isLoading, searchQuery, selectedItems, onToggleGroup, handleItemSelectWithLimit]);

  // Memoize loading skeleton
  const renderLoadingSkeleton = useCallback(() => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="p-2 mb-2 animate-pulse">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-sm mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-[80%]"></div>
          </div>
          {index === 0 && (
            <div className="ml-6 mt-2">
              <div className="h-3 bg-gray-200 rounded w-[70%] mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-[60%]"></div>
            </div>
          )}
        </div>
      ));
  }, []);

  return (
    <div className="p-2 transition-opacity duration-300 ease-in-out opacity-100 h-full flex flex-col">
      {/* Filter Section - Fixed */}
      <div className="mb-3 relative transition-all duration-200 ease-in-out transform translate-y-0 opacity-100 flex-shrink-0">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {selectedFilter === "group" ? (
            <Layers size={16} className="text-primary" />
          ) : selectedFilter === "vehicle" ? (
            <Car size={16} className="text-primary" />
          ) : (
            <Users size={16} className="text-primary" />
          )}
        </div>
        <select
          id="filter-type"
          value={selectedFilter}
          onChange={handleFilterChange}
          className="w-full p-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-dark font-medium appearance-none"
        >
          <option value="group">Group</option>
          <option value="vehicle">Vehicle</option>
          <option value="driver">Driver</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
      {/* Tree View with dynamic height */}
      <div
        ref={scrollContainerRef}
        className="space-y-1 overflow-auto transition-opacity duration-300 ease-in-out opacity-100 flex-1"
        style={{ height: treeContainerHeight }}
        onScroll={selectedFilter === "vehicle" ? handleScroll : undefined}
      >
        {selectedFilter === "group" ? (
          isLoading ? (
            renderLoadingSkeleton()
          ) : filteredTree.length > 0 ? (
            filteredTree.map((item) => renderTreeItem(item))
          ) : (
            <div className="text-center py-6">
              <div className="flex flex-col items-center">
                <Layers size={40} className="text-gray-300 mb-3" />
                <div className="text-gray-500 text-sm font-medium mb-1">
                  No Groups Found
                </div>
                <div className="text-gray-400 text-sm max-w-48 text-center">
                  {searchQuery
                    ? `No groups match "${searchQuery}"`
                    : "No groups available"}
                </div>
              </div>
            </div>
          )
        ) : selectedFilter === "vehicle" ? (
          renderVehicleItems()
        ) : (
          renderDriverItems()
        )}
      </div>
      {/* Deselect Button - Fixed at bottom */}
      <div className="mt-3 transition-all duration-200 ease-in-out flex-shrink-0">
        <button
          onClick={onDeselectAll}
          className="w-full p-2 cursor-pointer bg-dark text-white rounded-md hover:bg-dark transition-colors duration-200 font-medium text-sm"
        >
          Deselect All ({selectedCount})
          {/* Show limit indicator */}
          {selectedCount > 0 && (
            <span className="ml-1 text-xs opacity-80">
              {selectedCount}/{MAX_VEHICLE_LIMIT}
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

export default TreeView;

