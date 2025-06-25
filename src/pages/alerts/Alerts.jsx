import React, { useState } from "react";
import Navbar from "../../components/navber/Navbar";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronDown,
} from "lucide-react";

export default function AlertOverview() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");
  const [selectedSort, setSelectedSort] = useState("Most Triggered");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter alerts based on search query and category
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || alert.category === selectedCategory;

    return matchesSearch && matchesCategory;
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main content - Match the Navbar container width */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 pt-6">
        <div>
          {/* Header with animated entrance */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <AlertTriangle size={24} className="mr-2 text-amber-500" />
                  Alert Overview
                </h1>
                <p className="text-gray-500 mt-1">
                  Monitor and manage all system alerts
                </p>
              </div>
              <motion.button
                whileHover="hover"
                whileTap="tap"
                className="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus size={14} className="mr-1" />
                Create a New Policy
              </motion.button>
            </div>

            {/* Filter Bar */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md"
                />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md appearance-none"
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={18} className="text-gray-400" />
                </div>
              </div>

              {/* Sort By */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md appearance-none "
                >
                  <option>Most Triggered</option>
                  <option>Least Triggered</option>
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alert Cards Grid with staggered animation */}
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
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "You don't have any alerts matching the current filters"}
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
        </div>
      </div>
    </div>
  );
}
