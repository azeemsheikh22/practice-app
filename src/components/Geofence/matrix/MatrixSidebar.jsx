import React from "react";
import { motion } from "framer-motion";
import { Calendar, Car, Clock, MapPin, Route, Timer } from "lucide-react";

const MatrixSidebar = ({ selectedTimeFilter, setSelectedTimeFilter, isMobile = false }) => {
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

  // Analytics data
  const analyticsData = [
    {
      id: 1,
      title: "Total Vehicles",
      value: "24",
      subtitle: "(Last Stops Removed)",
      icon: <Car size={20} className="text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: 2,
      title: "Total Visits",
      value: "156",
      subtitle: "",
      icon: <MapPin size={20} className="text-green-600" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: 3,
      title: "Average Stop Duration",
      value: "2h 45m",
      subtitle: "(Last Stops Removed)",
      icon: <Timer size={20} className="text-purple-600" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: 4,
      title: "Average Travel Duration",
      value: "4h 12m",
      subtitle: "",
      icon: <Clock size={20} className="text-orange-600" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: 5,
      title: "Average Distance Traveled",
      value: "125.5",
      unit: "km",
      subtitle: "",
      icon: <Route size={20} className="text-red-600" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      id: 6,
      title: "Average Arrival Time",
      value: "09:30 AM",
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] transition-colors"
        >
          {timeFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Analytics Overview
        </h3>
        
        {analyticsData.map((item, index) => (
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
        ))}
      </div>

      {/* Summary Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Data Summary
        </h4>
        <div className="space-y-1 text-xs text-gray-600">
          <p>• Data filtered for: <span className="font-medium">{timeFilterOptions.find(opt => opt.value === selectedTimeFilter)?.label}</span></p>
          <p>• Last updated: <span className="font-medium">2 minutes ago</span></p>
          <p>• Active geofences: <span className="font-medium">12</span></p>
        </div>
      </div>
    </div>
  );
};

export default MatrixSidebar;
