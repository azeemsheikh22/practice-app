import React from 'react';
import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

const FullscreenButton = ({ isFullScreen, toggleFullScreen }) => {
  return (
    <div className="absolute lg:right-4 right-3 top-27 lg:top-25 flex flex-col gap-2 z-[700]">
      <motion.button
        className="bg-white p-2 rounded shadow hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={toggleFullScreen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Maximize2
          size={20}
          className={`text-[#111111] ${
            isFullScreen ? "scale-90" : "scale-100"
          }`}
        />
      </motion.button>
    </div>
  );
};

export default FullscreenButton;
