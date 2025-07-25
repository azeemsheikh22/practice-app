import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Pencil, X, ChevronDown } from "lucide-react";

export default function AlertLogTable() {
  const [selectedRows, setSelectedRows] = useState({});

  // Sample alert log data
  const alertLogs = [
    {
      id: 1,
      vehicle: "TMM-371 48KL",
      driver: "-",
      policyName: "VTS-Cessation of transmission",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:17 PM",
      status: "Un-Confirmed"
    },
    {
      id: 2,
      vehicle: "TUF-188 21KL",
      driver: "-",
      policyName: "VTS-Cessation of transmission",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:17 PM",
      status: "Un-Confirmed"
    },
    {
      id: 3,
      vehicle: "TUF-660 21KL",
      driver: "-",
      policyName: "VTS-Suspicious Parking",
      alertType: "Long Stop",
      alarmTriggered: "24/07/2025 03:17 PM",
      status: "Un-Confirmed"
    },
    {
      id: 4,
      vehicle: "TUF-660 21KL",
      driver: "-",
      policyName: "VTS-Suspicious Parking",
      alertType: "Long Stop",
      alarmTriggered: "24/07/2025 03:17 PM",
      status: "Un-Confirmed"
    },
    {
      id: 5,
      vehicle: "JQ-1003 48KL",
      driver: "-",
      policyName: "VTS-Suspicious Parking",
      alertType: "Long Stop",
      alarmTriggered: "24/07/2025 03:16 PM",
      status: "Un-Confirmed"
    },
    {
      id: 6,
      vehicle: "TMM-371 48KL",
      driver: "-",
      policyName: "VTS-Cessation of transmission",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:15 PM",
      status: "Un-Confirmed"
    },
    {
      id: 7,
      vehicle: "GLTG-211 (Spot)",
      driver: "-",
      policyName: "VTS-Disconnection during driving",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:13 PM",
      status: "Un-Confirmed"
    },
    {
      id: 8,
      vehicle: "TUE-374 24KL",
      driver: "-",
      policyName: "VTS-Cessation of transmission",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:11 PM",
      status: "Un-Confirmed"
    },
    {
      id: 9,
      vehicle: "TUF-660 21KL",
      driver: "-",
      policyName: "VTS-Cessation of transmission",
      alertType: "Interruption of Transmission",
      alarmTriggered: "24/07/2025 03:10 PM",
      status: "Un-Confirmed"
    }
  ];

  // Column filters state
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [driverFilter, setDriverFilter] = useState("All Drivers");
  const [policyFilter, setPolicyFilter] = useState("All Policy");
  const [alertTypeFilter, setAlertTypeFilter] = useState("All Alerts");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Filter options
  const vehicleOptions = ["All Vehicles", ...new Set(alertLogs.map(log => log.vehicle))];
  const driverOptions = ["All Drivers", ...new Set(alertLogs.map(log => log.driver))];
  const policyOptions = ["All Policy", ...new Set(alertLogs.map(log => log.policyName))];
  const alertTypeOptions = ["All Alerts", ...new Set(alertLogs.map(log => log.alertType))];
  const statusOptions = ["All Status", ...new Set(alertLogs.map(log => log.status))];

  // Filtered data
  const filteredData = useMemo(() => {
    return alertLogs.filter(log => {
      return (
        (vehicleFilter === "All Vehicles" || log.vehicle === vehicleFilter) &&
        (driverFilter === "All Drivers" || log.driver === driverFilter) &&
        (policyFilter === "All Policy" || log.policyName === policyFilter) &&
        (alertTypeFilter === "All Alerts" || log.alertType === alertTypeFilter) &&
        (statusFilter === "All Status" || log.status === statusFilter)
      );
    });
  }, [vehicleFilter, driverFilter, policyFilter, alertTypeFilter, statusFilter]);

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

  const handleEdit = (log) => {
    console.log("Edit alert log:", log);
  };

  const handleDelete = (log) => {
    console.log("Delete alert log:", log);
  };

  // Truncate text function
  const truncateText = (text, maxLength = 25) => {
    if (!text || text.length <= maxLength) return text || '-';
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header with Filters */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedCount === filteredData.length && filteredData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4 text-amber-500 focus:ring-amber-500/30"
                  disabled={filteredData.length === 0}
                />
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Vehicle
                  </div>
                  <div className="relative">
                    <select
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 pr-6 appearance-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {vehicleOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Driver
                  </div>
                  <div className="relative">
                    <select
                      value={driverFilter}
                      onChange={(e) => setDriverFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 pr-6 appearance-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {driverOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Policy Name
                  </div>
                  <div className="relative">
                    <select
                      value={policyFilter}
                      onChange={(e) => setPolicyFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 pr-6 appearance-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {policyOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Alert Type
                  </div>
                  <div className="relative">
                    <select
                      value={alertTypeFilter}
                      onChange={(e) => setAlertTypeFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 pr-6 appearance-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {alertTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Alarm Triggered
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 pr-6 appearance-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-center">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">No alert logs found</div>
                    <div className="text-xs mt-1">No alerts match the current filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 w-4 h-4 text-amber-500 focus:ring-amber-500/30"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900" title={log.vehicle}>
                      {truncateText(log.vehicle, 20)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600">
                      {log.driver}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer" title={log.policyName}>
                      {truncateText(log.policyName, 25)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600" title={log.alertType}>
                      {truncateText(log.alertType, 20)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600">
                      {log.alarmTriggered}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === "Un-Confirmed" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(log)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Alert"
                      >
                        <Pencil className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(log)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Alert"
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
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Alert Logs: {filteredData.length}</span>
            {selectedCount > 0 && (
              <span>{selectedCount} alert{selectedCount > 1 ? 's' : ''} selected</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
