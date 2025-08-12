import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlertLogs, setOnlyUnconfirmed, setSearchQuery, setExportType } from "../../features/alertSlice";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  RefreshCw,
  Volume2,
  Check,
} from "lucide-react";

export default function AlertLogHeader({
  selectedTimeframe,
  setSelectedTimeframe,
  dateRange,
  autoRefresh,
  setAutoRefresh
}) {
  const dispatch = useDispatch();
  const onlyUnconfirmed = useSelector((state) => state.alert.onlyUnconfirmed);
  const searchQuery = useSelector((state) => state.alert.searchQuery);
  const [alarmSound, setAlarmSound] = React.useState(false);



  // Dynamic counts from slice
  const totalAlerts = useSelector((state) => state.alert.alertLogs.length);
  const filteredAlerts = useSelector((state) => state.alert.filteredCount);

  const handleRefresh = () => {
    dispatch(fetchAlertLogs(dateRange));
  };

  // Custom Checkbox Component
  const CustomCheckbox = ({ checked, onChange, children, id }) => {
    return (
      <motion.label
        htmlFor={id}
        className="flex items-center cursor-pointer group select-none"
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <motion.div
            className={`
              relative w-5 h-5 rounded-md border-2 transition-all duration-200 ease-in-out
              ${
                checked
                  ? "bg-blue-600 border-blue-600 shadow-sm"
                  : "bg-white border-gray-300 group-hover:border-gray-400"
              }
              group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-opacity-20
              group-hover:shadow-sm
            `}
            initial={false}
            animate={{
              scale: checked ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{
                opacity: checked ? 1 : 0,
                scale: checked ? 1 : 0.5,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Check size={12} className="text-white stroke-[3]" />
            </motion.div>
          </motion.div>
        </div>
        <motion.span
          className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap"
          initial={false}
          animate={{
            color: checked ? "#1f2937" : "#374151",
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </motion.label>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
    >
      {/* Compact Header with Title and Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 flex-shrink-0">
          Showing {filteredAlerts.toLocaleString()} of{" "}
          {totalAlerts.toLocaleString()} Alert Logs
        </h2>

        {/* Main Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Timeframe Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Alerts For:
            </label>
            <div className="relative min-w-[140px]">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="block w-full h-9 px-3 pr-8 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm bg-white"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>This Week</option>
                <option>Last Week</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Search:
            </label>
            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search for Record..."
                className="block w-full h-9 pl-9 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Display
      <div className="text-xs text-gray-500 mb-3 lg:text-right">
        {getDateRange()}
      </div> */}

      {/* Bottom Row - Options and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 lg:gap-8">
          {/* Only Un-Confirmed Alerts */}
          <CustomCheckbox
            id="unconfirmed-alerts"
            checked={onlyUnconfirmed}
            onChange={(e) => dispatch(setOnlyUnconfirmed(e.target.checked))}
          >
            Only Un-Confirmed Alerts
          </CustomCheckbox>

          {/* Alarm Sound */}
          <CustomCheckbox
            id="alarm-sound"
            checked={alarmSound}
            onChange={(e) => setAlarmSound(e.target.checked)}
          >
            <span className="flex items-center">
              <Volume2 size={14} className="mr-1.5" />
              Alarm Sound
            </span>
          </CustomCheckbox>

          {/* Auto Refresh */}
          <CustomCheckbox
            id="auto-refresh-checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          >
            Auto Refresh
          </CustomCheckbox>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {/* Export CSV Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(setExportType('log-csv'))}
            className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 outline-none cursor-pointer"
            title="Export CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M4.5 19.5A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v12.75z" />
            </svg>
          </motion.button>
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 outline-none cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
