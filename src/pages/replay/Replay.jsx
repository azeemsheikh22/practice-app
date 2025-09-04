import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import {
  fetchReplayData,
  selectReplayData,
  fetchReplayTrips,
  selectReplayTrips,
  fetchReplayGeofenceForUser,
  incrementGetReplayCount,
} from "../../features/replaySlice";
import { fetchGeofenceCatList } from "../../features/geofenceSlice";

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
  const tripsData = useSelector(selectReplayTrips);

  // Log vehicleId from query param if present
  const location = useLocation();
  const [urlVehicleId, setUrlVehicleId] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vehicleId = params.get("vehicleId");
    setUrlVehicleId(vehicleId);
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchGeofenceCatList());
    dispatch(fetchReplayGeofenceForUser());
  }, []);

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

  const handleGetReplayData = ({
    vehicle,
    fromDate,
    toDate,
    fromTime,
    toTime,
  }) => {
    // If vehicle is not selected, but urlVehicleId exists, use that
    let carId = vehicle && vehicle.valueId ? vehicle.valueId : urlVehicleId;
    if (!carId || !fromDate || !toDate) {
      return;
    }
    // Format dates for API (YYYY/MM/DD)
    const datefrom = fromDate.replace(/-/g, "/");
    const dateto = toDate.replace(/-/g, "/");
    // Pass fromTime and toTime to thunks
    dispatch(incrementGetReplayCount());
    dispatch(fetchReplayData({ carId, datefrom, dateto, fromTime, toTime }));
    dispatch(fetchReplayTrips({ carId, datefrom, dateto, fromTime, toTime }));
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
          flex-shrink-0 transition-all duration-300 ease-in-out relative 
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
          {/* Info Bar Above Map */}
          {Array.isArray(replayApiData) && replayApiData.length > 0 && (
            <div
              className="w-full flex flex-row items-center justify-between px-2 py-1 bg-gradient-to-r from-[#25689f]/10 to-[#1F557F]/10 shadow-sm text-[11px] md:text-xs font-medium z-20"
              style={{ minHeight: 28, lineHeight: 1.1 }}
            >
              {/* Start Time */}
              <div className="flex flex-row items-center gap-1">
                <span className="text-gray-500">Start:</span>
                <span
                  className="font-semibold text-gray-800 truncate max-w-[150px]"
                  title={replayApiData[0].gps_time}
                >
                  {new Date(replayApiData[0].gps_time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              {/* Vehicle Name */}
              <div className="flex flex-row items-center gap-1">
                {/* <img src={require('../../assets/logo.png')} alt="vehicle" className="w-5 h-5 rounded object-contain border border-gray-200 bg-white" /> */}
                <span
                  className="font-semibold text-[#25689f] text-xs md:text-sm truncate max-w-[120px]"
                  title={replayApiData[0].car_name}
                >
                  {replayApiData[0].car_name}
                </span>
              </div>
              {/* End Time */}
              <div className="flex flex-row items-center gap-1">
                <span className="text-gray-500">End:</span>
                <span
                  className="font-semibold text-gray-800 truncate max-w-[150px]"
                  title={replayApiData[replayApiData.length - 1].gps_time}
                >
                  {new Date(
                    replayApiData[replayApiData.length - 1].gps_time
                  ).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="flex-1 relative">
            <ReplayMap
              ref={mapRef}
              replayData={replayApiData}
              tripsData={tripsData}
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
