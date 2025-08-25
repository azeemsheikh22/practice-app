import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import Navbar from "../../components/navber/Navbar";
import MapSidebar from "./MapSidebar";
import MapSidebarOptions from "../../components/map sidebar options/MapSidebarOptions";
import LocationSearch from "../../components/map/LocationSearch";
import { MapPin, Table, ChevronUp, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalSearchQuery } from "../../features/locationSearchSlice";
import AlertPopup from "../../components/alerts/AlertPopup";
import AlertDetailModal from "../../components/alerts/AlertDetailModal";
import NetworkStatus from "../../components/map/NetworkStatus";
import {
  initializeConnection,
  selectConnectionStatus,
  selectAlertData,
} from "../../features/gpsTrackingSlice";

// ✅ PERFORMANCE: Lazy load heavy components
const MapContainer = lazy(() => import("./MapContainer"));
const MobileSidebar = lazy(() => import("./MobileSidebar"));
const MapDataTable = lazy(() => import("./MapDataTable"));

// ✅ PERFORMANCE: Loading component
const LoadingSpinner = React.memo(({ message = "Loading..." }) => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
));

const LiveMap = () => {
  // ✅ PERFORMANCE: Group related state together - Updated without search toggle
  const [uiState, setUiState] = useState({
    isMobileSidebarOpen: false,
    isMobile: false,
    isDataTableOpen: false,
    // ✅ REMOVED: isSearchOpen since search is always visible
    isMapOptionsOpen: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const connectionStatus = useSelector(selectConnectionStatus);


  // Get alert data from redux
  const alertData = useSelector(selectAlertData);


  // Manage visible alerts (show up to 4 at a time, auto-dismiss after 7s, pause on hover)
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const alertTimers = useRef({});
  const [hoveredAlertId, setHoveredAlertId] = useState(null);

  // Modal state for alert details
  const [modalAlert, setModalAlert] = useState(null);

  // Alert queue system: always show oldest 4 visible, never miss any alert
  useEffect(() => {
    if (!alertData || alertData.length === 0) {
      setVisibleAlerts([]);
      return;
    }
    setVisibleAlerts((prev) => {
      // Remove any that are no longer in alertData
      const stillValid = prev.filter((a) => alertData.some((b) => b.alm_id === a.alm_id));
      // Add new alerts (in order), skip duplicates
      const prevIds = stillValid.map((a) => a.alm_id);
      const newToAdd = alertData.filter((a) => !prevIds.includes(a.alm_id));
      const queue = [...stillValid, ...newToAdd];
      // Only show first 4 in the queue
      return queue.slice(0, 4);
    });
  }, [alertData]);

  // Set up auto-dismiss for each alert, pause timer if hovered
  useEffect(() => {
    visibleAlerts.forEach((alert) => {
      // If alert is hovered, don't set or clear timer
      if (hoveredAlertId === alert.alm_id) {
        if (alertTimers.current[alert.alm_id]) {
          clearTimeout(alertTimers.current[alert.alm_id]);
          delete alertTimers.current[alert.alm_id];
        }
        return;
      }
      // If not hovered, set timer if not already set
      if (!alertTimers.current[alert.alm_id]) {
        alertTimers.current[alert.alm_id] = setTimeout(() => {
          setVisibleAlerts((prev) => prev.filter((a) => a.alm_id !== alert.alm_id));
          delete alertTimers.current[alert.alm_id];
        }, 7000);
      }
    });
    // Clean up timers for removed alerts
    Object.keys(alertTimers.current).forEach((id) => {
      if (!visibleAlerts.find((a) => a.alm_id === Number(id))) {
        clearTimeout(alertTimers.current[id]);
        delete alertTimers.current[id];
      }
    });
    return () => {
      Object.values(alertTimers.current).forEach(clearTimeout);
      alertTimers.current = {};
    };
  }, [visibleAlerts, hoveredAlertId]);

  // Handler to close a single alert or all
  const handleCloseAlert = useCallback((id) => {
    if (id === "all") {
      setVisibleAlerts([]);
      Object.values(alertTimers.current).forEach(clearTimeout);
      alertTimers.current = {};
    } else {
      setVisibleAlerts((prev) => {
        const filtered = prev.filter((a) => a.alm_id !== id);
        // After removing, check if there are more alerts in alertData not currently shown
        const shownIds = filtered.map((a) => a.alm_id);
        const notShown = alertData.filter((a) => !shownIds.includes(a.alm_id) && !prev.some((p) => p.alm_id === a.alm_id));
        // Add the next alert in the queue if available
        if (notShown.length > 0) {
          return [...filtered, notShown[0]].slice(0, 4);
        }
        return filtered;
      });
      if (alertTimers.current[id]) {
        clearTimeout(alertTimers.current[id]);
        delete alertTimers.current[id];
      }
    }
  }, [alertData]);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  // ✅ PERFORMANCE: Memoized state updaters
  const updateUiState = useCallback((updates) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  }, []);

  // ✅ ADD: Sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState(340); // Default width

  // ✅ ADD: Callback to handle width changes
  const handleSidebarWidthChange = useCallback((width) => {
    setSidebarWidth(width);

    // ✅ NEW: Trigger map resize after sidebar width changes
    setTimeout(() => {
      if (mapContainerRef.current) {
        // Trigger resize event to update map
        window.dispatchEvent(new Event("resize"));

        // Force map invalidation and redraw
        if (mapContainerRef.current.invalidateSize) {
          mapContainerRef.current.invalidateSize();
        }
      }
    }, 300); // Small delay to allow DOM to update
  }, []);

  // ✅ Add mobile height calculation function
  const calculateMobileHeight = useCallback(() => {
    if (typeof window !== "undefined") {
      const windowHeight = window.innerHeight;
      const navbarHeight = 64; // 16 * 4 = 64px (h-16)
      const tabsHeight = 60; // Tabs height
      const paddingBuffer = 20; // Extra padding

      return windowHeight - navbarHeight - tabsHeight - paddingBuffer;
    }
    return "calc(100vh - 144px)"; // Fallback
  }, []);

  // ✅ Add mobile height state
  const [mobileTreeHeight, setMobileTreeHeight] = useState(
    calculateMobileHeight()
  );

  // ✅ Update resize handler to include mobile height calculation
  const handleResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 1280;
        updateUiState({ isMobile });

        // ✅ Update mobile tree height on resize
        if (isMobile) {
          setMobileTreeHeight(calculateMobileHeight());
        }

        // ✅ NEW: Force map resize on window resize
        if (mapContainerRef.current) {
          if (mapContainerRef.current.invalidateSize) {
            mapContainerRef.current.invalidateSize();
          }
        }
      }, 100);
    };
  }, [updateUiState, calculateMobileHeight]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      updateUiState({ isMobile: window.innerWidth < 1280 });
    };

    checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, updateUiState]);

  // Focus search input when opened with slight delay for smooth animation
  useEffect(() => {
    if (uiState.isSearchOpen && searchInputRef.current) {
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [uiState.isSearchOpen]);

  const handleLocationSelect = useCallback((location) => {
    if (mapContainerRef.current) {
      mapContainerRef.current.zoomToLocation(
        location.lat,
        location.lng,
        location.name
      );
    }
  }, []);

  const toggleDataTable = useCallback(() => {
    updateUiState({ isDataTableOpen: !uiState.isDataTableOpen });
  }, [uiState.isDataTableOpen, updateUiState]);

  const toggleSearch = useCallback(() => {
    if (uiState.isSearchOpen) {
      setSearchQuery("");
      setTimeout(() => updateUiState({ isSearchOpen: false }), 100);
    } else {
      updateUiState({ isSearchOpen: true });
    }
  }, [uiState.isSearchOpen, updateUiState]);

  // ✅ NEW: Clear search function for always visible search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    dispatch(setGlobalSearchQuery(""));
  }, [dispatch]);

  const openMapOptions = useCallback(() => {
    updateUiState({ isMapOptionsOpen: true });
  }, [updateUiState]);

  const closeMapOptions = useCallback(() => {
    updateUiState({ isMapOptionsOpen: false });
  }, [updateUiState]);

  const openMobileSidebar = useCallback(() => {
    updateUiState({ isMobileSidebarOpen: true });
  }, [updateUiState]);

  const closeMobileSidebar = useCallback(() => {
    updateUiState({ isMobileSidebarOpen: false });
  }, [updateUiState]);

  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // ✅ PERFORMANCE: Memoized animation variants
  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    }),
    []
  );

  const slideVariants = useMemo(
    () => ({
      hidden: { x: "100%" },
      visible: { x: 0 },
      exit: { x: "100%" },
    }),
    []
  );

  const DesktopControls = useMemo(
    () => (
      <div className="flex items-center justify-between w-full pr-4 ps-2 h-[40px] bg-[#1F557F] relative z-40">
        {/* Left side - Search input */}
        <div className="flex items-center space-x-2">
          {/* Always visible Search Component - FIXED Z-INDEX */}
          <div className="transition-all duration-300 ease-in-out relative z-50">
            <LocationSearch
              ref={searchInputRef}
              onLocationSelect={handleLocationSelect}
              searchQuery={searchQuery}
              setSearchQuery={handleSearchQueryChange}
              onClear={clearSearch}
              isCompact={true}
            />
          </div>
        </div>

        {/* Right side - Network Status & Control buttons */}
        <div className="flex items-center space-x-3">
          {/* ✅ Network Status Indicator */}
          <NetworkStatus />

          {/* Map Options Button */}
          <button
            onClick={openMapOptions}
            className="h-[32px] px-2 cursor-pointer flex gap-1 text-white/90 hover:text-white text-[13px] font-medium justify-center items-center group transition-all duration-200 hover:scale-105 active:scale-95 rounded"
            title="Map Settings"
          >
            <Settings
              size={16}
              className="group-hover:scale-110 group-hover:rotate-90 transition-all duration-300"
            />
            <span className="hidden lg:inline-block text-xs font-medium">
              Settings
            </span>
          </button>

          {/* ✅ REMOVED: Fit to Map Button - moved to MapContainer */}
        </div>
      </div>
    ),
    [
      handleLocationSelect,
      searchQuery,
      handleSearchQueryChange,
      clearSearch,
      openMapOptions,
    ]
  );

  // ✅ Update mobile controls to pass height
  const MobileControls = useMemo(
    () => (
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center z-20 xl:hidden">
        <div className="bg-white rounded-full shadow-lg flex overflow-hidden">
          <button
            onClick={toggleDataTable}
            className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Toggle Data Table"
          >
            <Table
              size={24}
              className={`${
                uiState.isDataTableOpen ? "text-primary" : "text-dark"
              }`}
            />
          </button>

          <button
            onClick={openMapOptions}
            className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Map Settings"
          >
            <Settings size={24} className="text-dark" />
          </button>

          <button
            onClick={openMobileSidebar}
            className="px-5 py-3 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Open Menu"
          >
            <div className="relative">
              <MapPin size={24} className="text-dark" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            </div>
          </button>
        </div>
      </div>
    ),
    [
      toggleDataTable,
      uiState.isDataTableOpen,
      openMapOptions,
      openMobileSidebar,
    ]
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      {/* Alert Popups - always on top */}
      <AlertPopup
        alerts={visibleAlerts}
        onClose={handleCloseAlert}
        zIndex={99999}
        onAlertHover={setHoveredAlertId}
        onViewAlert={setModalAlert}
      />

      {/* Alert Detail Modal */}
      <AlertDetailModal alert={modalAlert} open={!!modalAlert} onClose={() => setModalAlert(null)} />
      {/* Navigation Bar */}
      <div className="h-[9vh] overflow-hidden z-50">
        <Navbar />
      </div>
      <div className="h-[91vh] flex flex-row">
        {/* Desktop Sidebar */}
        <div className="z-[730] hidden xl:block">
          <MapSidebar onWidthChange={handleSidebarWidthChange} />
        </div>

        <div className="w-[100%] flex flex-col">
          {/* Desktop Controls with heading and buttons - Fixed 45px height */}
          <div className="hidden xl:block">{DesktopControls}</div>

          <div className="h-full w-[100%]">
            <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
              <MapContainer
                ref={mapContainerRef}
                searchQuery={searchQuery}
                sidebarWidth={sidebarWidth} // ✅ NEW: Pass sidebar width to MapContainer
              />
            </Suspense>
          </div>

          {/* Data Table - Optimized */}
          <Suspense fallback={null}>
            <MapDataTable
              isOpen={uiState.isDataTableOpen}
              onToggle={toggleDataTable}
              sidebarWidth={sidebarWidth} // ✅ CHANGED: Dynamic width instead of fixed 340
            />
          </Suspense>
        </div>
      </div>

      {/* Desktop Data Table Toggle Button - HIDE WHEN OPEN */}
      {!uiState.isDataTableOpen && (
        <div className="fixed bottom-6 right-20 z-20 hidden xl:block">
          <button
            onClick={toggleDataTable}
            className="flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 bg-white text-gray-700 p-3 hover:bg-gray-50"
            title="Open Data Table"
          >
            <Table size={22} />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
              <ChevronUp size={14} className="text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Controls */}
      {MobileControls}

      {/* Map Sidebar Options Modal - Optimized */}
      <AnimatePresence mode="wait">
        {uiState.isMapOptionsOpen && (
          <MapSidebarOptions
            isOpen={uiState.isMapOptionsOpen}
            onClose={closeMapOptions}
          />
        )}
      </AnimatePresence>

      {/* Mobile Controls */}
      {MobileControls}

      {/* Map Sidebar Options Modal - Optimized */}
      <AnimatePresence mode="wait">
        {uiState.isMapOptionsOpen && (
          <MapSidebarOptions
            isOpen={uiState.isMapOptionsOpen}
            onClose={closeMapOptions}
          />
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay - Optimized */}
      <AnimatePresence mode="wait">
        {uiState.isMobile && uiState.isSearchOpen && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex flex-col"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Search Location</h2>
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <LocationSearch
                ref={searchInputRef}
                onLocationSelect={(location) => {
                  handleLocationSelect(location);
                  toggleSearch();
                }}
                searchQuery={searchQuery}
                setSearchQuery={handleSearchQueryChange}
                onClear={clearSearch}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - Optimized */}
      <AnimatePresence mode="wait">
        {uiState.isMobile && uiState.isMobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-y-0 right-0 w-[100%] bg-white z-[800] shadow-xl"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Suspense
                fallback={<LoadingSpinner message="Loading sidebar..." />}
              >
                <MobileSidebar
                  onClose={closeMobileSidebar}
                  mobileHeight={mobileTreeHeight}
                />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveMap;
