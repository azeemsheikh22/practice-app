import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  // Download,
  Search,
  Plus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchQuery,
  selectFilteredRoutesCount,
  selectTotalRoutesCount,
} from "../../features/routeSlice";

export default function RouteHeader() {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.route.searchQuery);
  const filteredCount = useSelector(selectFilteredRoutesCount);
  const totalRoutes = useSelector(selectTotalRoutesCount);

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="w-full space-y-2 mb-3">
      {/* ✅ COMPACT Main Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
      >
        {/* ✅ COMPACT Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">Route List</h1>
            <p className="text-sm text-gray-600">
              Search and edit your Route from the list below
            </p>
          </div>

          {/* ✅ COMPACT Create Route Button - Updated with theme colors */}
          <div className="flex-shrink-0">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                const newWindow = window.open(
                  "/#/create-route",
                  "CreateRoute",
                  "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
                );
                if (newWindow) {
                  newWindow.focus();
                } else {
                  alert("Please allow popups for this site to create routes");
                }
              }}
              className="btn btn-primary btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0"
            >
              <Plus size={14} className="mr-1.5" />
              Create New Route
            </motion.button>
          </div>
        </div>

        {/* ✅ COMPACT Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* ✅ COMPACT Left side - Search and showing info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            {/* ✅ COMPACT Search Input - Updated with theme colors */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search for a route..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
              />
            </div>

            {/* ✅ COMPACT Showing info - Updated with theme colors */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-[#25689f] rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">
                Showing{" "}
                <span className="font-semibold text-[#25689f]">
                  {filteredCount}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#25689f]">
                  {totalRoutes}
                </span>{" "}
                routes
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
