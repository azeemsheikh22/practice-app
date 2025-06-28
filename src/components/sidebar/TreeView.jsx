import React from "react";
import TreeItem from "./TreeItem";
import { Search, Layers, Car, Users, ChevronDown } from "lucide-react";

const TreeView = ({
  selectedFilter,
  searchQuery,
  onSearchChange,
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
}) => {
  // Replace the handleFilterChange function
  const handleFilterChange = (e) => {
    const newFilter = e.target.value;

    // ✅ Don't clear any selections when switching filters
    // Let the parent component handle selection restoration

    onFilterChange(e);
  };

  // ✅ FIXED: Count only vehicles when in vehicle mode, only groups when in group mode
  const getSelectedCount = () => {
    return selectedVehicleIds.length;
  };

  const handleSelectAllVehicles = (isChecked) => {
    const vehicleItems = treeData.filter((item) => item.Type === "Vehicle");
    if (vehicleItems.length === 0) return;

    const allVehiclesItem = {
      id: "all-vehicles-container",
      Type: "Group",
      children: vehicleItems,
      valueId: null,
    };

    onItemSelect(allVehiclesItem, isChecked);
  };

  const areAllVehiclesSelected = () => {
    const vehicleItems = treeData.filter((item) => item.Type === "Vehicle");
    const selectedVehicleIds = selectedItems.filter((id) => {
      const item = treeData.find((i) => i.id === id);
      return item && item.Type === "Vehicle";
    });

    return (
      vehicleItems.length > 0 &&
      vehicleItems.length === selectedVehicleIds.length
    );
  };

  const renderTreeItem = (item, level = 0) => {
    const isGroup = item.Type === "Group";
    const isExpanded = expandedGroups[item.id];
    const isSelected = selectedItems.includes(item.id);

    // ✅ FIX: Check if group actually has children
    const hasChildren =
      isGroup &&
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <TreeItem
          item={item}
          level={level}
          isSelected={isSelected}
          isExpanded={isExpanded}
          hasChildren={hasChildren} // ✅ NEW: Pass hasChildren prop
          onToggleExpand={onToggleGroup}
          onSelect={onItemSelect}
        />

        {/* ✅ FIX: Only render children section if group has actual children */}
        {isGroup && hasChildren && isExpanded && (
          <div className="ml-3 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-200 ease-in-out">
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}

        {/* ✅ FIX: Only show loading for groups that should have children but are empty */}
        {isGroup &&
          isExpanded &&
          (!item.children || item.children.length === 0) &&
          isLoading && ( // ✅ Only show loading if actually loading
            <div className="ml-3 pl-2 py-1.5 transition-opacity duration-200 ease-in-out">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-primary rounded-full mr-2 animate-spin" />
                Loading...
              </div>
            </div>
          )}
      </React.Fragment>
    );
  };

  // ✅ FIXED: Vehicle items rendering
  const renderVehicleItems = () => {
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
            checked={areAllVehiclesSelected()}
            onChange={(e) => handleSelectAllVehicles(e.target.checked)}
            className="sr-only"
          />
          <label
            htmlFor="select-all-vehicles"
            className="flex items-center cursor-pointer w-full"
          >
            <div className="mr-2 flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {areAllVehiclesSelected() ? (
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
              Select All Vehicles
            </div>
          </label>
        </div>

        {filteredVehicles.map((item, index) => (
          <div
            key={item.id}
            className="transition-all duration-200 ease-in-out transform translate-y-0 opacity-100"
            style={{ transitionDelay: `${index * 30}ms` }}
          >
            <TreeItem
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onToggleExpand={onToggleGroup}
              onSelect={onItemSelect}
            />
          </div>
        ))}
      </>
    );
  };

  // ✅ FIXED: Driver items rendering - no loading loop
  const renderDriverItems = () => {
    const actualDrivers = treeData.filter((item) => item.Type === "Driver");

    // ✅ Show loading only when isLoading is true AND no drivers found
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

    // ✅ If no drivers found after loading, show no drivers message
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

    // ✅ Show drivers if available
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
        <TreeItem
          item={driver}
          isSelected={selectedItems.includes(driver.id)}
          onToggleExpand={onToggleGroup}
          onSelect={onItemSelect}
        />
      </div>
    ));
  };

  const renderLoadingSkeleton = () => {
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
  };

  return (
    <div className="p-3 transition-opacity duration-300 ease-in-out opacity-100">
      <div className="mb-3 relative transition-all duration-200 ease-in-out transform translate-y-0 opacity-100">
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

      {/* ✅ FIXED: Tree View with proper loading states */}
      <div className="ml-1 mt-3 space-y-1 bg-white xl:max-h-[61vh] overflow-auto transition-opacity duration-300 ease-in-out opacity-100">
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

      <div className="mt-3 transition-all duration-200 ease-in-out transform translate-y-0 opacity-100">
        <button
          onClick={onDeselectAll}
          className="w-full p-2 cursor-pointer bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200 ease-in-out font-medium text-sm border border-red-200"
        >
          Deselect All ({getSelectedCount()})
        </button>
      </div>
    </div>
  );
};

export default TreeView;
