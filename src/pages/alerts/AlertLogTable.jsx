import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { FixedSizeList as List } from "react-window";
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

  // Helper function to check if a row is critical (priority=1 and status=Un-Confirmed)
  const isRowCritical = (row) => {
    if (!row) return false;

    const status = row["Alarm_Status"] || row.status;
    const priority = Number(
      row["Priority"] || row["priority"] || row.priority || 0
    );

    // Critical alerts have priority=1 and status=Un-Confirmed
    return status === "Un-Confirmed" && priority === 1;
  };

  // Filtered data
  const filteredData = useMemo(() => {
    const filtered = logsToShow.filter((log) => {
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

    // Sort data to put critical items at the top
    return filtered.sort((a, b) => {
      const aIsCritical = isRowCritical(a);
      const bIsCritical = isRowCritical(b);

      // If a is critical and b is not, a comes first
      if (aIsCritical && !bIsCritical) return -1;
      // If b is critical and a is not, b comes first
      if (bIsCritical && !aIsCritical) return 1;

      // If both are critical or both are not critical, sort by timestamp (newest first)
      const aTime = a["LastDateTime"] || a.alarmTriggered || "";
      const bTime = b["LastDateTime"] || b.alarmTriggered || "";

      // Reverse the comparison to get newest first
      return bTime.localeCompare(aTime);
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
    isRowCritical,
  ]);

  const ROW_HEIGHT = 48; // px - more compact row height
  const TABLE_HEIGHT = 450; // px

  // Compact select styles for filters
  const compactSelectStyles = {
    container: (base) => ({
      ...base,
      fontSize: "11px",
      fontWeight: "normal",
      cursor: "pointer",
    }),
    control: (base) => ({
      ...base,
      cursor: "pointer",
      minHeight: "28px",
      height: "28px",
      padding: "0 0",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      marginTop: "-4px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "28px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    menu: (base) => ({
      ...base,
      fontSize: "11px",
    }),
  };

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
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Sound ko repeat karne ke liye interval useEffect
  useEffect(() => {
    let intervalId = null;
    if (alarmSound) {
      intervalId = setInterval(() => {
        const matchingRows = filteredData.filter(isRowCritical);
        if (matchingRows.length > 0) {
          if (typeof window !== "undefined") {
            const ctx = new (window.AudioContext ||
              window.webkitAudioContext)();
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
  useEffect(() => {
    if (!alarmSound) return;
    // Check if koi row hai jisme Alarm_Status 'Un-Confirmed' aur priority 1 ho
    const found = filteredData.some(isRowCritical);
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
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ minWidth: "900px" }} className="table-container">
          <table
            className="w-full border-collapse"
            style={{ tableLayout: "fixed", borderSpacing: 0 }}
          >
            <colgroup>
              <col
                style={{ minWidth: "40px", width: "40px" }}
                className="sm:min-w-[48px] sm:w-[48px]"
              />
              <col
                style={{ minWidth: "80px", width: "80px" }}
                className="sm:min-w-[120px] sm:w-auto"
              />
              <col
                style={{ minWidth: "60px", width: "60px" }}
                className="sm:min-w-[100px] sm:w-auto"
              />
              <col
                style={{ minWidth: "100px", width: "100px" }}
                className="sm:min-w-[180px] sm:w-auto"
              />
              <col
                style={{ minWidth: "70px", width: "70px" }}
                className="sm:min-w-[120px] sm:w-auto"
              />
              <col
                style={{ minWidth: "70px", width: "70px" }}
                className="sm:min-w-[120px] sm:w-auto"
              />
              <col
                style={{ minWidth: "60px", width: "60px" }}
                className="sm:min-w-[100px] sm:w-auto"
              />
              <col
                style={{ minWidth: "50px", width: "50px" }}
                className="sm:min-w-[90px] sm:w-auto"
              />
            </colgroup>
            {/* Table Header with Filters */}
            <thead
              className="bg-gray-100"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                tableLayout: "fixed",
              }}
            >
              <tr>
                <th className="px-2 py-2 text-left min-w-[40px] w-[40px] sm:min-w-[48px] sm:w-[48px]">
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
                <th className="px-2 py-2 text-left min-w-[80px] w-[80px] sm:min-w-[120px] sm:w-auto">
                  <div className="space-y-0.5">
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
                      styles={compactSelectStyles}
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
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-2 py-2 text-left min-w-[100px] w-[100px] sm:min-w-[180px] sm:w-auto">
                  <div className="space-y-0.5">
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
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-2 py-2 text-left min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
                  <div className="space-y-0.5">
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
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-2 py-2 text-left min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Alarm Triggered
                  </div>
                </th>
                <th className="px-2 py-2 text-left min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto">
                  <div className="space-y-0.5">
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
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-2 py-2 text-center min-w-[50px] w-[50px] sm:min-w-[90px] sm:w-auto">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
          </table>
          {/* Virtualized Table Body */}
          <div
            style={{ width: "100%", height: `${TABLE_HEIGHT}px` }}
            className="scrollbar-stable"
          >
            {listWidth > 0 && (
              <List
                height={TABLE_HEIGHT}
                itemCount={filteredData.length}
                itemSize={ROW_HEIGHT}
                width={listWidth}
                className="scrollbar-stable"
              >
                {({ index, style }) => {
                  const log = filteredData[index];
                  return (
                    <table
                      style={{ tableLayout: "fixed", width: "100%", ...style }}
                      key={log.id}
                    >
                      <colgroup>
                        <col
                          style={{ minWidth: "40px", width: "40px" }}
                          className="sm:min-w-[48px] sm:w-[48px]"
                        />
                        <col
                          style={{ minWidth: "80px", width: "80px" }}
                          className="sm:min-w-[120px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "60px", width: "60px" }}
                          className="sm:min-w-[100px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "100px", width: "100px" }}
                          className="sm:min-w-[180px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "70px", width: "70px" }}
                          className="sm:min-w-[120px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "70px", width: "70px" }}
                          className="sm:min-w-[120px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "60px", width: "60px" }}
                          className="sm:min-w-[100px] sm:w-auto"
                        />
                        <col
                          style={{ minWidth: "50px", width: "50px" }}
                          className="sm:min-w-[90px] sm:w-auto"
                        />
                      </colgroup>
                      <tbody>
                        <tr
                          className={`transition-colors border-b ${
                            selectedRows[index]
                              ? "bg-amber-50"
                              : isRowCritical(log)
                              ? "alert-row-critical"
                              : "border-gray-200"
                          }`}
                        >
                          <td className="px-3 py-3 min-w-[40px] w-[40px] sm:min-w-[48px] sm:w-[48px] align-middle h-[48px]">
                            <input
                              type="checkbox"
                              checked={selectedRows[index] || false}
                              onChange={() => handleRowSelect(index)}
                              className="rounded border-gray-300 w-4 h-4 text-amber-500 focus:ring-amber-500/30"
                            />
                          </td>
                          <td className="px-3 py-3 min-w-[80px] w-[80px] sm:min-w-[120px] sm:w-auto align-middle h-[48px]">
                            <div
                              className="text-sm font-medium text-gray-900 truncate"
                              title={log["Vehicle Name"] || log.vehicle}
                            >
                              {truncateText(
                                log["Vehicle Name"] || log.vehicle,
                                20
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto align-middle h-[48px]">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={log["Driver_Name"] || log.driver}
                            >
                              {truncateText(
                                log["Driver_Name"] || log.driver,
                                20
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[100px] w-[100px] sm:min-w-[180px] sm:w-auto align-middle h-[48px]">
                            <div
                              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer truncate"
                              title={log["policyName"] || log.policyName}
                            >
                              {truncateText(
                                log["policyName"] || log.policyName,
                                25
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto align-middle h-[48px]">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={log["ALARM_TYPE"] || log.alertType}
                            >
                              {truncateText(
                                log["ALARM_TYPE"] || log.alertType,
                                20
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[70px] w-[70px] sm:min-w-[120px] sm:w-auto align-middle h-[48px]">
                            <div
                              className="text-sm text-gray-600 truncate"
                              title={log["LastDateTime"] || log.alarmTriggered}
                            >
                              {log["LastDateTime"] || log.alarmTriggered}
                            </div>
                          </td>
                          <td className="px-3 py-3 min-w-[60px] w-[60px] sm:min-w-[100px] sm:w-auto align-middle h-[48px]">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${
                                (log["Alarm_Status"] || log.status) ===
                                "Un-Confirmed"
                                  ? isRowCritical(log)
                                    ? "bg-red-100 text-red-800 ring-1 ring-red-500"
                                    : "bg-red-50 text-red-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {isRowCritical(log) && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-3 h-3 flex-shrink-0"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                  />
                                </svg>
                              )}
                              <span className="whitespace-nowrap">
                                {log["Alarm_Status"] || log.status}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center min-w-[50px] w-[50px] sm:min-w-[90px] sm:w-auto align-middle h-[48px]">
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
