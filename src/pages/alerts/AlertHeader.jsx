import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  FileDown,
  AlertTriangle,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";

export default function AlertHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");
  const [selectedSort, setSelectedSort] = useState("Most Triggered");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef(null);

  // Outside click handler for download dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg  transition-all duration-200"
          />
        </div>

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
  );
}
