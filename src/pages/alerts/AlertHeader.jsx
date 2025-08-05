import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Filter, ChevronDown } from "lucide-react";

export default function AlertHeader({
  selectedTimeframe,
  setSelectedTimeframe,
  selectedSort,
  setSelectedSort,
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <AlertTriangle size={28} className="mr-3 text-amber-500" />
            Alert Overview
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Filter */}
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={15} className="text-gray-400" />
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg appearance-none  transition-all duration-200"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>August 2025</option>
            <option>July 2025</option>
            <option>June 2025</option>
            <option>May 2025</option>
            <option>April 2025</option>
            <option>March 2025</option>
            <option>February 2025</option>
            <option>January 2025</option>
            <option>December 2024</option>
            <option>November 2024</option>
            <option>October 2024</option>
            <option>September 2024</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown size={15} className="text-gray-400" />
          </div>
        </div>

        {/* Sort By */}
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={15} className="text-gray-400" />
          </div>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg appearance-none  transition-all duration-200"
          >
            <option>Most Triggered</option>
            <option>Ascending (A-Z)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
