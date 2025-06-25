import { useState, useMemo, useEffect } from "react";
import {
  Play,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  Menu,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import ReplayTreeView from "./ReplayTreeView";

const ReplaySidebar = ({ isExpanded, onToggleExpand }) => {
  const [activeTab, setActiveTab] = useState("selection");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Date/Time filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [quickFilter, setQuickFilter] = useState("today");

  // Redux data
  const dispatch = useDispatch();
  const rawVehicles = useSelector((state) => state.gpsTracking.rawVehicleList);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setFromDate(todayStr);
    setToDate(todayStr);
  }, []);

  // Existing useEffect ko replace karein
  useEffect(() => {
    if (rawVehicles.length > 0) {
      // Always keep Entire Fleet open
      const entireFleetGroup = rawVehicles.find(
        (item) => item.text === "Entire Fleet" && item.Type === "Group"
      );

      let newExpandedGroups = {};

      if (entireFleetGroup) {
        newExpandedGroups[entireFleetGroup.id] = true;
      }

      // If searching, expand groups containing matching vehicles
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

      setExpandedGroups((prev) => ({
        ...prev,
        ...newExpandedGroups,
      }));
    }
  }, [searchQuery, rawVehicles]);

  // Quick filter options
  const quickFilterOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last24hours", label: "Last 24 Hours" },
    { value: "thisweek", label: "This Week" },
    { value: "thismonth", label: "This Month" },
    { value: "lastmonth", label: "Last Month" },
  ];

  // Update toggle function
  const handleToggleExpand = () => {
    onToggleExpand(!isExpanded);
  };

  // Handle quick filter change
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

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Ye function add karein (existing code ke saath)
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

  // Handle group toggle
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Handle Get button click
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
    // Here you would dispatch an action to get replay data
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative top-0 left-0 h-[92vh] overflow-y-auto bg-white border-r border-gray-300 z-40 transition-all duration-300 ease-in-out flex flex-col
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
        ${isExpanded ? "w-full" : "w-16"}
        `}
      >
        {/* Header - Fixed */}
        {isExpanded && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D52B1E] rounded-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                {isExpanded && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    Replay Track
                  </h2>
                )}
              </div>

              {/* Expand/Collapse Button - Only show when expanded */}
              {isExpanded && (
                <button
                  onClick={handleToggleExpand}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Minimize2 size={18} className="text-gray-600" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Collapsed State - Icon with Expand Button */}
        {!isExpanded && (
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Replay Icon */}
            <div className="p-3 bg-[#D52B1E] rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>

            {/* Expand Button */}
            <button
              onClick={handleToggleExpand}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Expand Sidebar"
            >
              <Maximize2 size={18} className="text-gray-600" />
            </button>
          </div>
        )}

        <div>
          {isExpanded && (
            <>
              {/* Tabs - Fixed */}
              <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
                {[
                  { id: "selection", label: "Selection" },
                  { id: "details", label: "Details" },
                  { id: "trips", label: "Trips" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-[#D52B1E] border-b-2 border-[#D52B1E] bg-red-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {activeTab === "selection" && (
                  <div className="h-full flex flex-col min-h-0">
                    {/* Search Input - Fixed */}
                    <div className="p-4 border-b border-gray-200 flex-shrink-0">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search vehicle name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] text-sm"
                        />
                        <Search
                          size={18}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Tree View - Scrollable */}
                    <div className="flex-1 overflow-auto  min-h-0">
                      <ReplayTreeView
                        vehicles={rawVehicles}
                        searchQuery={searchQuery}
                        selectedVehicle={selectedVehicle}
                        expandedGroups={expandedGroups}
                        onVehicleSelect={handleVehicleSelect}
                        onToggleGroup={toggleGroup}
                      />
                    </div>

                    {/* Date/Time Filters - Fixed at bottom */}
                    <div className="border-t border-gray-200 p-4 space-y-4 flex-shrink-0 bg-white">
                      {/* Quick Filter Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quick Select
                        </label>
                        <div className="relative">
                          <select
                            value={quickFilter}
                            onChange={(e) =>
                              handleQuickFilterChange(e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] text-sm appearance-none bg-white"
                          >
                            {quickFilterOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* From DateTime Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Date & Time
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={`${fromDate}T${fromTime}`}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split("T");
                              setFromDate(date);
                              setFromTime(time);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] text-sm"
                          />

                        </div>
                      </div>

                      {/* To DateTime Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To Date & Time
                        </label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={`${toDate}T${toTime}`}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split("T");
                              setToDate(date);
                              setToTime(time);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] text-sm"
                          />
             
                        </div>
                      </div>

                      {/* Get Button */}
                      <button
                        onClick={handleGetReplay}
                        disabled={!selectedVehicle}
                        className={`w-full py-3 px-4 mb-7 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedVehicle
                            ? "bg-[#D52B1E] text-white hover:bg-red-700 active:scale-95"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {selectedVehicle
                          ? "Get Replay Data"
                          : "Select Vehicle First"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="flex-1 overflow-auto p-4">
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-lg font-medium mb-2">
                        Vehicle Details
                      </div>
                      <div className="text-sm">
                        {selectedVehicle
                          ? `Details for ${selectedVehicle.text}`
                          : "Select a vehicle to view details"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trips Tab */}
                {activeTab === "trips" && (
                  <div className="flex-1 overflow-auto p-4">
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-lg font-medium mb-2">
                        Trip History
                      </div>
                      <div className="text-sm">
                        {selectedVehicle
                          ? `Trip history for ${selectedVehicle.text}`
                          : "Select a vehicle to view trips"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReplaySidebar;
