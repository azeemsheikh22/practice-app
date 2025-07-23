import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReplaySpeedControl = ({ currentSpeed, onSpeedChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const speedOptions = [
    { value: 0.25, label: "Very Slow", icon: "🐌" },
    { value: 0.5, label: "Slow", icon: "🚶" },
    { value: 1, label: "Normal", icon: "🚗" },
    { value: 2, label: "Fast", icon: "🏃" },
    { value: 4, label: "Very Fast", icon: "🚀" },
  ];

  const currentSpeedOption = speedOptions.find(option => option.value === currentSpeed) || speedOptions[2];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-1 sm:px-2 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-xs"
      >
        <span className="mr-1">{currentSpeedOption.icon}</span>
        <span className="font-medium text-gray-700 mr-1 hidden xs:inline">
          {currentSpeedOption.value}x
        </span>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[120px] sm:min-w-[140px]"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {speedOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  onSpeedChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer text-xs ${index === 0 ? 'rounded-t-lg' : ''
                  } ${index === speedOptions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
                  } ${option.value === currentSpeed ? 'bg-[#25689f]/10 text-[#25689f]' : 'text-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ReplaySpeedControl;
