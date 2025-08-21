import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { FixedSizeList as List } from 'react-window';
import { useSelector, useDispatch } from "react-redux";
import { setFilteredCount, resetExportType } from "../../features/alertSlice";
import Select from "react-select";
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { saveAs } from "file-saver";

export default function AlertLogTable({
  alertLogs = [],
  logLoading = false,
  logError = null,
  alarmSound = false,
}) {

  const onlyUnconfirmed = useSelector((state) => state.alert.onlyUnconfirmed);
  const searchQuery = useSelector((state) => state.alert.searchQuery);
  const exportType = useSelector((state) => state.alert.exportType);
  const [selectedRows, setSelectedRows] = useState({});

  // Use API data if available, otherwise fallback to sample data
  const logsToShow = alertLogs;

  // Column filters state
  const [vehicleFilter, setVehicleFilter] = useState(null);
  const [driverFilter, setDriverFilter] = useState(null);
  const [policyFilter, setPolicyFilter] = useState(null);
  const [alertTypeFilter, setAlertTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Filter options (from API keys)
  const vehicleOptions = Array.from(
    new Set(logsToShow.map((log) => log["Vehicle Name"] || log.vehicle))
  ).map((v) => ({ value: v, label: v }));
  const driverOptions = Array.from(
    new Set(logsToShow.map((log) => log["Driver_Name"] || log.driver))
  ).map((v) => ({ value: v, label: v }));
  const policyOptions = Array.from(
    new Set(logsToShow.map((log) => log["policyName"] || log.policyName))
  ).map((v) => ({ value: v, label: v }));
  const alertTypeOptions = Array.from(
    new Set(logsToShow.map((log) => log["ALARM_TYPE"] || log.alertType))
  ).map((v) => ({ value: v, label: v }));
  const statusOptions = Array.from(
    new Set(logsToShow.map((log) => log["Alarm_Status"] || log.status))
  ).map((v) => ({ value: v, label: v }));

  // Filtered data
  const filteredData = useMemo(() => {
    return logsToShow.filter((log) => {
      const vehicleVal = log["Vehicle Name"] || log.vehicle || "";
      const driverVal = log["Driver_Name"] || log.driver || "";
      const policyVal = log["policyName"] || log.policyName || "";
      const alertTypeVal = log["ALARM_TYPE"] || log.alertType || "";
      const statusVal = log["Alarm_Status"] || log.status || "";
      const alarmTriggeredVal = log["LastDateTime"] || log.alarmTriggered || "";
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
  }, [
    vehicleFilter,
    driverFilter,
    policyFilter,
    alertTypeFilter,
    statusFilter,
    logsToShow,
    searchQuery,
    onlyUnconfirmed,
  ]);

  const ROW_HEIGHT = 48; // px
  const TABLE_HEIGHT = 450; // px

  // Responsive width for react-window List
  const tableContainerRef = useRef(null);
  const [listWidth, setListWidth] = useState(0);
  useLayoutEffect(() => {
    function updateWidth() {
      if (tableContainerRef.current) {
        setListWidth(tableContainerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Sound ko repeat karne ke liye interval useEffect
  useEffect(() => {
    let intervalId = null;
    if (alarmSound) {
      intervalId = setInterval(() => {
        const matchingRows = filteredData.filter((row) => {
          const status = row["Alarm_Status"] || row.status;
          const priority = row["priority"] ?? row.priority;
          return status === "Un-Confirmed" && Number(priority) === 1;
        });
        if (matchingRows.length > 0) {
          if (typeof window !== "undefined") {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
            oscillator.connect(ctx.destination);
            oscillator.start();
            setTimeout(() => {
              oscillator.stop();
              ctx.close();
            }, 400); // 400ms beep
          }
        }
      }, 1000); // 1 second interval
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [filteredData, alarmSound]);
  const dispatch = useDispatch();

  // Sound bajanay ka logic (filteredData ke baad likhein)
  React.useEffect(() => {
    if (!alarmSound) return;
    // Check if koi row hai jisme Alarm_Status 'Un-Confirmed' aur priority 1 ho
    const found = filteredData.some((row) => {
      const status = row["Alarm_Status"] || row.status;
      const priority = row["priority"] ?? row.priority;
      return status === "Un-Confirmed" && Number(priority) === 1;
    });
    if (found) {
      // Simple beep (browser default)
      if (typeof window !== "undefined") {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz
        oscillator.connect(ctx.destination);
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          ctx.close();
        }, 400); // 400ms beep
      }
    }
  }, [filteredData, alarmSound]);

  // Update filteredCount in slice whenever filteredData changes
  useEffect(() => {
    dispatch(setFilteredCount(filteredData.length));
  }, [filteredData, dispatch]);

  // Row selection handlers
  const handleRowSelect = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectAll = () => {
    const allSelected =
      Object.keys(selectedRows).length === filteredData.length;
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

  const selectedCount = Object.keys(selectedRows).filter(
    (key) => selectedRows[key]
  ).length;

  const handleEdit = (log) => {
    console.log("Edit alert log:", log);
  };

  const handleDelete = (log) => {
    console.log("Delete alert log:", log);
  };

  // Truncate text function
  const truncateText = (text, maxLength = 25) => {
    if (!text || text.length <= maxLength) return text || "-";
    return text.substring(0, maxLength) + "...";
  };

  // CSV Export logic for alert logs
  useEffect(() => {
    if (exportType === "log-csv") {
      if (filteredData.length > 0) {
        const csvRows = [];
        // Header
        const headers = [
          "Vehicle",
          "Driver",
          "Policy Name",
          "Alert Type",
          "Alarm Triggered",
          "Status",
        ];
        csvRows.push(headers.join(","));
        // Data
        filteredData.forEach((row) => {
          csvRows.push(
            [
              '"' + (row["Vehicle Name"] || row.vehicle || "") + '"',
              '"' + (row["Driver_Name"] || row.driver || "") + '"',
              '"' + (row["policyName"] || row.policyName || "") + '"',
              '"' + (row["ALARM_TYPE"] || row.alertType || "") + '"',
              '"' + (row["LastDateTime"] || row.alarmTriggered || "") + '"',
              '"' + (row["Alarm_Status"] || row.status || "") + '"',
            ].join(",")
          );
        });
        const csvString = csvRows.join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "alert-logs.csv");
      }
      dispatch(resetExportType());
    }
  }, [exportType, filteredData, dispatch]);

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden relative mb-3">
      {/* Loading Spinner Overlay */}
      {logLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-amber-500 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-sm text-amber-600 font-medium">
              Loading alert logs...
            </span>
          </div>
        </div>
      )}
      {/* Responsive Table Container with shared horizontal scroll */}
      <div
        className=" w-full"
        ref={tableContainerRef}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ minWidth: '900px' }}>
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ minWidth: '40px', width: '40px' }} className="sm:min-w-[48px] sm:w-[48px]" />
              <col style={{ minWidth: '80px', width: '80px' }} className="sm:min-w-[120px] sm:w-auto" />
              <col style={{ minWidth: '60px', width: '60px' }} className="sm:min-w-[100px] sm:w-auto" />
              <col style={{ minWidth: '100px', width: '100px' }} className="sm:min-w-[180px] sm:w-auto" />
              <col style={{ minWidth: '70px', width: '70px' }} className="sm:min-w-[120px] sm:w-auto" />
              <col style={{ minWidth: '70px', width: '70px' }} className="sm:min-w-[120px] sm:w-auto" />
              <col style={{ minWidth: '60px', width: '60px' }} className="sm:min-w-[100px] sm:w-auto" />
              <col style={{ minWidth: '50px', width: '50px' }} className="sm:min-w-[90px] sm:w-auto" />
            </colgroup>
            {/* Table Header with Filters */}
            <thead className="bg-gray-100" style={{ position: 'sticky', top: 0, zIndex: 2, tableLayout: 'fixed' }}>
              <tr>
                <th className="px-3 py-3 text-left min-w-[40px] w-[40px] sm:min-w-[48px] sm:w-[48px]">
                  <input
                    type="checkbox"
                    checked={
                      selectedCount === filteredData.length &&
                      filteredData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 w-4 h-4 text-amber-500 focus:ring-amber-500/30"
                    disabled={filteredData.length === 0}
                  />
                </th>
                <th className="px-3 py-3 text-left min-w-[80px] w-[80px] sm:min-w-[120px] sm:w-auto">
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
                        container: (base) => ({
                          ...base,
                          fontSize: "12px",
                          fontWeight: "normal",
                          cursor: "pointer",
                        }),
                        control: (base) => ({ ...base, cursor: "pointer" }),
                      }}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-left min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto">
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
                        container: (base) => ({
                          ...base,
                          fontSize: "12px",
                          fontWeight: "normal",
                          cursor: "pointer",
                        }),
                        control: (base) => ({ ...base, cursor: "pointer" }),
                      }}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-left min-w-[100px] w-[100px] sm:min-w-[180px] sm:w-auto">
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
                        container: (base) => ({
                          ...base,
                          fontSize: "12px",
                          fontWeight: "normal",
                          cursor: "pointer",
                        }),
                        control: (base) => ({ ...base, cursor: "pointer" }),
                      }}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-left min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
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
                        container: (base) => ({
                          ...base,
                          fontSize: "12px",
                          fontWeight: "normal",
                          cursor: "pointer",
                        }),
                        control: (base) => ({ ...base, cursor: "pointer" }),
                      }}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-left min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Alarm Triggered
                  </div>
                </th>
                <th className="px-3 py-3 text-left min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto">
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
                        container: (base) => ({
                          ...base,
                          fontSize: "12px",
                          fontWeight: "normal",
                          cursor: "pointer",
                        }),
                        control: (base) => ({ ...base, cursor: "pointer" }),
                      }}
                    />
                  </div>
                </th>
                <th className="px-3 py-3 text-center min-w-[50px] w-[50px] sm:min-w-[90px] sm:w-auto">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
          </table>
          {/* Virtualized Table Body */}
          <div style={{ width: '100%', height: `${TABLE_HEIGHT}px` }}>
            {listWidth > 0 && (
              <List
                height={TABLE_HEIGHT}
                itemCount={filteredData.length}
                itemSize={ROW_HEIGHT}
                width={listWidth}
              >
                {({ index, style }) => {
                  const log = filteredData[index];
                  return (
                    <table style={{ tableLayout: 'fixed', width: '100%', ...style }} key={log.id}>
                      <colgroup>
                        <col style={{ minWidth: '40px', width: '40px' }} className="sm:min-w-[48px] sm:w-[48px]" />
                        <col style={{ minWidth: '80px', width: '80px' }} className="sm:min-w-[120px] sm:w-auto" />
                        <col style={{ minWidth: '60px', width: '60px' }} className="sm:min-w-[100px] sm:w-auto" />
                        <col style={{ minWidth: '100px', width: '100px' }} className="sm:min-w-[180px] sm:w-auto" />
                        <col style={{ minWidth: '70px', width: '70px' }} className="sm:min-w-[120px] sm:w-auto" />
                        <col style={{ minWidth: '70px', width: '70px' }} className="sm:min-w-[120px] sm:w-auto" />
                        <col style={{ minWidth: '60px', width: '60px' }} className="sm:min-w-[100px] sm:w-auto" />
                        <col style={{ minWidth: '50px', width: '50px' }} className="sm:min-w-[90px] sm:w-auto" />
                      </colgroup>
                      <tbody>
                        <tr
                          className={`hover:bg-gray-50 transition-colors ${selectedRows[index] ? "bg-amber-50" : ""}`}
                        >
                          <td className="px-3 py-3 min-w-[40px] w-[40px] sm:min-w-[48px] sm:w-[48px]">
                            <input
                              type="checkbox"
                              checked={selectedRows[index] || false}
                              onChange={() => handleRowSelect(index)}
                              className="rounded border-gray-300 w-4 h-4 text-amber-500 focus:ring-amber-500/30"
                            />
                          </td>
                          <td className="px-3 py-3 min-w-[80px] w-[80px] sm:min-w-[120px] sm:w-auto">
                            <div
                              className="text-sm font-medium text-gray-900"
                              title={log["Vehicle Name"] || log.vehicle}
                            >
                              {truncateText(log["Vehicle Name"] || log.vehicle, 20)}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto">
                            <div className="text-sm text-gray-600">
                              {log["Driver_Name"] || log.driver}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[100px] w-[100px] sm:min-w-[180px] sm:w-auto">
                            <div
                              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                              title={log["policyName"] || log.policyName}
                            >
                              {truncateText(log["policyName"] || log.policyName, 25)}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
                            <div
                              className="text-sm text-gray-600"
                              title={log["ALARM_TYPE"] || log.alertType}
                            >
                              {truncateText(log["ALARM_TYPE"] || log.alertType, 20)}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
                            <div className="text-sm text-gray-600">
                              {log["LastDateTime"] || log.alarmTriggered}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                (log["Alarm_Status"] || log.status) === "Un-Confirmed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {log["Alarm_Status"] || log.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center min-w-[50px] w-[50px] sm:min-w-[90px] sm:w-auto">
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
                        </tr>
                      </tbody>
                    </table>
                  );
                }}
              </List>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
