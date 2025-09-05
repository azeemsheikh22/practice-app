import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilters, selectReplayFilters } from "../../features/replaySlice";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Square,
    RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import ReplayProgressBar from "../../components/replay/ReplayProgressBar";
import ReplaySpeedControl from "../../components/replay/ReplaySpeedControl";


function formatDuration(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

const ReplayControls = ({
    replayData,
    onPlayStateChange,
    onTimeChange,
    onSpeedChange,
    onFiltersChange,
    onDrawTrack,
}) => {
    const dispatch = useDispatch();
    const filters = useSelector(selectReplayFilters);
    const showSummary = filters.showSummary || false;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(0.3);
    const [duration, setDuration] = useState(100);

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

    // Summary calculation
    const summary = useMemo(() => {
        if (!Array.isArray(replayData) || replayData.length === 0) return null;
        let moving = 0, idle = 0, stop = 0, total = 0, distance = 0;
        for (let i = 0; i < replayData.length; i++) {
            const curr = replayData[i];
            const next = replayData[i + 1];
            let status = (curr.status || curr.status1 || '').toLowerCase();
            if (next) {
                // Duration between this and next point
                const t1 = new Date(curr.gps_time).getTime();
                const t2 = new Date(next.gps_time).getTime();
                const diff = Math.max(0, Math.floor((t2 - t1) / 1000));
                if (status.includes('moving')) moving += diff;
                else if (status.includes('idle')) idle += diff;
                else if (status.includes('stop') || status.includes('ign_off')) stop += diff;
                total += diff;
            }
            // Distance
            if (next && curr.latitude && curr.longitude && next.latitude && next.longitude) {
                const toRad = deg => deg * Math.PI / 180;
                const R = 6371; // km
                const dLat = toRad(next.latitude - curr.latitude);
                const dLon = toRad(next.longitude - curr.longitude);
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRad(curr.latitude)) * Math.cos(toRad(next.latitude)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance += R * c;
            }
        }
        return {
            moving, idle, stop, total,
            distance: Math.round(distance)
        };
    }, [replayData]);

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
        // When switching to marker mode, automatically uncheck trips
        if (newFilters.displayMode === 'marker' && filters.displayMode !== 'marker') {
            newFilters = {
                ...newFilters,
                showTripMarkers: false
            };
            // Also deselect any selected trip
            dispatch({ type: 'replay/setSelectedTrip', payload: null });
        }
        
        // When unchecking trip markers, deselect any selected trip
        if (filters.showTripMarkers && !newFilters.showTripMarkers) {
            dispatch({ type: 'replay/setSelectedTrip', payload: null });
        }
        
        dispatch(setFilters(newFilters));
        if (onFiltersChange) onFiltersChange(newFilters);
    };



    return (
        <div className="bg-white ">
            {/* Summary Bar */}
            {showSummary && summary && (
                <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 py-1 bg-gray-50 border-b border-gray-200 text-[11px] md:text-xs font-medium">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Moving Time:</span>
                        <span className="font-semibold text-green-600">{formatDuration(summary.moving)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Stop Time:</span>
                        <span className="font-semibold text-red-600">{formatDuration(summary.stop)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Idle Time:</span>
                        <span className="font-semibold text-yellow-600">{formatDuration(summary.idle)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Time:</span>
                        <span className="font-semibold text-gray-800">{formatDuration(summary.total)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Distance Traveled:</span>
                        <span className="font-semibold text-blue-700">{summary.distance} km</span>
                    </div>
                </div>
            )}
            {/* Compact Progress Bar */}
            <div className="px-2 sm:px-4 py-2">
                <ReplayProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    isPlaying={isPlaying}
                    replayData={replayData}
                />
            </div>

            {/* Responsive Controls Layout with inline filter options */}
            <div className="grid grid-cols-12 gap-1 sm:gap-4 items-center px-2 sm:px-4 py-2">
                {/* Left Controls - Summary Checkbox, Trip Markers Checkbox, Display Mode (4 columns) */}
                <div className="col-span-4 flex items-center space-x-1 sm:space-x-2">
                    {/* Show Summary Checkbox */}
                    <input
                        type="checkbox"
                        id="show-summary"
                        checked={showSummary}
                        onChange={e => handleFiltersChange({ ...filters, showSummary: e.target.checked })}
                        className="mr-1 accent-[#25689f] cursor-pointer"
                        style={{ marginTop: 1 }}
                    />
                    <label htmlFor="show-summary" className="text-xs font-medium text-gray-700 cursor-pointer select-none mr-2">Summary</label>
                    
                    {/* Show Trip Markers Checkbox */}
                    <input
                        type="checkbox"
                        id="show-trip-markers"
                        checked={filters.showTripMarkers || false}
                        onChange={e => {
                            // If trying to check trip markers in marker mode, show warning
                            if (e.target.checked && filters.displayMode === 'marker') {
                                toast.error('Trip markers cannot be enabled in Marker mode. Please switch to Line mode first.', {
                                    duration: 3000,
                                    position: 'top-center',
                                    style: {
                                        background: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        color: '#991b1b',
                                        fontWeight: '500',
                                    },
                                    icon: '⚠️'
                                });
                                return;
                            }
                            handleFiltersChange({ ...filters, showTripMarkers: e.target.checked });
                        }}
                        className="mr-1 accent-[#25689f] cursor-pointer"
                        style={{ marginTop: 1 }}
                    />
                    <label htmlFor="show-trip-markers" className="text-xs font-medium text-gray-700 cursor-pointer select-none mr-2">Trips</label>
                    
                    {/* Display Mode Dropdown */}
                    <select
                        value={filters.displayMode || "line"}
                        onChange={e => handleFiltersChange({ ...filters, displayMode: e.target.value })}
                        className="p-1 border border-gray-300 rounded text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#25689f] bg-white"
                        title="Display Mode"
                    >
                        <option value="line">📍 Line</option>
                        <option value="marker">🎯 Marker</option>
                    </select>
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

                {/* Right Controls - Stop Duration and Speed (4 columns) */}
                <div className="col-span-4 flex items-center justify-end space-x-1 sm:space-x-2">
                    {/* Stop Duration Dropdown */}
                    <select
                        value={filters.stopDuration || "all"}
                        onChange={e => handleFiltersChange({ ...filters, stopDuration: e.target.value })}
                        className="p-1 border border-gray-300 rounded text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#25689f] bg-white"
                        title="Stop Duration"
                    >
                        <option value="all">All Stops</option>
                        <option value="5">Above 5 min</option>
                        <option value="10">Above 10 min</option>
                        <option value="15">Above 15 min</option>
                    </select>

                    <ReplaySpeedControl
                        currentSpeed={playbackSpeed}
                        onSpeedChange={handleSpeedChange}
                    />
                </div>
            </div>

            {/* Filter panel removed for compact UI */}
        </div>
    );
};

export default ReplayControls;
