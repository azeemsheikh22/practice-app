import { lazy, Suspense, useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../../components/navber/Navbar";
import MapSidebar from "./MapSidebar";
import MapSidebarOptions from "../../components/map sidebar options/MapSidebarOptions";
import LocationSearch from "../../components/map/LocationSearch";
import { Search, MapPin, Table, ChevronUp, X, Settings } from "lucide-react";
import mapicon from "../../assets/mapicon.png";

const MapContainer = lazy(() => import("./MapContainer"));
const MobileSidebar = lazy(() => import("./MobileSidebar"));
const MapDataTable = lazy(() => import("./MapDataTable"));

const LiveMap = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDataTableOpen, setIsDataTableOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapOptionsOpen, setIsMapOptionsOpen] = useState(false);
  const searchInputRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Focus search input when opened with slight delay for smooth animation
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Small delay to ensure animation completes first
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 150);
    }
  }, [isSearchOpen]);

  // Handle fit to map functionality
  const handleFitToMap = useCallback(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.closeAllPopups();
      const success = mapContainerRef.current.fitToAllMarkers();
      if (!success) {
        mapContainerRef.current.zoomToPakistan();
      }
    }
  }, []);

  // Handle location selection from search
  const handleLocationSelect = useCallback((location) => {
    if (mapContainerRef.current) {
      mapContainerRef.current.zoomToLocation(
        location.lat,
        location.lng,
        location.name
      );
    }
  }, []);

  // Toggle data table
  const toggleDataTable = useCallback(() => setIsDataTableOpen(!isDataTableOpen), [isDataTableOpen]);

  // Toggle search with smooth animation
  const toggleSearch = useCallback(() => {
    if (isSearchOpen) {
      // Clear search first, then close
      setSearchQuery("");
      setTimeout(() => setIsSearchOpen(false), 100);
    } else {
      setIsSearchOpen(true);
    }
  }, [isSearchOpen]);

  // Optimized close search function
  const closeSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchOpen(false);
  }, []);

  // Optimized search query handler
  const handleSearchQueryChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Navigation Bar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 z-0 top-16 transition-all duration-300">
        <Suspense fallback={<div>Loading map...</div>}>
          <MapContainer ref={mapContainerRef} searchQuery={searchQuery} />
        </Suspense>
      </div>

      {/* Desktop Sidebar */}
      <div className="absolute left-1 h-[calc(100%-6rem)] w-[354px] z-30 hidden xl:block">
        <MapSidebar />
      </div>

      {/* Desktop Controls */}
      <div className="absolute left-[355px] top-19 z-10 hidden xl:flex space-x-2">
        {/* Search Component with smooth transitions */}
        <div className={`transition-all duration-300 ease-in-out ${
          isSearchOpen ? 'opacity-100 scale-100' : 'opacity-100 scale-100'
        }`}>
          {isSearchOpen ? (
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
          onClick={() => setIsMapOptionsOpen(true)}
          className="bg-white py-2 px-3 h-[42px] cursor-pointer flex gap-3 text-dark shadow-md rounded-sm border border-gray-200 text-[14px] font-medium justify-center items-center hover:bg-gray-50 group transition-all duration-200 hover:scale-105 active:scale-95"
          title="Map Settings"
        >
          <Settings
            size={20}
            className="group-hover:scale-110 transition-transform duration-200 text-gray-700"
          />
        </button>
      </div>

      {/* Map Sidebar Options Modal */}
      <MapSidebarOptions
        isOpen={isMapOptionsOpen}
        onClose={() => setIsMapOptionsOpen(false)}
        onApplySettings={(settings) =>
          console.log("Applied map settings:", settings)
        }
      />

      {/* Desktop Data Table Toggle Button */}
      <div className="fixed bottom-6 right-20 z-20 hidden xl:block">
        <button
          onClick={toggleDataTable}
          className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
            isDataTableOpen
              ? "bg-primary text-white p-3"
              : "bg-white text-gray-700 p-3 hover:bg-gray-50"
          }`}
          title={isDataTableOpen ? "Close Data Table" : "Open Data Table"}
        >
          <Table size={22} />
          {!isDataTableOpen && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
              <ChevronUp size={14} className="text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile Bottom Controls */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center z-20 xl:hidden">
        <div className="bg-white rounded-full shadow-lg flex overflow-hidden">
          {/* Fit to Map */}
          <button
            onClick={handleFitToMap}
            className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Fit to Map"
          >
            <img src={mapicon} alt="Fit to Map" className="h-6 w-6" />
          </button>

          {/* Data Table Toggle */}
          <button
            onClick={toggleDataTable}
            className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Toggle Data Table"
          >
            <Table
              size={24}
              className={`${isDataTableOpen ? "text-primary" : "text-dark"}`}
            />
          </button>

          {/* Map Options */}
          <button
            onClick={() => setIsMapOptionsOpen(true)}
            className="px-5 py-3 border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            title="Map Settings"
          >
            <Settings size={24} className="text-dark" />
          </button>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
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

      {/* Mobile Search Overlay with smooth animation */}
      {isMobile && isSearchOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-40 flex items-start justify-center pt-20 animate-in fade-in duration-300">
          <div className="w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
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
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sidebar Content - Full Screen */}
          <div className="fixed inset-0 bg-white z-50 transform transition-transform duration-300">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading sidebar...</div>
                </div>
              }
            >
              <MobileSidebar onClose={() => setIsMobileSidebarOpen(false)} />
            </Suspense>
          </div>
        </>
      )}

      {/* Data Table */}
      <Suspense
        fallback={
          <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex items-center justify-center z-20">
            <div className="text-gray-500">Loading table...</div>
          </div>
        }
      >
        <MapDataTable
          isOpen={isDataTableOpen}
          onToggle={toggleDataTable}
          sidebarWidth={346}
        />
      </Suspense>
    </div>
  );
};

export default LiveMap;
