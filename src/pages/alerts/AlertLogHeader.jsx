import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  RefreshCw,
  RotateCcw,
  Volume2,
} from "lucide-react";

export default function AlertLogHeader() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("This Week");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUnconfirmed, setOnlyUnconfirmed] = useState(false);
  const [alarmSound, setAlarmSound] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sample data - you can replace with actual data
  const totalAlerts = 820;
  const filteredAlerts = 820;

  // Get date range based on selected timeframe
  const getDateRange = () => {
    const today = new Date();
    const endDate = today.toLocaleDateString('en-GB');
    
    switch (selectedTimeframe) {
      case "Today":
        return `${endDate} - ${endDate}`;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return `${yesterday.toLocaleDateString('en-GB')} - ${yesterday.toLocaleDateString('en-GB')}`;
      case "This Week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return `${weekStart.toLocaleDateString('en-GB')} - ${endDate}`;
      case "Last Week":
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return `${lastWeekStart.toLocaleDateString('en-GB')} - ${lastWeekEnd.toLocaleDateString('en-GB')}`;
      default:
        return `${endDate} - ${endDate}`;
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing alert logs...");
    // Add refresh logic here
  };

  const handleAutoRefresh = () => {
    console.log("Auto refresh toggled");
    // Add auto refresh logic here
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
          Showing {filteredAlerts.toLocaleString()} of {totalAlerts.toLocaleString()} Alert Logs
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
                className="block w-full h-9 px-3 pr-8 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 text-sm bg-white"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Record..."
                className="block w-full h-9 pl-9 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 text-sm placeholder-gray-400"
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
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          {/* Only Un-Confirmed Alerts */}
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={onlyUnconfirmed}
              onChange={(e) => setOnlyUnconfirmed(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 focus:ring-1 w-4 h-4 transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
              Only Un-Confirmed Alerts
            </span>
          </label>

          {/* Alarm Sound */}
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={alarmSound}
              onChange={(e) => setAlarmSound(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 focus:ring-1 w-4 h-4 transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 flex items-center whitespace-nowrap">
              <Volume2 size={14} className="mr-1" />
              Alarm Sound
            </span>
          </label>

          {/* Auto Refresh */}
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 focus:ring-1 w-4 h-4 transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
              Auto Refresh
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 outline-none"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </motion.button>

          {/* Auto Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAutoRefresh}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200 border focus:ring-2 focus:ring-offset-1 outline-none ${
              autoRefresh
                ? "bg-amber-100 hover:bg-amber-200 text-amber-600 border-amber-300 focus:ring-amber-500"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border-gray-300 focus:ring-gray-500"
            }`}
            title="Auto Refresh"
          >
            <RotateCcw size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}