import React from "react";
import { motion } from "framer-motion";

const ReplayProgressBar = ({ 
  currentTime, 
  duration, 
  onSeek, 
  isPlaying,
  timestamps = [] 
}) => {
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percentage)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Responsive Time Display */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500 font-mono">
          {formatTime((currentTime / 100) * duration)}
        </span>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-500">
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Responsive Progress Bar - Larger touch target on mobile */}
      <div 
        className="relative h-2 sm:h-1.5 bg-gray-200 rounded-full cursor-pointer group hover:h-2.5 sm:hover:h-2 transition-all duration-200"
        onClick={handleProgressClick}
      >
        {/* Progress Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#25689f] rounded-full"
          style={{ width: `${currentTime}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${currentTime}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Progress Handle - Larger on mobile for better touch */}
        <motion.div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 sm:w-3 h-4 sm:h-3 bg-white border-2 border-[#25689f] rounded-full shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${currentTime}% - 8px)` }}
          whileHover={{ scale: 1.2 }}
        />

        {/* Timestamps */}
        {timestamps.map((timestamp, index) => (
          <div
            key={index}
            className="absolute top-0 w-0.5 h-full bg-gray-400 opacity-50"
            style={{ left: `${(timestamp.time / duration) * 100}%` }}
            title={`${timestamp.label} - ${formatTime(timestamp.time)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReplayProgressBar;
