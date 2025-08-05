import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilteredCount } from "../../features/alertSlice";
import Select from 'react-select';
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";

export default function AlertLogTable({ alertLogs = [], logLoading = false, logError = null }) {
  const dispatch = useDispatch();
  // Redux global filters
  const onlyUnconfirmed = useSelector(state => state.alert.onlyUnconfirmed);
  const searchQuery = useSelector(state => state.alert.searchQuery);
  const [selectedRows, setSelectedRows] = useState({});


  // Use API data if available, otherwise fallback to sample data
  const logsToShow = alertLogs;

  // Log API data for verification
  useEffect(() => {
    if (alertLogs && alertLogs.length > 0) {
      console.log("Alert Logs API Data:", alertLogs);
    }
  }, [alertLogs]);

  // Column filters state
  const [vehicleFilter, setVehicleFilter] = useState(null);
  const [driverFilter, setDriverFilter] = useState(null);
  const [policyFilter, setPolicyFilter] = useState(null);
  const [alertTypeFilter, setAlertTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Filter options (from API keys)
  const vehicleOptions = Array.from(new Set(logsToShow.map(log => log["Vehicle Name"] || log.vehicle))).map(v => ({ value: v, label: v }));
  const driverOptions = Array.from(new Set(logsToShow.map(log => log["Driver_Name"] || log.driver))).map(v => ({ value: v, label: v }));
  const policyOptions = Array.from(new Set(logsToShow.map(log => log["policyName"] || log.policyName))).map(v => ({ value: v, label: v }));
  const alertTypeOptions = Array.from(new Set(logsToShow.map(log => log["ALARM_TYPE"] || log.alertType))).map(v => ({ value: v, label: v }));
  const statusOptions = Array.from(new Set(logsToShow.map(log => log["Alarm_Status"] || log.status))).map(v => ({ value: v, label: v }));

  // Filtered data
  const filteredData = useMemo(() => {
    return logsToShow.filter(log => {
      const vehicleVal = (log["Vehicle Name"] || log.vehicle) || "";
      const driverVal = (log["Driver_Name"] || log.driver) || "";
      const policyVal = (log["policyName"] || log.policyName) || "";
      const alertTypeVal = (log["ALARM_TYPE"] || log.alertType) || "";
      const statusVal = (log["Alarm_Status"] || log.status) || "";
      const alarmTriggeredVal = (log["LastDateTime"] || log.alarmTriggered) || "";
      // Search query matches any major column
      const searchLower = (searchQuery || "").toLowerCase();
      const matchesSearch =
        searchLower === "" ||
        vehicleVal.toLowerCase().includes(searchLower) ||
        driverVal.toLowerCase().includes(searchLower) ||
        policyVal.toLowerCase().includes(searchLower) ||
        alertTypeVal.toLowerCase().includes(searchLower) ||
        statusVal.toLowerCase().includes(searchLower) ||
        alarmTriggeredVal.toLowerCase().includes(searchLower);
      return (
        (!vehicleFilter || vehicleVal === vehicleFilter.value) &&
        (!driverFilter || driverVal === driverFilter.value) &&
        (!policyFilter || policyVal === policyFilter.value) &&
        (!alertTypeFilter || alertTypeVal === alertTypeFilter.value) &&
        (!statusFilter || statusVal === statusFilter.value) &&
        matchesSearch &&
        (!onlyUnconfirmed || statusVal === "Un-Confirmed")
      );
    });
  }, [vehicleFilter, driverFilter, policyFilter, alertTypeFilter, statusFilter, logsToShow, searchQuery, onlyUnconfirmed]);

  // Update filteredCount in slice whenever filteredData changes
  useEffect(() => {
    dispatch(setFilteredCount(filteredData.length));
  }, [filteredData, dispatch]);

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
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden relative ">
      {/* Loading Spinner Overlay */}
      {logLoading && (
        <div className="absolute inset-0 bg-white  bg-opacity-70 flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-amber-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-sm text-amber-600 font-medium">Loading alert logs...</span>
          </div>
        </div>
      )}
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[450px]">
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
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vehicle
                  </div>
                  <Select
                    options={vehicleOptions}
                    value={vehicleFilter}
                    onChange={setVehicleFilter}
                    isClearable
                    placeholder="All Vehicles"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({ ...base, fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }),
                      control: (base) => ({ ...base, cursor: 'pointer' })
                    }}
                  />
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Driver
                  </div>
                  <Select
                    options={driverOptions}
                    value={driverFilter}
                    onChange={setDriverFilter}
                    isClearable
                    placeholder="All Drivers"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({ ...base, fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }),
                      control: (base) => ({ ...base, cursor: 'pointer' })
                    }}
                  />
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Policy Name
                  </div>
                  <Select
                    options={policyOptions}
                    value={policyFilter}
                    onChange={setPolicyFilter}
                    isClearable
                    placeholder="All Policy"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({ ...base, fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }),
                      control: (base) => ({ ...base, cursor: 'pointer' })
                    }}
                  />
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Alert Type
                  </div>
                  <Select
                    options={alertTypeOptions}
                    value={alertTypeFilter}
                    onChange={setAlertTypeFilter}
                    isClearable
                    placeholder="All Alerts"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({ ...base, fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }),
                      control: (base) => ({ ...base, cursor: 'pointer' })
                    }}
                  />
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Alarm Triggered
                </div>
              </th>
              <th className="px-3 py-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    isClearable
                    placeholder="All Status"
                    classNamePrefix="react-select"
                    styles={{
                      container: (base) => ({ ...base, fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }),
                      control: (base) => ({ ...base, cursor: 'pointer' })
                    }}
                  />
                </div>
              </th>
              <th className="px-3 py-3 text-center">
                <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
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
                    <div className="text-sm font-medium text-gray-900" title={log["Vehicle Name"] || log.vehicle}>
                      {truncateText(log["Vehicle Name"] || log.vehicle, 20)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600">
                      {log["Driver_Name"] || log.driver}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer" title={log["policyName"] || log.policyName}>
                      {truncateText(log["policyName"] || log.policyName, 25)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600" title={log["ALARM_TYPE"] || log.alertType}>
                      {truncateText(log["ALARM_TYPE"] || log.alertType, 20)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-600">
                      {log["LastDateTime"] || log.alarmTriggered}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (log["Alarm_Status"] || log.status) === "Un-Confirmed" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {log["Alarm_Status"] || log.status}
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
    </div>
  );
}
