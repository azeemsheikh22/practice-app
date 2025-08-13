import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import Navbar from "../../components/navber/Navbar";
import ReplaySidebar from "./ReplaySidebar";
import ReplayMap from "./ReplayMap";
import ReplayControls from "./ReplayControls";

import { useDispatch, useSelector } from "react-redux";
import {
  initializeConnection,
  selectConnectionStatus,
} from "../../features/gpsTrackingSlice";
import { fetchReplayData, selectReplayData } from "../../features/replaySlice";

const Replay = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Remove local replayData state, use replayApiData from Redux
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [filters, setFilters] = useState({});
  const mapRef = useRef(null);

  const dispatch = useDispatch();
  const replayApiData = useSelector(selectReplayData);

  // Handler to get replay data from sidebar
  const handleGetReplayData = ({ vehicle, fromDate, toDate }) => {
    // console.log(vehicle)
    if (!vehicle || !fromDate || !toDate) return;
    // Format dates for API (YYYY/MM/DD)
    const datefrom = fromDate.replace(/-/g, "/");
    const dateto = toDate.replace(/-/g, "/");
    dispatch(fetchReplayData({ carId: vehicle.valueId, datefrom, dateto }));
  };

  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  const handlePlayStateChange = (playing) => {
    setIsPlaying(playing);
  };

  const handleTimeChange = (time) => {
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDrawTrack = () => {
    if (mapRef.current) {
      mapRef.current.drawTrack();
    }
  };

  // Remove unused handleReplayDataReceived

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative">
      {/* Navigation Bar */}
      <div className="flex-shrink-0 relative z-10">
        <Navbar />
      </div>

      {/* Mobile Toggle Button - Highest z-index to ensure visibility */}
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-30 left-4 z-[9999] p-3 bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white rounded-full  hover:from-[#1F557F] hover:to-[#184567] transition-all duration-200 cursor-pointer transform hover:scale-105 border-2 border-white"
          style={{
            boxShadow: "0 8px 25px rgba(37, 104, 159, 0.5)",
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Always on left */}
        <div
          className={`
          flex-shrink-0 transition-all duration-300 ease-in-out relative z-40
          ${isSidebarExpanded ? "w-0 lg:w-96" : "w-0 lg:w-16"}
        `}
        >
          <ReplaySidebar
            isExpanded={isSidebarExpanded}
            onToggleExpand={setIsSidebarExpanded}
            onGetReplayData={handleGetReplayData}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuToggle={setIsMobileMenuOpen}
          />
        </div>

        {/* Map Area - Lower z-index than sidebar on mobile */}
        <div
          className={`flex-1 flex flex-col relative z-0 ${
            isMobileMenuOpen ? "lg:z-0" : "z-0"
          }`}
        >
          {/* Map */}
          <div className="flex-1 relative">
          <ReplayMap
            ref={mapRef}
            replayData={replayApiData}
            isPlaying={isPlaying}
            currentTime={currentTime}
            isMobileMenuOpen={isMobileMenuOpen}
            sidebarExpanded={isSidebarExpanded}
          />
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 relative ">
            <ReplayControls
              replayData={replayApiData}
              onPlayStateChange={handlePlayStateChange}
              onTimeChange={handleTimeChange}
              onSpeedChange={handleSpeedChange}
              onFiltersChange={handleFiltersChange}
              onDrawTrack={handleDrawTrack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Replay;
