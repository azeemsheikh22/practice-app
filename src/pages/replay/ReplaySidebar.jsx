import { useState, useEffect } from "react";
import {
  Play,
  Search,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";
import ReplayTreeView from "./ReplayTreeView";

const ReplaySidebar = ({
  isExpanded,
  onToggleExpand,
  onReplayDataReceived,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const [activeTab, setActiveTab] = useState("selection");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Date/Time filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [quickFilter, setQuickFilter] = useState("today");

  const rawVehicles = useSelector((state) => state.gpsTracking.rawVehicleList);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setFromDate(todayStr);
    setToDate(todayStr);
  }, []);

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
    { value: "last24hours", label: "Last 24 Hours" },
    { value: "thisweek", label: "This Week" },
    { value: "thismonth", label: "This Month" },
    { value: "lastmonth", label: "Last Month" },
  ];

  const handleToggleExpand = () => {
    onToggleExpand(!isExpanded);
  };

  const handleQuickFilterChange = (filterValue) => {
    setQuickFilter(filterValue);
    const today = new Date();

    switch (filterValue) {
      case "today":
        const todayStr = today.toISOString().split("T")[0];
        setFromDate(todayStr);
        setToDate(todayStr);
        setFromTime("00:00");
        setToTime("23:59");
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        setFromDate(yesterdayStr);
        setToDate(yesterdayStr);
        setFromTime("00:00");
        setToTime("23:59");
        break;
      case "last24hours":
        const last24 = new Date(today);
        last24.setHours(last24.getHours() - 24);
        setFromDate(last24.toISOString().split("T")[0]);
        setFromTime(last24.toTimeString().slice(0, 5));
        setToDate(today.toISOString().split("T")[0]);
        setToTime(today.toTimeString().slice(0, 5));
        break;
      case "thisweek":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setFromDate(startOfWeek.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        setFromTime("00:00");
        setToTime("23:59");
        break;
      case "thismonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(startOfMonth.toISOString().split("T")[0]);
        setToDate(today.toISOString().split("T")[0]);
        setFromTime("00:00");
        setToTime("23:59");
        break;
      case "lastmonth":
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        setFromDate(startOfLastMonth.toISOString().split("T")[0]);
        setToDate(endOfLastMonth.toISOString().split("T")[0]);
        setFromTime("00:00");
        setToTime("23:59");
        break;
    }
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
      alert("Please select a vehicle first");
      return;
    }

    const replayData = {
      vehicle: selectedVehicle,
      fromDate,
      toDate,
      fromTime,
      toTime,
      quickFilter,
    };

    console.log("Getting replay data:", replayData);

    if (onReplayDataReceived) {
      onReplayDataReceived([
        {
          latitude: 30.3753,
          longitude: 69.3451,
          timestamp: "2024-01-01T10:00:00Z",
          speed: 45,
        },
        {
          latitude: 30.3853,
          longitude: 69.3551,
          timestamp: "2024-01-01T10:01:00Z",
          speed: 50,
        },
        {
          latitude: 30.3953,
          longitude: 69.3651,
          timestamp: "2024-01-01T10:02:00Z",
          speed: 40,
        },
        {
          latitude: 30.4053,
          longitude: 69.3751,
          timestamp: "2024-01-01T10:03:00Z",
          speed: 35,
        },
        {
          latitude: 30.4153,
          longitude: 69.3851,
          timestamp: "2024-01-01T10:04:00Z",
          speed: 55,
        },
      ]);
    }

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
          fixed inset-y-0 transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-lg overflow-hidden z-[9995]
          ${isMobileMenuOpen ? "left-0 w-[85%] sm:w-[350px]" : "-left-full"}
          lg:static lg:shadow-none lg:z-20
          ${isExpanded ? "lg:w-96" : "lg:w-16"}
        `}
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
                  <p className="text-xs text-gray-600">
                    Vehicle history playback
                  </p>
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

        {/* Content - Only show when expanded or mobile menu open */}
        {(isExpanded || isMobileMenuOpen) && (
          <div className="flex flex-col h-[82vh] overflow-y-scroll">
            {/* Tabs */}
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
                  <span className="mr-2 text-xs">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content Area with Scrolling */}
            <div className="flex-1 flex flex-col">
              {activeTab === "selection" && (
                <div className="flex-1 flex flex-col">
                  {/* Search Input */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search vehicles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] text-sm transition-all duration-200"
                      />
                      <Search
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected Vehicle Info */}
                  {selectedVehicle && (
                    <div className="px-4 py-3 bg-[#25689f]/10 border-b border-[#25689f]/20 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-[#25689f] rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium text-[#1F557F]">
                              Selected Vehicle
                            </p>
                            <p className="text-xs text-[#25689f] truncate max-w-[200px]">
                              {selectedVehicle.text}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedVehicle(null)}
                          className="text-[#25689f] hover:text-[#1F557F] cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tree View with Scrolling */}
                  <div className="flex-1 px-2 py-2">
                    <ReplayTreeView
                      vehicles={rawVehicles}
                      searchQuery={searchQuery}
                      selectedVehicle={selectedVehicle}
                      expandedGroups={expandedGroups}
                      onVehicleSelect={handleVehicleSelect}
                      onToggleGroup={toggleGroup}
                    />
                  </div>

                  {/* Date/Time Filters */}
                  <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50 flex-shrink-0">
                    {/* Quick Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Quick Select
                      </label>
                      <div className="relative">
                        <select
                          value={quickFilter}
                          onChange={(e) =>
                            handleQuickFilterChange(e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] text-sm appearance-none bg-white cursor-pointer transition-all duration-200"
                        >
                          {quickFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* From DateTime */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 From Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={`${fromDate}T${fromTime}`}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split("T");
                          setFromDate(date);
                          setFromTime(time);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] text-sm cursor-pointer transition-all duration-200"
                      />
                    </div>

                    {/* To DateTime */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 To Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={`${toDate}T${toTime}`}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split("T");
                          setToDate(date);
                          setToTime(time);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f] text-sm cursor-pointer transition-all duration-200"
                      />
                    </div>

                    {/* Get Button */}
                    <button
                      onClick={handleGetReplay}
                      disabled={!selectedVehicle}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                        selectedVehicle
                          ? "bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white hover:from-[#1F557F] hover:to-[#184567] shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {selectedVehicle ? (
                        <span className="flex items-center justify-center">
                          <Play size={16} className="mr-2" />
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
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <div className="text-lg font-medium mb-2 text-gray-700">
                      Vehicle Details
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedVehicle
                        ? `Detailed information for ${selectedVehicle.text}`
                        : "Select a vehicle to view detailed information"}
                    </div>
                  </div>
                </div>
              )}

              {/* Trips Tab */}
              {activeTab === "trips" && (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">🛣️</div>
                    <div className="text-lg font-medium mb-2 text-gray-700">
                      Trip History
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedVehicle
                        ? `Trip history and routes for ${selectedVehicle.text}`
                        : "Select a vehicle to view trip history"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReplaySidebar;
