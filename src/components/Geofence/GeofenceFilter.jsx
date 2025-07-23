import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
} from "lucide-react";
import {
  setSelectedTimeRange,
  setCustomDateTime,
  applyTimeFilters,
  fetchGeofences,
  setSearchQuery, // ✅ Keep this import
} from "../../features/geofenceSlice";

const GeofenceFilter = ({ onApplyFilters, className = "" }) => {
  const dispatch = useDispatch();
  const {
    selectedTimeRange,
    showCustomRange,
    startDateTime,
    endDateTime,
    loading,
    currentDateRange,
    searchQuery, // ✅ Get search query from Redux
  } = useSelector((state) => state.geofence);

  // Local state for UI
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [localStartDateTime, setLocalStartDateTime] = useState(startDateTime);
  const [localEndDateTime, setLocalEndDateTime] = useState(endDateTime);

  // Time range options
  const timeRangeOptions = [
    { value: "Today", label: "Today", icon: "📅" },
    { value: "Yesterday", label: "Yesterday", icon: "📆" },
    { value: "This Week", label: "This Week", icon: "📊" },
    { value: "Last Week", label: "Last Week", icon: "📈" },
    { value: "This Month", label: "This Month", icon: "🗓️" },
    { value: "Last Month", label: "Last Month", icon: "📋" },
    { value: "Other", label: "Custom Range", icon: "⚙️" },
  ];

  // ✅ Function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";

    try {
      // Parse the date string (YYYY/MM/DD HH:mm:ss format)
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("/");

      // Create date object
      const date = new Date(year, month - 1, day);

      // Format as DD/MM/YYYY
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // ✅ Function to get display text based on time range
  const getDateDisplayText = (timeRange, currentDateRange) => {
    if (!currentDateRange.datefrom || !currentDateRange.dateto) {
      return getCurrentDateTime();
    }

    const fromDate = formatDateForDisplay(currentDateRange.datefrom);
    const toDate = formatDateForDisplay(currentDateRange.dateto);

    switch (timeRange) {
      case "Today":
        return `📅 ${fromDate}`;
      case "Yesterday":
        return `📅 ${fromDate}`;
      default:
        // For all other options, show from and to dates
        return fromDate === toDate
          ? `📅 ${fromDate}`
          : `📅 ${fromDate} - ${toDate}`;
    }
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Update local state when Redux state changes
  useEffect(() => {
    setLocalStartDateTime(startDateTime);
    setLocalEndDateTime(endDateTime);
  }, [startDateTime, endDateTime]);

  // Handle time range selection
  const handleTimeRangeSelect = (range) => {
    dispatch(setSelectedTimeRange(range));
    setIsTimeDropdownOpen(false);
  };

  // Handle custom date time changes
  const handleCustomDateTimeChange = (field, value) => {
    if (field === "start") {
      setLocalStartDateTime(value);
    } else {
      setLocalEndDateTime(value);
    }
  };

  // ✅ WORKING SEARCH LOGIC - Direct Redux update like your old code
  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value)); // Direct Redux update - WORKING APPROACH
  };

  // ✅ Clear search - Direct Redux update
  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Update Redux state with local datetime values
    if (showCustomRange) {
      dispatch(
        setCustomDateTime({
          startDateTime: localStartDateTime,
          endDateTime: localEndDateTime,
        })
      );
    }

    // Apply time filters
    dispatch(applyTimeFilters());

    // Fetch geofences with new filters
    dispatch(
      fetchGeofences({
        timeRange: selectedTimeRange,
        startDateTime: showCustomRange ? localStartDateTime : "",
        endDateTime: showCustomRange ? localEndDateTime : "",
        searchQuery: searchQuery, // ✅ Use Redux searchQuery directly
      })
    );

    // Call parent callback if provided
    if (onApplyFilters) {
      onApplyFilters({
        timeRange: selectedTimeRange,
        startDateTime: showCustomRange ? localStartDateTime : "",
        endDateTime: showCustomRange ? localEndDateTime : "",
        searchQuery: searchQuery, // ✅ Use Redux searchQuery directly
      });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(setSelectedTimeRange("Today"));
    dispatch(setCustomDateTime({ startDateTime: "", endDateTime: "" }));
    dispatch(setSearchQuery("")); // ✅ Reset search query in Redux
    setLocalStartDateTime("");
    setLocalEndDateTime("");
    setIsTimeDropdownOpen(false);
  };

  // Get selected option details
  const selectedOption = timeRangeOptions.find(
    (option) => option.value === selectedTimeRange
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* ✅ Search Input - Updated with blue theme */}
        <div className="relative min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery} // ✅ Direct Redux value
              onChange={handleSearchChange} // ✅ Direct Redux update
              placeholder="Search geofences..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] transition-colors duration-200" // ✅ Changed to blue theme
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Time Range Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 min-w-[140px] cursor-pointer"
          >
            <span className="text-lg">{selectedOption?.icon}</span>
            <span className="text-sm font-medium text-gray-700">
              {selectedOption?.label}
            </span>
            {isTimeDropdownOpen ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isTimeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="py-2">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeRangeSelect(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                        selectedTimeRange === option.value
                          ? "bg-[#25689f]/10 text-[#25689f] border-r-2 border-[#25689f]" // ✅ Changed to blue theme
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {selectedTimeRange === option.value && (
                        <div className="ml-auto w-2 h-2 bg-[#25689f] rounded-full"></div> // ✅ Changed to blue
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Date Range Inputs */}
        <AnimatePresence>
          {showCustomRange && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium cursor-default">
                  From:
                </label>
                <input
                  type="datetime-local"
                  value={localStartDateTime}
                  onChange={(e) =>
                    handleCustomDateTimeChange("start", e.target.value)
                  }
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] cursor-pointer transition-colors duration-200" // ✅ Changed to blue theme
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium cursor-default">
                  To:
                </label>
                <input
                  type="datetime-local"
                  value={localEndDateTime}
                  onChange={(e) =>
                    handleCustomDateTimeChange("end", e.target.value)
                  }
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] cursor-pointer transition-colors duration-200" // ✅ Changed to blue theme
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Apply Button - ✅ Updated to blue theme */}
        <button
          onClick={handleApplyFilters}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#25689f] hover:bg-[#1F557F] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" // ✅ Changed from red to blue
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search size={16} />
          )}
          <span className="text-sm font-medium">
            {loading ? "Loading..." : "Apply"}
          </span>
        </button>

        {/* Reset Button */}
        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-medium">Reset</span>
        </button>

        {/* Current Time Display - Compact */}
        {!showCustomRange && (
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 cursor-default">
            <Clock size={12} />
            <span>
              {getDateDisplayText(selectedTimeRange, currentDateRange)}
            </span>
          </div>
        )}

        {/* Custom Range Display */}
        {showCustomRange && localStartDateTime && localEndDateTime && (
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 cursor-default">
            <Calendar size={12} />
            <span>
              {new Date(localStartDateTime).toLocaleDateString("en-GB")} -{" "}
              {new Date(localEndDateTime).toLocaleDateString("en-GB")}
            </span>
          </div>
        )}
      </div>
      {/* Loading Indicator - ✅ Updated to blue theme */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 text-sm text-gray-500"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#25689f]"></div> {/* ✅ Changed to blue */}
          <span>Applying filters...</span>
        </motion.div>
      )}
      </motion.div>
    );
  };
  
  export default GeofenceFilter;
  