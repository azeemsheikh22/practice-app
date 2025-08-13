

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const ReplayProgressBar = ({
  currentTime,
  onSeek,
  isPlaying,
  timestamps = []
}) => {
  const barRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Remove time display, just show progress bar
  const handleSeek = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = x - rect.left;
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(percent);
  };

  const handleDrag = (e) => {
    if (!dragging) return;
    handleSeek(e);
  };

  const handleDragStart = (e) => {
    setDragging(true);
    handleSeek(e);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleDragEnd = () => {
    setDragging(false);
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('touchmove', handleDrag);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchend', handleDragEnd);
  };

  return (
    <div className="w-full select-none">
      <div
        ref={barRef}
        className="relative h-2 sm:h-1.5 bg-gray-200 rounded-full cursor-pointer group hover:h-2.5 sm:hover:h-2 transition-all duration-200"
        onClick={handleSeek}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ userSelect: 'none' }}
      >
        {/* Progress Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#25689f] rounded-full"
          style={{ width: `${currentTime}%` }}
          initial={false}
          animate={{ width: `${currentTime}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Progress Handle - always visible for drag */}
        <motion.div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 sm:w-3 h-4 sm:h-3 bg-white border-2 border-[#25689f] rounded-full shadow-md cursor-pointer"
          style={{ left: `calc(${currentTime}% - 8px)` }}
          whileHover={{ scale: 1.2 }}
        />

        {/* Timestamps (if any) */}
        {timestamps.map((timestamp, index) => (
          <div
            key={index}
            className="absolute top-0 w-0.5 h-full bg-gray-400 opacity-50"
            style={{ left: `${timestamp.time}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default ReplayProgressBar;
