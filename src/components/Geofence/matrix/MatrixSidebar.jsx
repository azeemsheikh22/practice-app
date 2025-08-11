import React from "react";
import { motion } from "framer-motion";
import { Calendar, Car, Clock, MapPin, Route, Timer } from "lucide-react";

const MatrixSidebar = ({ selectedTimeFilter, setSelectedTimeFilter, metricsData, isMobile = false, loading = false }) => {
  // Time filter options
  const timeFilterOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "last_week", label: "Last Week" },
    { value: "june_2025", label: "June 2025" },
    { value: "may_2025", label: "May 2025" },
    { value: "april_2025", label: "April 2025" },
    { value: "march_2025", label: "March 2025" },
    { value: "february_2025", label: "February 2025" },
    { value: "january_2025", label: "January 2025" },
    { value: "december_2024", label: "December 2024" },
    { value: "november_2024", label: "November 2024" },
    { value: "october_2024", label: "October 2024" },
    { value: "september_2024", label: "September 2024" },
    { value: "august_2024", label: "August 2024" },
    { value: "july_2024", label: "July 2024" },
  ];

  const data = metricsData && metricsData.length > 0 ? metricsData[0] : {};

  // Helper to safely get string or number value or fallback
  const safeValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "object") return JSON.stringify(val);
    return val;
  };

  // Analytics data derived from metricsData
  const analyticsData = [
    {
      id: 1,
      title: "Total Vehicles",
      value: safeValue(data.TotVehicles),
      subtitle: "",
      icon: <Car size={20} className="text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: 2,
      title: "Total Visits",
      value: safeValue(data.TotVisits),
      subtitle: "",
      icon: <MapPin size={20} className="text-green-600" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: 3,
      title: "Average Stop Duration",
      value: safeValue(data.AvgStopDuration),
      subtitle: "",
      icon: <Timer size={20} className="text-purple-600" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: 4,
      title: "Average Travel Duration",
      value: safeValue(data.AvgTravelDuration),
      subtitle: "",
      icon: <Clock size={20} className="text-orange-600" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: 5,
      title: "Average Distance Traveled",
      value: safeValue(data.AvgDistance),
      unit: "km",
      subtitle: "",
      icon: <Route size={20} className="text-red-600" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      id: 6,
      title: "Average Arrival Time",
      value: safeValue(data.AvgTime),
      subtitle: "",
      icon: <Calendar size={20} className="text-indigo-600" />,
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Time Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Show visits for:
        </label>
        <select
          value={selectedTimeFilter}
          onChange={(e) => setSelectedTimeFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm  transition-colors"
        >
          {timeFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics Cards */}
      <div className="space-y-4 overflow-auto max-h-[calc(100vh-200px)]">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Analytics Overview
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="ml-2 text-amber-600 font-medium">Loading analytics...</span>
          </div>
        ) : (
          analyticsData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${item.bgColor} ${item.borderColor} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {item.icon}
                    <h4 className="text-sm font-medium text-gray-700">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {item.value}
                    </span>
                    {item.unit && (
                      <span className="text-sm text-gray-600 font-medium">
                        {item.unit}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>  
    </div>
  );
};

export default MatrixSidebar;
