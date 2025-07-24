import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function AlertOverview() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sample alert data
  const alerts = [
    {
      id: 1,
      title: "Uspl Night Driving Violation",
      category: "Activity",
      lastTriggered: "2 hours ago",
      count: 14,
      badgeCount: 531,
      severity: "high",
    },
    {
      id: 2,
      title: "Uspl Continuous Driving",
      category: "Fatigue driving Alert",
      lastTriggered: "3 hours ago",
      count: 13,
      badgeCount: 2074,
      severity: "high",
    },
    {
      id: 3,
      title: "60UEPL SPEEDING ALERT",
      category: "Speeding",
      lastTriggered: "5 hours ago",
      count: 10,
      badgeCount: 661,
      severity: "medium",
    },
    {
      id: 4,
      title: "S&Co Black Spots",
      category: "Long Stop",
      lastTriggered: "8 hours ago",
      count: 6,
      badgeCount: 1166,
      severity: "medium",
    },
    {
      id: 5,
      title: "28UEPL SPEEDING ALERT",
      category: "Speeding",
      lastTriggered: "12 hours ago",
      count: 1,
      badgeCount: 99,
      severity: "low",
    },
    {
      id: 6,
      title: "UEPL Harsh Acceleration Alert",
      category: "Quick Start",
      lastTriggered: "1 day ago",
      count: 1,
      badgeCount: 29,
      severity: "low",
    },
  ];

  // Filter alerts based on category
  const filteredAlerts = alerts.filter((alert) => {
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
      {filteredAlerts.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex">
                {/* Left side with count */}
                <div className="relative bg-gray-100 w-24 flex items-center justify-center py-6">
                  <div
                    className={`absolute top-2 left-2 ${getSeverityColor(
                      alert.severity
                    )} text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md`}
                  >
                    {alert.badgeCount}
                  </div>
                  <span className="text-4xl font-bold text-gray-800">
                    {alert.count}
                  </span>
                </div>

                {/* Right side with details */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-blue-600 font-medium line-clamp-2">
                      {alert.title}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-center">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {alert.category}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center text-gray-500 text-xs">
                    <Clock size={14} className="mr-1" />
                    <span>Last Triggered: {alert.lastTriggered}</span>
                  </div>

                  <div className="flex justify-between mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                    >
                      Policy Summary
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 text-sm hover:text-blue-800 font-medium"
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
