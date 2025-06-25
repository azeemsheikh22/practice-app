import React from 'react';
import { Map, Navigation, Layers } from "lucide-react";
import { motion } from "framer-motion";

const MapTypeSelector = ({ mapType, showTraffic, onChangeMapType, onToggleTraffic }) => {
  return (
    <div className="absolute right-3 xl:top-3 top-4 z-10">
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Map type selection */}
        <div className="flex border-b border-gray-100">
          <motion.button
            className={`px-4 py-2.5 text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
              mapType === "map"
                ? "bg-gray-50 font-semibold text-[#111111]"
                : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            }`}
            onClick={() => onChangeMapType("map")}
            whileHover={{ backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.98 }}
          >
            <Map size={16} />
            <span>Map</span>
          </motion.button>
          <motion.button
            className={`px-4 py-2.5 text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
              mapType === "satellite"
                ? "bg-gray-50 font-semibold text-[#111111]"
                : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
            }`}
            onClick={() => onChangeMapType("satellite")}
            whileHover={{ backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.98 }}
          >
            <Layers size={16} />
            <span>Satellite</span>
          </motion.button>
        </div>

        {/* Traffic toggle */}
        <motion.button
          className={`w-full px-4 py-2.5 text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
            showTraffic
              ? "bg-blue-50 font-semibold text-blue-600"
              : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
          }`}
          onClick={onToggleTraffic}
          whileHover={!showTraffic ? { backgroundColor: "#f9fafb" } : {}}
          whileTap={{ scale: 0.98 }}
        >
          <Navigation size={16} />
          <span>Traffic</span>
          {showTraffic && (
            <motion.div
              className="ml-1.5 w-2 h-2 rounded-full bg-blue-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MapTypeSelector;
