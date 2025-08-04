import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function AlertOverview({ 
  alertSummary = [], 
  summaryLoading = false, 
  summaryError = null 
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");


  // Function to format last triggered date
  const formatLastTriggered = (lastTrig) => {
    if (!lastTrig || typeof lastTrig === 'object' && Object.keys(lastTrig).length === 0) {
      return "Never triggered";
    }
    
    if (typeof lastTrig === 'string' && lastTrig.trim() !== '') {
      try {
        // Parse the date string (format: "2025-08-04 04:56 PM")
        const date = new Date(lastTrig);
        if (!isNaN(date.getTime())) {
          const now = new Date();
          const diffMs = now - date;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            return "Less than an hour ago";
          }
        }
      } catch (e) {
        return lastTrig; // Return original if parsing fails
      }
    }
    
    return "Never triggered";
  };

  // Function to transform API data to display format
  const transformApiData = (apiData) => {
    return apiData.map((item, index) => ({
      id: item.policyIdx || index,
      title: item.policyName || "Unknown Policy",
      category: item["Alarm Type"] || "Unknown",
      lastTriggered: formatLastTriggered(item.lastTrig),
      count: item.AlarmCount || 0,
      badgeCount: item.UnreadCount || 0,
      severity: getSeverityFromCounts(item.AlarmCount, item.UnreadCount),
      priority: item.priority || false,
      alarmType: item.alm_type || 0,
      criteria: item.criteria || "G"
    }));
  };

  // Function to determine severity based on alarm counts
  const getSeverityFromCounts = (alarmCount, unreadCount) => {
    if (alarmCount >= 50 || unreadCount >= 10000) return "high";
    if (alarmCount >= 10 || unreadCount >= 1000) return "medium";
    return "low";
  };


  // Use API data if available, otherwise fall back to sample data
  const displayData = transformApiData(alertSummary)

  // Filter alerts based on category
  const filteredAlerts = displayData.filter((alert) => {
    const matchesCategory =
      selectedCategory === "All" || alert.category === selectedCategory;
    return matchesCategory;
  });

  // Function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="mb-10">
      {summaryLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-bl rounded-lg shadow-md p-8 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Loading alert summary...
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch the latest data
            </p>
          </div>
        </motion.div>
      ) : summaryError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <div className="flex flex-col items-center">
            <AlertTriangle size={48} className="text-red-400 mb-4" />
            <h3 className="text-xl font-medium text-red-700 mb-2">
              Error loading alert summary
            </h3>
            <p className="text-red-500 text-sm">
              {summaryError}
            </p>
          </div>
        </motion.div>
      ) : filteredAlerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <div className="flex flex-col items-center">
            <Bell size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No alerts found
            </h3>
            <p className="text-gray-500">
              You don't have any alerts matching the current filters
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Left side with count */}
                <div className="relative bg-gray-100 w-full sm:w-20 md:w-24 flex items-center justify-center py-4 sm:py-6">
                  <div
                    className={`absolute top-2 left-2 ${getSeverityColor(
                      alert.severity
                    )} text-white text-xs font-bold rounded-full min-w-[2rem] h-8 flex items-center justify-center shadow-md px-1`}
                  >
                    <span className="text-xs leading-none">
                      {alert.badgeCount > 999 ? `${Math.floor(alert.badgeCount/1000)}k` : alert.badgeCount}
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                    {alert.count}
                  </span>
                </div>

                {/* Right side with details */}
                <div className="p-3 md:p-4 flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-blue-600 font-medium text-xs sm:text-sm leading-tight mb-1 break-words">
                        {alert.title}
                      </h3>
                      {alert.priority && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full break-words max-w-full">
                      {alert.category}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center text-gray-500 text-xs">
                    <Clock size={12} className="mr-1 flex-shrink-0" />
                    <span className="break-words">Last: {alert.lastTriggered}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 text-xs hover:text-blue-800 font-medium flex-1 text-left"
                    >
                      Policy Summary
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 text-xs hover:text-blue-800 font-medium flex-1 text-left sm:text-right"
                    >
                      Edit Policy
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
