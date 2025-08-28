
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReplayDetailsTab from "./ReplayDetailsTab";
import {
  Play,
  Search,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";
import ReplayTripsTab from "./ReplayTripsTab";
import ReplayTreeView from "./ReplayTreeView";

const ReplaySidebar = ({
  isExpanded,
  onToggleExpand,
  onGetReplayData,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const replayData = useSelector((state) => state.replay.replayData);
  // (already declared above)
  const replayLoading = useSelector((state) => state.replay.loading);
  const [activeTab, setActiveTab] = useState("selection");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Get vehicleId from URL if present
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Date/Time filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [quickFilter, setQuickFilter] = useState("today");

  const rawVehicles = useSelector((state) => state.gpsTracking.rawVehicleList);
  const vehiclesLoading = useSelector((state) => state.gpsTracking.loading);

  // Initialize dates and show info toast about 7-day limit
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setFromDate(todayStr);
    setToDate(todayStr);
    toast("You can only get up to 7 days of replay data.", { icon: "ℹ️" });
  }, []);

  // Use a ref to track if we've already auto-fetched for this session
  // Refs don't cause re-renders when they change
  const autoFetchedRef = useRef(false);

  // Handle vehicleId from URL parameter - selection and one-time fetch
  useEffect(() => {
    const vehicleId = params.get("vehicleId");

    // Only proceed if we have a vehicleId and vehicles data
    if (vehicleId && rawVehicles.length > 0) {
      // Only continue if we haven't already auto-fetched
      if (!autoFetchedRef.current) {
        // Find the vehicle with matching id
        const vehicle = rawVehicles.find(
          (v) => v.valueId === vehicleId || v.id === vehicleId
        );

        if (vehicle && vehicle.Type === "Vehicle") {
          // Select the vehicle
          setSelectedVehicle(vehicle);

          // Expand parent groups of this vehicle
          const parentGroups = findParentGroups(vehicle.id, rawVehicles);
          let newExpandedGroups = { ...expandedGroups };

          parentGroups.forEach((groupId) => {
            newExpandedGroups[groupId] = true;
          });

          setExpandedGroups(newExpandedGroups);

          // Add a timeout to allow the component to stabilize before fetching
          const timer = setTimeout(() => {
            handleGetReplay();

            // Mark that we've fetched so we don't do it again
            autoFetchedRef.current = true;
          }, 1500);

          // Clean up the timer if component unmounts
          return () => clearTimeout(timer);
        } else {
          console.log("Vehicle not found for ID:", vehicleId);
        }
      } else {
        console.log("Skipping auto-fetch as it was already done");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawVehicles]);

  // Helper function
  const findParentGroups = (vehicleId, vehicles) => {
    const parentGroups = [];
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return parentGroups;

    let currentParent = vehicle.parent;
    while (currentParent && currentParent !== "#") {
      const parentGroup = vehicles.find((item) => item.id === currentParent);
      if (parentGroup && parentGroup.Type === "Group") {
        parentGroups.push(parentGroup.id);
        currentParent = parentGroup.parent;
      } else {
        break;
      }
    }
    return parentGroups;
  };

  // Auto-expand groups
  useEffect(() => {
    if (rawVehicles.length > 0) {
      const entireFleetGroup = rawVehicles.find(
        (item) => item.text === "Entire Fleet" && item.Type === "Group"
      );

      let newExpandedGroups = {};

      if (entireFleetGroup) {
        newExpandedGroups[entireFleetGroup.id] = true;
      }

      if (searchQuery.trim()) {
        const matchingVehicles = rawVehicles.filter(
          (item) =>
            item.Type === "Vehicle" &&
            item.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        matchingVehicles.forEach((vehicle) => {
          const parentGroups = findParentGroups(vehicle.id, rawVehicles);
          parentGroups.forEach((groupId) => {
            newExpandedGroups[groupId] = true;
          });
        });
      }

      setExpandedGroups(newExpandedGroups);
    }
  }, [searchQuery, rawVehicles]);

  const quickFilterOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7day", label: "7 Days" },
  ];

  const handleToggleExpand = () => {
    onToggleExpand(!isExpanded);
  };

  const handleQuickFilterChange = (filterValue) => {
    setQuickFilter(filterValue);
    const today = new Date();
    let from, to, fromTime, toTime;
    switch (filterValue) {
      case "today": {
        const todayStr = today.toISOString().split("T")[0];
        from = to = todayStr;
        fromTime = "00:00";
        toTime = "23:59";
        break;
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        from = to = yesterdayStr;
        fromTime = "00:00";
        toTime = "23:59";
        break;
      }
      case "7day": {
        const sevenAgo = new Date(today);
        sevenAgo.setDate(today.getDate() - 6); // 7 days including today
        from = sevenAgo.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        fromTime = "00:00";
        toTime = "23:59";
        break;
      }
      default:
        return;
    }
    setFromDate(from);
    setToDate(to);
    setFromTime(fromTime);
    setToTime(toTime);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Close mobile menu after selection on small screens
    if (window.innerWidth < 1024) {
      onMobileMenuToggle(false);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleGetReplay = () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle first");
      return;
    }

    // 7-day range limit
    const from = new Date(`${fromDate}T${fromTime}`);
    const to = new Date(`${toDate}T${toTime}`);
    const diffMs = to - from;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      toast.error(
        "You can only select up to 7 days. Please reduce the date range."
      );
      return;
    }

    if (onGetReplayData) {
      onGetReplayData({
        vehicle: selectedVehicle,
        fromDate,
        toDate,
        fromTime,
        toTime,
        quickFilter,
      });
    } else {
      console.log("ERROR: onGetReplayData function is not available!");
    }
    setActiveTab("details"); // Switch to details tab after getting data

    // Close mobile menu after getting data on small screens
    if (window.innerWidth < 1024) {
      onMobileMenuToggle(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990]"
          onClick={() => onMobileMenuToggle(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 transition-all duration-300 ease-in-out bg-white h-full border-r border-gray-200 shadow-lg overflow-hidden z-[9995]
          ${isMobileMenuOpen ? "left-0 w-[85%] sm:w-[350px]" : "-left-full"}
          lg:static lg:shadow-none lg:z-20
          ${isExpanded ? "lg:w-96" : "lg:w-16"}
          flex flex-col
        `}
        style={{ minHeight: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-[#25689f]/10 to-[#1F557F]/10 flex-shrink-0">
          {(isExpanded || isMobileMenuOpen) && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#25689f] to-[#1F557F] rounded-lg shadow-sm">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-md font-semibold text-gray-900">
                    Replay Track
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onMobileMenuToggle(false);
                  } else {
                    handleToggleExpand();
                  }
                }}
                className="p-2 hover:bg-white/50 rounded-full transition-colors cursor-pointer"
                title={
                  window.innerWidth < 1024
                    ? "Close Sidebar"
                    : "Collapse Sidebar"
                }
              >
                {window.innerWidth < 1024 ? (
                  <X size={18} className="text-gray-600" />
                ) : (
                  <Minimize2 size={18} className="text-gray-600" />
                )}
              </button>
            </>
          )}

          {/* Collapsed State Header - Desktop Only */}
          {!isExpanded && !isMobileMenuOpen && (
            <div className="flex flex-col items-center py-2">
              <div className="p-2 bg-gradient-to-r from-[#25689f] to-[#1F557F] rounded-lg shadow-sm">
                <Play className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleToggleExpand}
                className="p-2 mt-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <Maximize2 size={18} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {(isExpanded || isMobileMenuOpen) && (
          <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
            {[
              { id: "selection", label: "Selection", icon: "🎯" },
              { id: "details", label: "Details", icon: "📋" },
              { id: "trips", label: "Trips", icon: "🛣️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#25689f] border-b-2 border-[#25689f] bg-[#25689f]/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {/* <span className="mr-2 text-xs hidden sm:block">{tab.icon}</span> */}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content - Only show when expanded or mobile menu open */}
        {(isExpanded || isMobileMenuOpen) && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            {/* Main Content Area with Scrolling */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === "selection" && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search Input */}
                  <div className="px-3 pt-2 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search vehicles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-1.5 pl-8 pr-6 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#25689f] focus:border-[#25689f] text-xs transition-all duration-200"
                        style={{ minHeight: 32 }}
                      />
                      <Search
                        size={14}
                        className="absolute left-2 top-2.5 text-gray-400"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tree View with Scrolling */}
                  <div className="flex-1 min-h-0 px-2 pb-2 overflow-y-auto">
                    <ReplayTreeView
                      vehicles={rawVehicles}
                      searchQuery={searchQuery}
                      selectedVehicle={selectedVehicle}
                      expandedGroups={expandedGroups}
                      onVehicleSelect={handleVehicleSelect}
                      onToggleGroup={toggleGroup}
                      loading={vehiclesLoading}
                    />
                  </div>

                  {/* Date/Time Filters - compact row */}
                  <div className="border-t border-gray-200 px-3 pt-2 pb-2 bg-gray-50 flex-shrink-0">
                    <div className="mb-2">
                      {/* <label className="block text-xs font-medium text-gray-700 mb-1">
                        📅 Quick Select
                      </label> */}
                      <div className="relative">
                        <select
                          value={quickFilter}
                          onChange={(e) =>
                            handleQuickFilterChange(e.target.value)
                          }
                          className="w-full py-1.5 px-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#25689f] focus:border-[#25689f] text-xs appearance-none bg-white cursor-pointer"
                        >
                          {quickFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2 top-2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                    {/* DateTime Row */}
                    <div className="flex mb-2 gap-2 w-full">
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🕐 From
                        </label>
                        <input
                          type="datetime-local"
                          value={`${fromDate}T${fromTime}`}
                          onChange={(e) => {
                            const [date, time] = e.target.value.split("T");
                            // If new fromDate > toDate, adjust toDate
                            let newFrom = date;
                            let newFromTime = time;
                            let to = toDate;
                            let toT = toTime;
                            const fromDT = new Date(`${date}T${time}`);
                            const toDT = new Date(`${to}T${toT}`);
                            if (fromDT > toDT) {
                              to = date;
                              toT = time;
                            }
                            // Enforce 7-day max
                            const maxToDT = new Date(
                              fromDT.getTime() + 7 * 24 * 60 * 60 * 1000
                            );
                            if (toDT > maxToDT) {
                              to = maxToDT.toISOString().slice(0, 10);
                              toT = maxToDT.toTimeString().slice(0, 5);
                              toast.error(
                                "You can only select up to 7 days. 'To' date adjusted."
                              );
                            }
                            setFromDate(newFrom);
                            setFromTime(newFromTime);
                            setToDate(to);
                            setToTime(toT);
                          }}
                          className="w-full py-1 px-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#25689f] focus:border-[#25689f] text-xs box-border"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          🕐 To
                        </label>
                        <input
                          type="datetime-local"
                          value={`${toDate}T${toTime}`}
                          onChange={(e) => {
                            const [date, time] = e.target.value.split("T");
                            // If new toDate < fromDate, adjust fromDate
                            let newTo = date;
                            let newToTime = time;
                            let from = fromDate;
                            let fromT = fromTime;
                            const toDT = new Date(`${date}T${time}`);
                            const fromDT = new Date(`${from}T${fromT}`);
                            if (toDT < fromDT) {
                              from = date;
                              fromT = time;
                            }
                            // Enforce 7-day max
                            const maxFromDT = new Date(
                              toDT.getTime() - 7 * 24 * 60 * 60 * 1000
                            );
                            if (fromDT < maxFromDT) {
                              from = maxFromDT.toISOString().slice(0, 10);
                              fromT = maxFromDT.toTimeString().slice(0, 5);
                              toast.error(
                                "You can only select up to 7 days. 'From' date adjusted."
                              );
                            }
                            setToDate(newTo);
                            setToTime(newToTime);
                            setFromDate(from);
                            setFromTime(fromT);
                          }}
                          className="w-full py-1 px-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#25689f] focus:border-[#25689f] text-xs box-border"
                        />
                      </div>
                    </div>
                    {/* Get Button */}
                    <button
                      onClick={handleGetReplay}
                      disabled={!selectedVehicle || replayLoading}
                      className={`w-full py-2 rounded font-medium text-xs transition-all duration-200 cursor-pointer ${
                        selectedVehicle && !replayLoading
                          ? "bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white hover:from-[#1F557F] hover:to-[#184567] shadow-md hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {replayLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Loading...
                        </span>
                      ) : selectedVehicle ? (
                        <span className="flex items-center justify-center">
                          <Play size={14} className="mr-1" />
                          Get Replay Data
                        </span>
                      ) : (
                        "Select Vehicle First"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <ReplayDetailsTab
                  replayLoading={replayLoading}
                  replayData={replayData}
                />
              )}

              {/* Trips Tab */}
              {activeTab === "trips" && (
                <ReplayTripsTab selectedVehicle={selectedVehicle} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReplaySidebar;
