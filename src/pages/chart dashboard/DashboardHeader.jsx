import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Search,
  Edit3,
  Plus,
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  Minus,
  Trash2,
} from "lucide-react";
import AddDashboardCategoryModal from "./AddDashboardCategoryModal";
import { useSelector, useDispatch } from "react-redux";
import { selectRawVehicleList } from "../../features/gpsTrackingSlice";
import { fetchUserDashboardByCategory } from "../../features/chartApiSlice";

const DashboardHeader = ({
  selectedReport,
  onReportChange,
  selectedGroup,
  onGroupChange,
  onEditDashboard,
  onAddMetric,
  onPrint,
  onExportExcel,
  onExportCSV,
  dashboardCategories,
}) => {
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const reportDropdownRef = useRef(null);
  const dispatch = useDispatch();

  // Use dashboardCategories for report options
  const reportOptions = useMemo(() => {
    if (Array.isArray(dashboardCategories) && dashboardCategories.length > 0) {
      return dashboardCategories.map((cat) => ({
        id: cat.id,
        label: cat.FullName,
        description: '',
      }));
    }
    return [];
  }, [dashboardCategories]);

  // Select first category by default if none selected
  useEffect(() => {
    if (
      reportOptions.length > 0 &&
      (!selectedReport || !selectedReport.id)
    ) {
      onReportChange(reportOptions[0]);
      dispatch(fetchUserDashboardByCategory({ catid: reportOptions[0].id }));
    }
  }, [reportOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reportDropdownRef.current &&
        !reportDropdownRef.current.contains(event.target)
      ) {
        setIsReportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReportSelect = (report) => {
    onReportChange(report);
    setIsReportDropdownOpen(false);
    if (report && report.id) {
      dispatch(fetchUserDashboardByCategory({ catid: report.id }));
    }
  };

  const handleGroupSelect = () => {
    setIsTreeModalOpen(true);
  };
  // Edit Dashboard Modal handlers
  const handleEditDashboard = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveDashboard = () => {
    setIsEditModalOpen(false);
    if (onEditDashboard) {
      onEditDashboard({ name: dashboardName, action: "save" });
    }
  };

  const handleRemoveGroup = () => {
    onGroupChange(null);
  };

  const handleCancelEdit = () => {
    setDashboardName("My Dashboard"); // Reset to original
    setIsEditModalOpen(false);
  };


  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Report Selection & Groups */}
          <div className="flex flex-col items-center sm:flex-row gap-4 flex-1">
            {/* Report Type Dropdown */}
            <div className="relative min-w-[280px]" ref={reportDropdownRef}>
              <button
                onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-[#25689f] focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-all duration-200 cursor-pointer" // ✅ Changed to blue theme
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#25689f] rounded-full mr-3"></div>{" "}
                  {/* ✅ Changed to blue theme */}
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedReport
                        ? selectedReport.label
                        : "Select Report Type"}
                    </div>
                    {selectedReport && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {selectedReport.description}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isReportDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isReportDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                  >
                    {reportOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleReportSelect(option)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {option.label}
                          </div>
                        </div>
                      </button>
                    ))}
                    {/* Add New Dashboard row */}
                    <button
                      onClick={() => {
                        setIsReportDropdownOpen(false);
                        setIsAddCategoryModalOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 cursor-pointer text-[#25689f] font-semibold"
                    >
                      + Add New Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Group & Group Selection */}
            <div className="flex-1 min-w-[250px]">
              <div className="flex items-center gap-2">
                {/* Selected Group */}
                {selectedGroup ? (
                  <div className="inline-flex items-center px-3 py-1.5 bg-[#25689f]/10 text-[#25689f] rounded-full text-sm font-medium">
                    {" "}
                    {/* ✅ Changed to blue theme */}
                    <span className="truncate max-w-[120px]">
                      {selectedGroup.text}
                    </span>
                    <button
                      onClick={handleRemoveGroup}
                      className="ml-2 hover:bg-[#25689f]/20 rounded-full p-0.5 transition-colors cursor-pointer" // ✅ Changed to blue theme
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : null}

                {/* Select Group Button */}
                <button
                  onClick={handleGroupSelect}
                  className="inline-flex items-center px-3 py-1.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:border-[#25689f] hover:text-[#25689f] transition-all duration-200 cursor-pointer" // ✅ Changed to blue theme
                >
                  <Plus size={14} className="mr-1" />
                  {selectedGroup ? "Change Group" : "Select Group"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit Dashboard */}
            <button
              onClick={handleEditDashboard}
              className="flex items-center px-4 py-2 bg-[#25689f] text-white rounded-lg hover:bg-[#1F557F] transition-colors duration-200 text-sm font-medium cursor-pointer" // ✅ Changed to blue theme
            >
              <Edit3 size={16} className="mr-2" />
              Edit Dashboard
            </button>

            {/* Add Metric */}
            <button
              onClick={onAddMetric}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium cursor-pointer"
            >
              <Plus size={16} className="mr-2" />
              Add Metric
            </button>

            {/* Export Options */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={onPrint}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-r border-gray-200 cursor-pointer"
                title="Print"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={onExportExcel}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 border-r border-gray-200 cursor-pointer"
                title="Export Excel"
              >
                <FileSpreadsheet size={16} />
              </button>
              <button
                onClick={onExportCSV}
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                title="Export CSV"
              >
                <FileText size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Selection Modal */}
      {isTreeModalOpen && (
        <GroupSelectionModal
          isOpen={isTreeModalOpen}
          onClose={() => setIsTreeModalOpen(false)}
          selectedGroup={selectedGroup}
          onGroupChange={onGroupChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Edit Dashboard Modal */}
      {isEditModalOpen && (
        <EditDashboardModal
          isOpen={isEditModalOpen}
          dashboardName={dashboardName}
          onNameChange={setDashboardName}
          onSave={handleSaveDashboard}
          onDelete={handleDeleteDashboard}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Add Dashboard Category Modal */}
      {isAddCategoryModalOpen && (
        <AddDashboardCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSave={(name) => {
            // TODO: handle save logic (API call or state update)
            setIsAddCategoryModalOpen(false);
          }}
        />
      )}
    </>
  );
};

// Edit Dashboard Modal Component
const EditDashboardModal = ({
  isOpen,
  dashboardName,
  onNameChange,
  onSave,
  onDelete,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[802] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-xl"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Dashboard
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          <div>
            <label
              htmlFor="dashboard-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              id="dashboard-name"
              type="text"
              value={dashboardName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f]" // ✅ Changed to blue theme
              placeholder="Enter dashboard name"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          {/* Delete Button - Left side */}
          <button
            onClick={onDelete}
            className="flex items-center px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Dashboard
          </button>

          {/* Cancel & Save Buttons - Right side */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!dashboardName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#25689f] border border-transparent rounded-lg hover:bg-[#1F557F] focus:outline-none focus:ring-2 focus:ring-[#25689f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer" // ✅ Changed to blue theme
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Group Selection Modal Component with Tree Structure
const GroupSelectionModal = ({
  isOpen,
  onClose,
  selectedGroup,
  onGroupChange,
  searchQuery,
  onSearchChange,
}) => {
  const [tempSelectedGroup, setTempSelectedGroup] = useState(selectedGroup);
  const [expandedGroups, setExpandedGroups] = useState({});

  const rawVehicles = useSelector(selectRawVehicleList);

  // Filter only groups (no vehicles)
  const groupsOnly = useMemo(() => {
    return rawVehicles.filter((item) => item.Type === "Group");
  }, [rawVehicles]);

  // Organize data into tree structure
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

  // Search functionality
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

  // Auto-expand root nodes
  useEffect(() => {
    if (groupsOnly.length > 0) {
      const rootNodes = groupsOnly.filter((item) => item.parent === "#");
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
  }, [groupsOnly.length]);

  // Expand all when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allGroupIds = groupsOnly.reduce((acc, group) => {
        acc[group.id] = true;
        return acc;
      }, {});
      setExpandedGroups(allGroupIds);
    }
  }, [searchQuery, groupsOnly.length]);

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  // Handle group selection (single select)
  const handleGroupSelection = useCallback((item) => {
    setTempSelectedGroup(item);
  }, []);

  // Check if group is selected
  const isGroupSelected = useCallback(
    (groupId) => {
      return tempSelectedGroup?.id === groupId;
    },
    [tempSelectedGroup]
  );

  const handleSave = () => {
    onGroupChange(tempSelectedGroup);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedGroup(selectedGroup);
    onClose();
  };

  // Tree Item Component
  const TreeSelectItem = React.memo(({ item, level = 0 }) => {
    const isExpanded = expandedGroups[item.id];
    const isSelected = isGroupSelected(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div>
        <div
          onClick={() => handleGroupSelection(item)}
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors select-none ${
            isSelected ? "bg-[#25689f]/10 border border-[#25689f]/20" : "" // ✅ Changed to blue theme
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

          {/* Selection Indicator */}
          <div
            className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
              isSelected
                ? "border-[#25689f] bg-[#25689f]" // ✅ Changed to blue theme
                : "border-gray-300 hover:border-[#25689f]" // ✅ Changed to blue theme
            }`}
          >
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>

          {/* Group Name */}
          <span
            className={`text-sm font-medium flex-1 select-none ${
              isSelected ? "text-[#25689f]" : "text-gray-700" // ✅ Changed to blue theme
            }`}
          >
            {item.text}
          </span>

          {/* Children Count */}
          {hasChildren && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {item.children.length}
            </span>
          )}
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
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-[802] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Group
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f]" // ✅ Changed to blue theme
            />
          </div>
        </div>

        {/* Groups Tree */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {filteredTree.length > 0 ? (
            <div className="space-y-1">
              {filteredTree.map((item) => (
                <TreeSelectItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">
                {searchQuery
                  ? "No groups found matching your search"
                  : "No groups available"}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {tempSelectedGroup
              ? `Selected: ${tempSelectedGroup.text}`
              : "No group selected"}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!tempSelectedGroup}
              className="px-4 py-2 text-sm font-medium text-white bg-[#25689f] border border-transparent rounded-md hover:bg-[#1F557F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer" // ✅ Changed to blue theme
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHeader;
