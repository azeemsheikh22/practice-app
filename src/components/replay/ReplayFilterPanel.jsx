import React, { useState } from "react";
import { Settings, Clock, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReplayFilterPanel = ({
  filters,
  onFiltersChange,
  showAlarms = true,
  showStops = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stopOptions = [
    { value: "all", label: "All Stops" },
    { value: "5", label: "Above 5 min" },
    { value: "10", label: "Above 10 min" },
    { value: "15", label: "Above 15 min" },
  ];

  const displayOptions = [
    { value: "line", label: "Line", icon: "📍" },
    { value: "marker", label: "Marker", icon: "🎯" },
    { value: "all", label: "All", icon: "🗺️" },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="border-t border-gray-100">
      {/* Compact Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-2 sm:px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Settings size={14} className="text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Options</span>

          {/* Quick Status Indicators */}
          <div className="flex items-center space-x-1">
            {showAlarms && <span className="text-xs">🚨</span>}
            {showStops && <span className="text-xs">⏹️</span>}
            <span className="text-xs text-gray-500">
              {filters.displayMode === 'line' ? '📍' : filters.displayMode === 'marker' ? '🎯' : '🗺️'}
            </span>
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </motion.button>

      {/* Compact Expanded Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white"
          >
            <div className="px-2 sm:px-4 py-3 space-y-3">
              {/* Responsive Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock size={10} className="inline mr-1" />
                    Stop Duration
                  </label>
                  <select
                    value={filters.stopDuration || "all"}
                    onChange={(e) => handleFilterChange('stopDuration', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#25689f]"
                  >
                    {stopOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Eye size={10} className="inline mr-1" />
                    Display Mode
                  </label>
                  <select
                    value={filters.displayMode || "line"}
                    onChange={(e) => handleFilterChange('displayMode', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#25689f]"
                  >
                    {displayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile-only Controls - Show alarms and stops toggles that are hidden in the main controls on small screens */}
              <div className="flex xs:hidden items-center space-x-2 pt-2">
                <button
                  onClick={() => handleFilterChange('showAlarms', !filters.showAlarms)}
                  className={`flex-1 flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    filters.showAlarms
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  <span className="mr-1">🚨</span>
                  Alarms
                </button>

                <button
                  onClick={() => handleFilterChange('showStops', !filters.showStops)}
                  className={`flex-1 flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    filters.showStops
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  <span className="mr-1">⏹️</span>
                  Stops
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReplayFilterPanel;
