import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Car, Users, Layers, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { selectRawVehicleList, selectLoading } from '../../features/gpsTrackingSlice';

const SelectionModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  type = 'vehicle'  // vehicle, driver, or group
}) => {
  const [selectedItems, setSelectedItems] = useState([]); // Multi selection
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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
  
  // Reset selection when modal type changes
  useEffect(() => {
    setSelectedItems([]);
    setSearchQuery('');
    setExpandedGroups({});
  }, [type, isOpen]);
  
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
            return (a.text || '').localeCompare(b.text || '');
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

        const result = [];
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
      const rootNodes = treeStructure.filter((item) => item.parent === "#");
      
      if (rootNodes.length > 0) {
        setExpandedGroups((prev) => {
          const newExpanded = { ...prev };
          let hasChanges = false;

          rootNodes.forEach((node) => {
            // Always expand root nodes by default
            if (!(node.id in newExpanded) || !newExpanded[node.id]) {
              newExpanded[node.id] = true;
              hasChanges = true;
            }
          });

          return hasChanges ? newExpanded : prev;
        });
      }
    }
  }, [treeStructure]);

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
      case 'vehicle':
        filteredByType = rawVehicles.filter(item => item.Type === 'Vehicle');
        break;
      case 'driver':
        filteredByType = rawVehicles.filter(item => item.Type === 'Driver');
        break;
      case 'group':
        // For groups, return tree structure with search applied
        return filteredTree;
      default:
        filteredByType = [];
    }
    
    // Filter by search query (non-group types)
    if (debouncedSearchQuery.trim()) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      return filteredByType.filter(item => 
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
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }, []);

  // Tree Item Component (matching DashboardHeader TreeSelectItem)
  const TreeSelectItem = useCallback(({ item, level = 0 }) => {
    const isExpanded = expandedGroups[item.id];
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    const hasChildren = item.children && item.children.length > 0;
    // const isEntireFleet = item.text === "Entire Fleet" || item.text.toLowerCase().includes("entire fleet");

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
          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
            isSelected
              ? "border-blue-600 bg-blue-600"
              : "border-gray-300 hover:border-blue-600"
          }`}>
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>

          {/* Group Icon - Hide for Entire Fleet */}
          {/* {!isEntireFleet && (
            <Layers size={16} className="text-blue-600 mr-2" />
          )} */}

          {/* Group Name */}
          <span className={`text-sm font-medium flex-1 select-none ${
            isSelected ? "text-blue-600" : "text-gray-700"
          }`}>
            {item.text}
          </span>

          {/* Children Count - Hide for Entire Fleet */}
          {/* {hasChildren && !isEntireFleet && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
              {item.children.length}
            </span>
          )} */}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children.map((child) => (
              <TreeSelectItem
                key={child.id}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [expandedGroups, selectedItems, handleToggleExpand, handleItemSelect]);

  // Render list item (for virtual scrolling)
  const ListItem = useCallback(({ index, style }) => {
    const item = filteredItems[index];
    const isSelected = selectedItems.some(i => i.id === item.id);
    
    return (
      <div 
        style={style}
        className="flex items-center py-1 px-3 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleItemSelect(item)}
      >
        {/* Checkbox */}
        <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        
        {/* Type icon */}
        {item.Type === 'Vehicle' && <Car size={16} className="text-green-600 mr-2" />}
        {item.Type === 'Driver' && <Users size={16} className="text-violet-600 mr-2" />}
        
        {/* Text */}
        <div className="flex-1">
          <span className="text-sm text-gray-900">{item.text}</span>
          {item.Type === 'Vehicle' && item.VehicleReg && (
            <span className="text-xs text-gray-500 ml-2">({item.VehicleReg})</span>
          )}
        </div>
      </div>
    );
  }, [filteredItems, selectedItems, handleItemSelect]);

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
    switch(type) {
      case 'vehicle':
        return 'Select Vehicle from your fleet';
      case 'driver':
        return 'Select Driver from your fleet';
      case 'group':
        return 'Select Group from your fleet';
      default:
        return 'Select Item';
    }
  };
  
  const getIcon = () => {
    switch(type) {
      case 'vehicle':
        return <Car size={20} className="text-green-600" />;
      case 'driver':
        return <Users size={20} className="text-violet-600" />;
      case 'group':
        return <Layers size={20} className="text-blue-600" />;
      default:
        return null;
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    const selectedIds = selectedItems.map(item => item.valueId || item.id);
    onSave(selectedIds, selectedItems); // Send both IDs and full items
    onClose();
  };

  if (!isOpen) return null;

  // Use modal-root for overlay, fallback to document.body
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  }

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl z-10 mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxHeight: '80vh' }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-800">{getTitle()}</h3>
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
            <label htmlFor="search" className="mr-2 font-medium text-gray-700">Search:</label>
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
                  <div className="text-gray-500 font-medium">Loading {type}s...</div>
                  <div className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</div>
                </div>
              </div>
            ) : filteredItems.length > 0 ? (
              type === 'group' ? (
                // Tree view for groups (using TreeSelectItem from DashboardHeader)
                <div className="space-y-1">
                  {filteredItems.map(item => (
                    <TreeSelectItem key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                // Flat list for vehicles and drivers with virtual scrolling
                <div className="h-[300px]">
                  {renderFlatList()}
                </div>
              )
            ) : (
              <div className="py-8 text-center">
                <div className="flex flex-col items-center">
                  {getIcon()}
                  <div className="mt-3 text-gray-500 font-medium">
                    No {type}s found
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {searchQuery ? `No ${type}s match "${searchQuery}"` : `No ${type}s available in your fleet`}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Footer actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `Selected: ${selectedItems.length} items`}
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={selectedItems.length === 0 || isLoading}
                className={`px-4 py-2 text-sm rounded transition-colors cursor-pointer ${
                  selectedItems.length > 0 && !isLoading
                    ? 'bg-[#25689f] text-white hover:bg-[#1F557F]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Loading...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    modalRoot
  );
};

export default SelectionModal;
