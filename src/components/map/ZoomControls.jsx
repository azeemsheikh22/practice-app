import React from 'react';
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

const ZoomControls = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="absolute lg:right-4 right-3 top-47 lg:top-45 -translate-y-1/2 flex flex-col bg-white rounded shadow z-[700]">
      <motion.button
        className="p-2 border-b hover:bg-gray-100"
        onClick={onZoomIn}
        whileHover={{ backgroundColor: "#f9fafb" }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={20} className="text-[#111111]" />
      </motion.button>
      <motion.button
        className="p-2 hover:bg-gray-100"
        onClick={onZoomOut}
        whileHover={{ backgroundColor: "#f9fafb" }}
        whileTap={{ scale: 0.95 }}
      >
        <Minus size={20} className="text-[#111111]" />
      </motion.button>
    </div>
  );
};

export default ZoomControls;
