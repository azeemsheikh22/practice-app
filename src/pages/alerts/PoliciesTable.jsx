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

export default function PoliciesTable() {
  const [selectedRows, setSelectedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showUserPoliciesOnly, setShowUserPoliciesOnly] = useState(false);

  // Sample policy data matching the screenshot
  const policyData = [
    {
      id: 1,
      policyName: "VTS-Harsh Acceleration-all Area-Alarm",
      alertType: "Quick Start",
      status: "Disabled",
      lastTriggered: "-"
    },
    {
      id: 2,
      policyName: "VTS-Long Stop",
      alertType: "Excess Idling",
      status: "Enabled",
      lastTriggered: "-"
    },
    {
      id: 3,
      policyName: "VTS-Long Stop",
      alertType: "Long Stop",
      status: "Enabled",
      lastTriggered: "-"
    },
    {
      id: 4,
      policyName: "VTS-Inactivity Reporting",
      alertType: "Inactivity",
      status: "Enabled",
      lastTriggered: "-"
    },
    {
      id: 5,
      policyName: "VTS-INACTIVITY REPORTING IN ALL AREA",
      alertType: "Interruption of Transmission",
      status: "Disabled",
      lastTriggered: "-"
    },
    {
      id: 6,
      policyName: "VTS-Harsh Braking-all Area-Alarm",
      alertType: "Hard braking Alert",
      status: "Enabled",
      lastTriggered: "04/06/2025 08:04 PM"
    },
    {
      id: 7,
      policyName: "VTS-Harsh Acceleration-all Area-Alarm",
      alertType: "Quick Start",
      status: "Enabled",
      lastTriggered: "06/06/2025 02:29 PM"
    },
    {
      id: 8,
      policyName: "DEVIATIONS ALERTS (TPPL)",
      alertType: "Geofence",
      status: "Enabled",
      lastTriggered: "-"
    },
    {
      id: 9,
      policyName: "Humayun Panic Alert",
      alertType: "Panic Alert",
      status: "Enabled",
      lastTriggered: "14/07/2025 04:50 PM"
    },
    {
      id: 10,
      policyName: "KE Rule",
      alertType: "Activity",
      status: "Disabled",
      lastTriggered: "-"
    },
    {
      id: 11,
      policyName: "Kiamari / Gatti BS alert",
      alertType: "Long Stop",
      status: "Disabled",
      lastTriggered: "-"
    },
    {
      id: 12,
      policyName: "MDVR Driver Smoking Alert",
      alertType: "MDVR Driver Smoking Alert",
      status: "Enabled",
      lastTriggered: "07/06/2024 04:35 PM"
    }
  ];

  // Filter data based on search query
  const filteredData = useMemo(() => {
    let filtered = policyData.filter(policy => {
      const matchesSearch = !searchQuery || 
        policy.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.alertType.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
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
  }, [searchQuery, sortConfig]);

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
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
 

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedCount === filteredData.length && filteredData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4 text-blue-500 focus:ring-blue-500/30"
                  disabled={filteredData.length === 0}
                />
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('policyName')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Policy Name
                  {getSortIcon('policyName')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('alertType')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Alert Type
                  {getSortIcon('alertType')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('lastTriggered')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider hover:text-blue-600 transition-colors"
                >
                  Last Triggered Date & Time
                  {getSortIcon('lastTriggered')}
                </button>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium">No policies found</div>
                    <div className="text-sm mt-1">No policies match the current search criteria</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((policy, index) => (
                <motion.tr
                  key={policy.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 w-4 h-4 text-blue-500 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                      {policy.policyName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {policy.alertType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      policy.status === "Enabled" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {policy.lastTriggered}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
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

      {/* Table Footer */}
      {filteredData.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
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