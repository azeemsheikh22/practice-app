import React from "react";
import ReplayTreeItem from "./ReplayTreeItem";

const ReplayTreeView = ({
  vehicles,
  searchQuery,
  selectedVehicle,
  expandedGroups,
  onVehicleSelect,
  onToggleGroup,
}) => {
  // Organize data into tree structure (same logic as MapSidebar)
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

    // Sort children by orderby property
    const sortChildren = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.Type === "Group" && b.Type !== "Group") return -1;
          if (a.Type !== "Group" && b.Type === "Group") return 1;
          return a.orderby - b.orderby;
        });
        node.children.forEach((child) => sortChildren(child));
      }
    };

    roots.forEach((root) => sortChildren(root));
    return roots;
  };

  // Filter tree based on search query
  const filteredTree = React.useMemo(() => {
    const treeStructure = organizeDataIntoTree(vehicles);
    
    if (!searchQuery.trim()) return treeStructure;

    const itemMatchesSearch = (item) => {
      const matchesText = item.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesText) return true;

      if (item.children && item.children.length > 0) {
        return item.children.some((child) => itemMatchesSearch(child));
      }
      return false;
    };

    const filterTree = (items) => {
      return items.filter((item) => {
        const matches = itemMatchesSearch(item);
        if (matches && item.children && item.children.length > 0) {
          item.children = filterTree(item.children);
        }
        return matches;
      });
    };

    return filterTree([...treeStructure]);
  }, [vehicles, searchQuery]);

  const renderTreeItem = (item, level = 0) => {
    const isGroup = item.Type === "Group";
    const isExpanded = expandedGroups[item.id];
    const isSelected = selectedVehicle && selectedVehicle.id === item.id;

    return (
      <React.Fragment key={item.id}>
        <ReplayTreeItem
          item={item}
          level={level}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onToggleExpand={onToggleGroup}
          onSelect={onVehicleSelect}
        />

        {/* Render children if expanded */}
        {isGroup && isExpanded && item.children && item.children.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-sm">No vehicles available</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredTree.length > 0 ? (
        filteredTree.map((item) => renderTreeItem(item))
      ) : (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">No vehicles found</div>
          {searchQuery && (
            <div className="text-xs mt-1">Try adjusting your search</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReplayTreeView;
