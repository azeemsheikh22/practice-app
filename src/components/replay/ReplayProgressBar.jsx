import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ReplayProgressBar = ({
  currentTime,
  onSeek,
  isPlaying,
  timestamps = [],
  replayData = []
}) => {
  // rc-slider expects value 0-100
  const value = Number(currentTime);

  // Custom handle style
  const handleStyle = {
    width: 18,
    height: 18,
    marginTop: -5,
    background: '#fff',
    border: '2px solid #25689f',
    boxShadow: '0 2px 6px rgba(37,104,159,0.15)'
  };

  // Simple bar style
  const trackStyle = {
    background: '#25689f',
    height: 8,
    borderRadius: 8
  };
  const railStyle = {
    background: '#e5e7eb',
    height: 8,
    borderRadius: 8
  };

  return (
    <div className="w-full select-none px-1">
      <Slider
        min={0}
        max={100}
        value={value}
        onChange={onSeek}
        trackStyle={trackStyle}
        handleStyle={handleStyle}
        railStyle={railStyle}
      />
    </div>
  );
};

export default ReplayProgressBar;
