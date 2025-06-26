import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  Suspense,
  lazy 
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navber/Navbar";
import MapSidebar from "./MapSidebar";
import MapSidebarOptions from "../../components/map sidebar options/MapSidebarOptions";
import LocationSearch from "../../components/map/LocationSearch";
import { Search, MapPin, Table, ChevronUp, X, Settings } from "lucide-react";
import mapicon from "../../assets/mapicon.png";

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
  // ✅ PERFORMANCE: Group related state together
  const [uiState, setUiState] = useState({
    isMobileSidebarOpen: false,
    isMobile: false,
    isDataTableOpen: false,
    isSearchOpen: false,
    isMapOptionsOpen: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  
  const searchInputRef = useRef(null);
  const mapContainerRef = useRef(null);

  // ✅ PERFORMANCE: Memoized state updaters
  const updateUiState = useCallback((updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  // ✅ PERFORMANCE: Debounced resize handler
  const handleResize = useMemo(() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateUiState({ isMobile: window.innerWidth < 1280 });
      }, 100);
    };
  }, [updateUiState]);

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

  // ✅ PERFORMANCE: Memoized callback functions
  const handleFitToMap = useCallback(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.closeAllPopups();
      const success = mapContainerRef.current.fitToAllMarkers();
      if (!success) {
        mapContainerRef.current.zoomToPakistan();
      }
    }
  }, []);

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

  const closeSearch = useCallback(() => {
    setSearchQuery("");
    updateUiState({ isSearchOpen: false });
  }, [updateUiState]);

  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

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

  // ✅ PERFORMANCE: Memoized animation variants
  const overlayVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }), []);

  const slideVariants = useMemo(() => ({
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" }
  }), []);

  const fadeVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }), []);

  // ✅ PERFORMANCE: Memoized components
  const DesktopControls = useMemo(() => (
    <div className="absolute left-[355px] top-19 z-10 hidden xl:flex space-x-2">
      {/* Search Component */}
      <div className="transition-all duration-300 ease-in-out">
        {uiState.isSearchOpen ? (
          <LocationSearch
            ref={searchInputRef}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
            setSearchQuery={handleSearchQueryChange}
            onClose={closeSearch}
          />
        ) : (
          <button
            onClick={toggleSearch}
            className="bg-white h-[42px] w-[42px] cursor-pointer rounded-sm shadow-md hover:bg-gray-50 flex items-center justify-center border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Search Locations"
          >
            <Search size={20} className="text-dark" />
          </button>
        )}
      </div>

      {/* Fit to Map Button */}
      <button
        onClick={handleFitToMap}
        className="bg-white py-2 px-3 cursor-pointer h-[42px] flex gap-3 text-dark shadow-md rounded-sm border border-gray-200 text-[14px] font-medium justify-center items-center hover:bg-gray-50 group transition-all duration-200 hover:scale-105 active:scale-95"
        title="Fit to Map"
      >
        <img
          src={mapicon}
          alt="fit"
          className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Map Options Button */}
      <button
        onClick={openMapOptions}
        className="bg-white py-2 px-3 h-[42px] cursor-pointer flex gap-3 text-dark shadow-md rounded-sm border border-gray-200 text-[14px] font-medium justify-center items-center hover:bg-gray-50 group transition-all duration-200 hover:scale-105 active:scale-95"
        title="Map Settings"
      >
        <Settings
          size={20}
          className="group-hover:scale-110 transition-transform duration-200 text-gray-700"
        />
      </button>
    </div>
  ), [
    uiState.isSearchOpen,
    handleLocationSelect,
    searchQuery,
    handleSearchQueryChange,
    closeSearch,
    toggleSearch,
    handleFitToMap,
    openMapOptions
  ]);

  const MobileControls = useMemo(() => (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center z-20 xl:hidden">
      <div className="bg-white rounded-full shadow-lg flex overflow-hidden">
        <button
          onClick={handleFitToMap}
          className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          title="Fit to Map"
        >
          <img src={mapicon} alt="Fit to Map" className="h-6 w-6" />
        </button>
        
        <button
          onClick={toggleDataTable}
          className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          title="Toggle Data Table"
        >
          <Table
            size={24}
            className={`${uiState.isDataTableOpen ? "text-primary" : "text-dark"}`}
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
  ), [handleFitToMap, toggleDataTable, uiState.isDataTableOpen, openMapOptions, openMobileSidebar]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Navigation Bar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Map Container - Hardware accelerated */}
      <div 
        className="absolute inset-0 z-0 top-16 transition-all duration-300"
        style={{ 
          transform: 'translate3d(0,0,0)',
          willChange: 'transform'
        }}
      >
        <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
          <MapContainer ref={mapContainerRef} searchQuery={searchQuery} />
        </Suspense>
      </div>

      {/* Desktop Sidebar */}
      <div className="absolute left-1 h-[calc(100%-6rem)] w-[354px] z-30 hidden xl:block">
        <MapSidebar />
      </div>

      {/* Desktop Controls */}
      {DesktopControls}

      {/* Desktop Data Table Toggle Button */}
      <div className="fixed bottom-6 right-20 z-20 hidden xl:block">
        <button
          onClick={toggleDataTable}
          className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
            uiState.isDataTableOpen
              ? "bg-primary text-white p-3"
              : "bg-white text-gray-700 p-3 hover:bg-gray-50"
          }`}
          title={uiState.isDataTableOpen ? "Close Data Table" : "Open Data Table"}
        >
          <Table size={22} />
          {!uiState.isDataTableOpen && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
              <ChevronUp size={14} className="text-white" />
            </div>
          )}
        </button>
      </div>

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
            className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-40 flex items-start justify-center pt-20"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{ willChange: 'opacity' }}
          >
            <motion.div
              className="w-[90%] max-w-md"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <LocationSearch
                onLocationSelect={(location) => {
                  handleLocationSelect(location);
                  toggleSearch();
                }}
                searchQuery={searchQuery}
                setSearchQuery={handleSearchQueryChange}
                isMobile={true}
              />
              <button
                onClick={toggleSearch}
                className="mt-4 mx-auto block text-gray-500 hover:text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Sidebar - Optimized */}
      <AnimatePresence mode="wait">
        {uiState.isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              style={{ willChange: 'opacity' }}
            />
            
            {/* Sidebar Content */}
            <motion.div
              className="fixed inset-0 bg-white z-50"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ 
                type: "tween", 
                duration: 0.25,
                ease: "easeInOut"
              }}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            >
              <Suspense fallback={<LoadingSpinner message="Loading sidebar..." />}>
                <MobileSidebar onClose={closeMobileSidebar} />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Data Table - Optimized */}
      <Suspense fallback={null}>
        <MapDataTable
          isOpen={uiState.isDataTableOpen}
          onToggle={toggleDataTable}
          sidebarWidth={346}
        />
      </Suspense>
    </div>
  );
};

export default React.memo(LiveMap);

