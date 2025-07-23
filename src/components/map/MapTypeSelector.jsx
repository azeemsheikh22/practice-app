import React from 'react';
import { Map, Navigation, Layers } from "lucide-react";
import { motion } from "framer-motion";

const MapTypeSelector = ({ mapType, showTraffic, onChangeMapType, onToggleTraffic }) => {
  return (
    <div className="absolute right-3 xl:top-3 top-2 z-[700]">
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Responsive layout - vertical on mobile, horizontal on larger screens */}
        <div className="flex flex-col sm:flex-row">
          <motion.button
            className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border-b sm:border-b-0 sm:border-r border-gray-100 ${
              mapType === "map"
                ? "bg-gray-50 font-semibold text-[#111111]"
                : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            }`}
            onClick={() => onChangeMapType("map")}
            whileHover={{ backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.98 }}
          >
            <Map size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Map</span>
          </motion.button>

          <motion.button
            className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border-b sm:border-b-0 sm:border-r border-gray-100 ${
              mapType === "satellite"
                ? "bg-gray-50 font-semibold text-[#111111]"
                : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            }`}
            onClick={() => onChangeMapType("satellite")}
            whileHover={{ backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.98 }}
          >
            <Layers size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Satellite</span>
          </motion.button>

          <motion.button
            className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              showTraffic
                ? "bg-blue-50 font-semibold text-blue-600"
                : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            }`}
            onClick={onToggleTraffic}
            whileHover={!showTraffic ? { backgroundColor: "#f9fafb" } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <Navigation size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Traffic</span>
            {showTraffic && (
              <motion.div
                className="ml-1 sm:ml-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default MapTypeSelector;
