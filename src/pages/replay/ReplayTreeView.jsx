import React from "react";
import ReplayTreeItem from "./ReplayTreeItem";

const ReplayTreeView = ({
  vehicles = [], // Default to empty array to prevent undefined errors
  searchQuery = "",
  selectedVehicle,
  expandedGroups = {},
  onVehicleSelect,
  onToggleGroup,
}) => {
  const organizeDataIntoTree = (data) => {
    // Check if data is undefined or not an array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const map = {};
    const roots = [];

    data.forEach((item) => {
      map[item.id] = {
        ...item,
        children: [],
      };
    });

    data.forEach((item) => {
      if (item.parent === "#") {
        roots.push(map[item.id]);
      } else if (map[item.parent]) {
        map[item.parent].children.push(map[item.id]);
      }
    });

    const sortChildren = (node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.Type === "Group" && b.Type !== "Group") return -1;
          if (a.Type !== "Group" && b.Type === "Group") return 1;
          return (a.orderby || 0) - (b.orderby || 0);
        });
        node.children.forEach((child) => sortChildren(child));
      }
    };

    roots.forEach((root) => sortChildren(root));
    return roots;
  };

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

        {isGroup && isExpanded && item.children && item.children.length > 0 && (
          <div>
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-sm">No vehicles available</div>
      </div>
    );
  }

  return (
    <div className="p-1">
      {filteredTree.length > 0 ? (
        <div>
          {filteredTree.map((item) => renderTreeItem(item))}
        </div>
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
