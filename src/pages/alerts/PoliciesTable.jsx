import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  X, 
  Download,
  Copy,
  FileSpreadsheet,
  FileText,
  File
} from "lucide-react";

// Policy Name Display with See More functionality
const PolicyNameDisplay = ({ name }) => {
  const [showFull, setShowFull] = useState(false);
  const maxLength = 25;

  if (!name || name.length <= maxLength) {
    return (
      <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-sm" title={name}>
        {name || "N/A"}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div
        className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
        title={name}
        onClick={() => setShowFull(!showFull)}
      >
        {showFull ? name : `${name.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={() => setShowFull(!showFull)}
        className="text-xs text-[#D52B1E] hover:text-[#B8241A] font-medium flex-shrink-0"
      >
        {showFull ? "Less" : "More"}
      </button>
    </div>
  );
};

export default function PoliciesTable({ 
  policyData = [], 
  searchQuery = "", 
  loading = false, 
  error = null 
}) {
  const [selectedRows, setSelectedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showUserPoliciesOnly, setShowUserPoliciesOnly] = useState(false);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    let filtered = policyData.filter(policy => {
      const matchesSearch = !searchQuery || 
        policy.policyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.alertName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.userName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        // Handle different field mappings
        switch (sortConfig.key) {
          case 'policyName':
            aValue = a.policyName || '';
            bValue = b.policyName || '';
            break;
          case 'alertType':
            aValue = a.alertName || '';
            bValue = b.alertName || '';
            break;
          case 'status':
            aValue = a.STATUS || '';
            bValue = b.STATUS || '';
            break;
          case 'lastTriggered':
            aValue = a.lastTrigered || '';
            bValue = b.lastTrigered || '';
            break;
          default:
            aValue = a[sortConfig.key] || '';
            bValue = b[sortConfig.key] || '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [policyData, searchQuery, sortConfig]);

  // Sorting handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Row selection handlers
  const handleRowSelect = (index) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(selectedRows).length === filteredData.length;
    if (allSelected) {
      setSelectedRows({});
    } else {
      const newSelection = {};
      filteredData.forEach((_, index) => {
        newSelection[index] = true;
      });
      setSelectedRows(newSelection);
    }
  };

  const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

  // Export handlers
  const handleExport = (type) => {
    console.log(`Exporting as ${type}`);
    setShowExportDropdown(false);
    // Add export logic here
  };

  // Action handlers
  const handleEdit = (policy) => {
    console.log("Edit policy:", policy);
  };

  const handleDelete = (policy) => {
    console.log("Delete policy:", policy);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp size={14} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={14} className="text-blue-600" /> : 
      <ChevronDown size={14} className="text-blue-600" />;
  };

  return (
    <div className="bg-white border-gray-200 overflow-hidden relative">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header - Compact */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedCount === filteredData.length && filteredData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4 text-blue-500 focus:ring-blue-500/30"
                  disabled={filteredData.length === 0}
                />
              </th>
              <th className="px-3 py-2 text-left">
                <button
                  onClick={() => handleSort('policyName')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Policy Name
                  {getSortIcon('policyName')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button
                  onClick={() => handleSort('alertType')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Alert Type
                  {getSortIcon('alertType')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button
                  onClick={() => handleSort('lastTriggered')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Last Triggered
                  {getSortIcon('lastTriggered')}
                </button>
              </th>
              <th className="px-3 py-2 text-center">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body - Compact */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-3 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">Loading policies...</div>
                    <div className="text-xs mt-1">Please wait while we fetch the data</div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-3 py-8 text-center">
                  <div className="text-red-500">
                    <div className="text-sm font-medium">Error loading policies</div>
                    <div className="text-xs mt-1">{error}</div>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">No policies found</div>
                    <div className="text-xs mt-1">No policies match the current search criteria</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((policy, index) => (
                <motion.tr
                  key={policy.idx || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 w-4 h-4 text-blue-500 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <PolicyNameDisplay name={policy.policyName} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-900">
                      {policy.alertName || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      policy.STATUS === "Enabled" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {policy.STATUS || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-900">
                      {policy.lastTrigered || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(policy)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Policy"
                      >
                        <Pencil className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(policy)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Policy"
                      >
                        <X className="w-4 h-4 text-red-600 group-hover:text-red-800" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer - Compact */}
      {filteredData.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Total Policies: {filteredData.length}</span>
            {selectedCount > 0 && (
              <span>{selectedCount} polic{selectedCount > 1 ? 'ies' : 'y'} selected</span>
            )}
          </div>
        </div>
      )}

      {/* Click outside handler for dropdown */}
      {showExportDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportDropdown(false)}
        />
      )}
    </div>
  );
}