import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilters, selectReplayFilters } from "../../features/replaySlice";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Square,
    RotateCcw,
    Gauge,
    Layers,
    Navigation,
    Crosshair
} from "lucide-react";
import { motion } from "framer-motion";
import ReplayProgressBar from "../../components/replay/ReplayProgressBar";
import ReplaySpeedControl from "../../components/replay/ReplaySpeedControl";
import ReplayFilterPanel from "../../components/replay/ReplayFilterPanel";

const ReplayControls = ({
    replayData,
    onPlayStateChange,
    onTimeChange,
    onSpeedChange,
    onFiltersChange,
    onDrawTrack,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(0.3);
    const [duration, setDuration] = useState(100);
    const dispatch = useDispatch();
    const filters = useSelector(selectReplayFilters);


    // Auto-play logic
    useEffect(() => {
        let interval;
        if (isPlaying && currentTime < 100) {
            interval = setInterval(() => {
                setCurrentTime((prev) => {
                    const newTime = prev + playbackSpeed * 0.05;
                    if (newTime >= 100) {
                        setIsPlaying(false);
                        onPlayStateChange(false);
                        onTimeChange(100);
                        return 100;
                    }
                    onTimeChange(newTime);
                    return newTime;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, currentTime, onPlayStateChange, onTimeChange]);

    // Listen for table row seek event and update currentTime accordingly
    useEffect(() => {
        function handleReplaySeek(e) {
            if (!replayData || !Array.isArray(replayData) || replayData.length < 2) return;
            const idx = e.detail && typeof e.detail.index === 'number' ? e.detail.index : 0;
            const percent = (idx / (replayData.length - 1)) * 100;
            setCurrentTime(percent);
            onTimeChange(percent);
        }
        window.addEventListener('replay-seek', handleReplaySeek);
        return () => window.removeEventListener('replay-seek', handleReplaySeek);
    }, [replayData, onTimeChange]);

    // Jab currentTime 100 ho jaye, bar ko auto reset karo (0 par)
    useEffect(() => {
        if (currentTime === 100) {
            const resetTimeout = setTimeout(() => {
                setCurrentTime(0);
                onTimeChange(0);
            }, 600); // 0.6s ke baad reset ho
            return () => clearTimeout(resetTimeout);
        }
    }, [currentTime, onTimeChange]);

    const handlePlayPause = () => {
        const newPlayState = !isPlaying;
        setIsPlaying(newPlayState);
        onPlayStateChange(newPlayState);
    };

    const handleStop = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onPlayStateChange(false);
        onTimeChange(0);
    };

    const handleRestart = () => {
        setCurrentTime(0);
        onTimeChange(0);
    };

    const handleSkipBackward = () => {
        const newTime = Math.max(0, currentTime - 10);
        setCurrentTime(newTime);
        onTimeChange(newTime);
    };

    const handleSkipForward = () => {
        const newTime = Math.min(100, currentTime + 10);
        setCurrentTime(newTime);
        onTimeChange(newTime);
    };

    const handleSeek = (time) => {
        setCurrentTime(time);
        onTimeChange(time);
    };

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed);
        onSpeedChange(speed);
    };

    const handleFiltersChange = (newFilters) => {
        dispatch(setFilters(newFilters));
        if (onFiltersChange) onFiltersChange(newFilters);
    };



    return (
        <div className="bg-white ">
            {/* Compact Progress Bar */}
            <div className="px-2 sm:px-4 py-2">
                <ReplayProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    isPlaying={isPlaying}
                />
            </div>

            {/* Responsive Controls Layout */}
            <div className="grid grid-cols-12 gap-1 sm:gap-4 items-center px-2 sm:px-4 py-2">
                {/* Left Controls - Filter Buttons (3 columns on mobile, 4 on desktop) */}
                <div className="col-span-3 sm:col-span-4 flex items-center space-x-1 sm:space-x-2">
                    {/* Alarms Toggle - Hidden on smallest screens */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFiltersChange({ ...filters, showAlarms: !filters.showAlarms })}
                        className={`hidden xs:flex items-center px-1 sm:px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${filters.showAlarms
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        title="Toggle Alarms"
                    >
                        <span className="mr-1">🚨</span>
                        <span className="hidden sm:inline">Alarms</span>
                    </motion.button>

                    {/* Stops Toggle - Hidden on smallest screens */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFiltersChange({ ...filters, showStops: !filters.showStops })}
                        className={`hidden xs:flex items-center px-1 sm:px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${filters.showStops
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        title="Toggle Stop Points"
                    >
                        <span className="mr-1">⏹️</span>
                        <span className="hidden sm:inline">Stops</span>
                    </motion.button>

                    {/* Draw Track Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onDrawTrack}
                        className="flex items-center px-1 sm:px-2 py-1 bg-[#25689f] text-white rounded-md hover:bg-[#1F557F] transition-colors text-xs font-medium cursor-pointer"
                        title="Draw Track on Map"
                    >
                        <Layers size={12} className="mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Draw</span>
                    </motion.button>
                </div>

                {/* Center Play Controls - All 5 Buttons Together (6 columns on mobile, 4 on desktop) */}
                <div className="col-span-6 sm:col-span-4 flex items-center justify-center space-x-1 sm:space-x-1.5">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRestart}
                        className="p-1 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                        title="Restart"
                    >
                        <RotateCcw size={14} className="text-gray-600" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkipBackward}
                        className="p-1 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                        title="Skip Backward 10s"
                    >
                        <SkipBack size={14} className="text-gray-600" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePlayPause}
                        className="p-2 sm:p-3 bg-[#25689f] hover:bg-[#1F557F] rounded-full transition-colors cursor-pointer shadow-lg"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause size={16} className="text-white" />
                        ) : (
                            <Play size={16} className="text-white ml-0.5" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSkipForward}
                        className="p-1 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                        title="Skip Forward 10s"
                    >
                        <SkipForward size={14} className="text-gray-600" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStop}
                        className="p-1 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                        title="Stop"
                    >
                        <Square size={14} className="text-gray-600" />
                    </motion.button>
                </div>

                {/* Right Controls - Speed Controls (3 columns on mobile, 4 on desktop) */}
                <div className="col-span-3 sm:col-span-4 flex items-center justify-end space-x-1 sm:space-x-2">


                    <ReplaySpeedControl
                        currentSpeed={playbackSpeed}
                        onSpeedChange={handleSpeedChange}
                    />
                </div>
            </div>

            {/* Compact Filter Panel */}
            <ReplayFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onDrawTrack={onDrawTrack}
                showAlarms={filters.showAlarms}
                showStops={filters.showStops}
            />
        </div>
    );
};

export default ReplayControls;
