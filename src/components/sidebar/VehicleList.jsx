import React, { useState, memo, useCallback } from "react";
import {
  Car,
  ChevronDown,
  MapPin,
  Clock,
  Gauge,
  MoreVertical,
  Battery,
  Wifi,
} from "lucide-react";
import "../../styles/performance.css";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCarData,
  selectSelectedVehicles,
} from "../../features/gpsTrackingSlice";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";
import { useEffect, useRef } from "react";

const VehicleList = memo(() => {
  const [sortOption, setSortOption] = useState("nameAZ");
  const carData = useSelector(selectCarData) || [];
  const selectedVehiclesFromSlice = useSelector(selectSelectedVehicles);

  

  // --- Redux-based Persistent Vehicle Data Management ---
  // Use global reference to ensure data persistence across tab switches
  const vehicleMapRef = useRef(window.__PERSISTENT_VEHICLE_MAP || new Map());
  const [mergedCarData, setMergedCarData] = useState([]);
  // Separate state for filtered data based on selection
  const [filteredVehicleData, setFilteredVehicleData] = useState([]);

  // Make sure reference is saved globally to persist across component unmounts
  useEffect(() => {
    // Create global reference if it doesn't exist
    if (!window.__PERSISTENT_VEHICLE_MAP) {
      window.__PERSISTENT_VEHICLE_MAP = vehicleMapRef.current;
    }

    // Initialize with data if available
    if (window.__PERSISTENT_VEHICLE_MAP.size > 0) {
      setMergedCarData(Array.from(window.__PERSISTENT_VEHICLE_MAP.values()));
    }
  }, []);

  // When new data comes from socket, merge with existing data
  useEffect(() => {
    if (!Array.isArray(carData)) return;

    // Skip if empty data and we already have vehicles
    if (carData.length === 0 && vehicleMapRef.current.size > 0) return;

    let updatedCount = 0;
    let newCount = 0;
    let updatedCarIds = new Set();

    // Update map with new data
    carData.forEach((car) => {
      if (car && car.car_id) {
        const carId = String(car.car_id);
        const isNew = !vehicleMapRef.current.has(carId);

        if (isNew) newCount++;
        else updatedCount++;

        updatedCarIds.add(carId); // Track which cars were updated
        vehicleMapRef.current.set(carId, car);
      }
    });

    // Update global reference for persistence
    window.__PERSISTENT_VEHICLE_MAP = vehicleMapRef.current;

    // Only update state if we have changes or it's the first load
    if (updatedCount > 0 || newCount > 0 || mergedCarData.length === 0) {
      const updatedVehicles = Array.from(vehicleMapRef.current.values());
      setMergedCarData(updatedVehicles);
      
      // Also update filtered data if we're filtering by selection
      if (Array.isArray(selectedVehiclesFromSlice) && selectedVehiclesFromSlice.length > 0) {
        const selectedIdsSet = new Set(selectedVehiclesFromSlice.map(id => String(id)));
        
        // Update filtered data by mapping existing filtered data to updated versions
        setFilteredVehicleData(current => {
          // If filtered data exists, update each car with its new version
          if (current && current.length > 0) {
            return current.map(vehicle => {
              if (vehicle && vehicle.car_id && updatedCarIds.has(String(vehicle.car_id))) {
                // Replace with updated vehicle data
                return vehicleMapRef.current.get(String(vehicle.car_id));
              }
              return vehicle;
            });
          } 
          // Otherwise, create freshly filtered data from the map
          else {
            return Array.from(vehicleMapRef.current.values())
              .filter(car => car && car.car_id && selectedIdsSet.has(String(car.car_id)));
          }
        });
      }
      // If not filtering, filtered data is the same as merged data
      else if (!Array.isArray(selectedVehiclesFromSlice) || selectedVehiclesFromSlice.length === 0) {
        setFilteredVehicleData(selectedVehiclesFromSlice?.length === 0 ? [] : updatedVehicles);
      }
    }
  }, [carData, selectedVehiclesFromSlice]);

  // Handle filtering based on selected vehicles from redux
  useEffect(() => {

    
    // Check if selectedVehiclesFromSlice exists and is an array
    if (Array.isArray(selectedVehiclesFromSlice)) {
      // If we have selected vehicles, filter our data to show only those
      if (selectedVehiclesFromSlice.length > 0) {
        // Convert selectedVehiclesFromSlice to a Set for O(1) lookups
        const selectedIdsSet = new Set(
          selectedVehiclesFromSlice.map((id) => String(id))
        );

        // Get all vehicles that match the selected IDs
        const filteredVehicles = Array.from(vehicleMapRef.current.values())
          .filter(car => car && car.car_id && selectedIdsSet.has(String(car.car_id)));

 
        
        // Update filtered state only - keep raw data intact
        setFilteredVehicleData(filteredVehicles);
      }
      // If array is empty, clear filtered data and show nothing
      else {
        setFilteredVehicleData([]);
      }
    }
    // If selectedVehiclesFromSlice is not properly defined (null or undefined)
    else if (vehicleMapRef.current.size > 0) {
      setFilteredVehicleData(Array.from(vehicleMapRef.current.values()));
    }
  }, [selectedVehiclesFromSlice]);
  // Sort options
  const sortOptions = [
    { value: "nameAZ", label: "Sort A to Z" },
    { value: "driver", label: "Sort by Driver" },
    { value: "group", label: "Sort by Group" },
    { value: "status", label: "Sort by Status" },
    { value: "lastUpdate", label: "Sort by Last Update" },
  ];

  // Sort vehicles based on selected option (now on filteredVehicleData)
  const sortedVehicles = React.useMemo(() => {
    // Use filteredVehicleData instead of mergedCarData for display
    if (!filteredVehicleData || filteredVehicleData.length === 0) return [];
    let sorted = [...filteredVehicleData];
    switch (sortOption) {
      case "nameAZ":
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "driver":
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "group":
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case "status":
        sorted.sort((a, b) => {
          const statusA = (a.movingstatus || "").toLowerCase();
          const statusB = (b.movingstatus || "").toLowerCase();
          const statusPriority = { moving: 1, idle: 2, stop: 3 };
          const priorityA = statusPriority[statusA] || 4;
          const priorityB = statusPriority[statusB] || 4;
          return priorityA - priorityB;
        });
        break;
      case "lastUpdate":
        sorted.sort((a, b) => {
          const timeA = new Date(a.gps_time || 0);
          const timeB = new Date(b.gps_time || 0);
          return timeB - timeA;
        });
        break;
      default:
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }
    return sorted;
  }, [filteredVehicleData, sortOption]);

  // --- Virtual Scrolling Logic ---
  const ROW_HEIGHT = 165; // px, adjust to match card height
  const BUFFER_SIZE = 3;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  const visibleRows = React.useMemo(() => {
    const total = sortedVehicles.length;
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_SIZE,
      total
    );
    const actualStartIndex = Math.max(0, startIndex - BUFFER_SIZE);
    return {
      startIndex: actualStartIndex,
      endIndex,
      visibleData: sortedVehicles.slice(actualStartIndex, endIndex),
      offsetY: actualStartIndex * ROW_HEIGHT,
      total,
    };
  }, [sortedVehicles, scrollTop, containerHeight]);

  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);

  // For expanded state per vehicle
  const [expandedMap, setExpandedMap] = useState({});
  const dispatch = useDispatch();
  const selectedVehicleId = useSelector(
    (state) => state.mapInteraction.selectedVehicleId
  );

  // Helper functions from VehicleCard
  const getStatusColor = (status) => {
    if (!status) return "bg-blue-500";
    switch (status.toLowerCase()) {
      case "moving":
      case "run":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "stop":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };
  const getVehicleIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "moving":
        return movingIcon;
      case "idle":
        return idleIcon;
      case "stop":
      default:
        return stoppedIcon;
    }
  };
  const formatDateTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const date = new Date(timeString);
      const formattedDate = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      const formattedTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formattedDate}, ${formattedTime}`;
    } catch (e) {
      return "N/A";
    }
  };
  const getSignalStrengthIcon = (strength) => {
    const signalValue = parseInt(strength) || 0;
    if (signalValue >= 5) return "text-green-500";
    if (signalValue >= 3) return "text-yellow-500";
    return "text-red-500";
  };
  const formatVoltage = (voltage) => {
    if (voltage === null || voltage === undefined) return "N/A";
    if (typeof voltage === "string" && voltage.includes(",")) {
      const parts = voltage.split(",");
      return (
        (parts[1]
          ? parseFloat(parts[1]).toFixed(2)
          : parseFloat(parts[0]).toFixed(2)) + " V"
      );
    }
    if (voltage !== "N/A") {
      return parseFloat(voltage).toFixed(2) + " V";
    }
    return "N/A";
  };

  // Card click handler
  const handleCardClick = (car, expanded) => {
    if (!expanded) {
      dispatch(setSelectedVehicle(car.car_id));
    }
  };
  // Expand/collapse handler
  const handleExpandToggle = (e, car_id) => {
    e.stopPropagation();
    setExpandedMap((prev) => ({ ...prev, [car_id]: !prev[car_id] }));
  };

  return (
    <div className="px-2 py-3 transition-opacity duration-300 opacity-100 h-full flex flex-col">
      <div className="font-bold mb-3 text-dark flex items-center justify-between">
        <span className="transition-all duration-300 transform translate-x-0 opacity-100">
          Vehicles
        </span>
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full transition-transform duration-300 transform scale-100">
          {sortedVehicles.length}
        </span>
      </div>

      {/* Sort Dropdown */}
      <div className="relative mb-3 transition-all duration-200 transform translate-y-0 opacity-100">
        <div className="relative">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="w-full p-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white appearance-none cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Vehicle List - Virtual Scrolling */}
      <div
        className="flex-1 overflow-y-auto relative"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ willChange: "transform" }}
      >
        <div
          style={{
            height: visibleRows.total * ROW_HEIGHT,
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateY(${visibleRows.offsetY}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleRows.visibleData.length > 0 ? (
              <div className="space-y-2.5">
                {visibleRows.visibleData.map((car, index) => {
                  const isSelected = selectedVehicleId === car.car_id;
                  const expanded = expandedMap[car.car_id] || false;
                  const stableCarData = {
                    car_id: car.car_id,
                    carname: car.carname,
                    movingstatus: car.movingstatus,
                    location: car.location,
                    speed: car.speed,
                    gps_time: car.gps_time,
                    head: car.head,
                    signalstrength: car.signalstrength,
                    mileage: car.mileage,
                    voltage: car.voltage,
                    engine: car.engine,
                  };
                  return (
                    <React.Fragment key={car.car_id || index}>
                      <div
                        className={`vehicle-card-container relative border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-300 bg-white hover:border-blue-300"
                        }`}
                        onClick={() => handleCardClick(stableCarData, expanded)}
                        style={{
                          marginBottom: "10px",
                          height: ROW_HEIGHT - 10,
                          minHeight: "155px",
                        }}
                      >
                        <div className="p-4">
                          {/* Header with vehicle name and status */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="mr-3 flex-shrink-0">
                                <img
                                  src={getVehicleIcon(
                                    stableCarData.movingstatus
                                  )}
                                  alt="Vehicle"
                                  className="w-5 h-5 transition-transform duration-200"
                                  style={
                                    stableCarData.movingstatus?.toLowerCase() ===
                                    "moving"
                                      ? {
                                          transform: `rotate(${
                                            (stableCarData.head || 0) - 140
                                          }deg)`,
                                        }
                                      : {}
                                  }
                                />
                              </div>
                              <div className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">
                                {stableCarData.carname ||
                                  `Vehicle ${stableCarData.car_id}`}
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div
                                className={`px-2 py-0.4 rounded-full text-white text-xs mr-2 ${getStatusColor(
                                  stableCarData.movingstatus
                                )}`}
                              >
                                {stableCarData.movingstatus || "Unknown"}
                              </div>
                              {/* 3-dot menu button: expands card */}
                              <button
                                onClick={(e) =>
                                  handleExpandToggle(e, stableCarData.car_id)
                                }
                                className="menu-button p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                title="Show Options"
                                type="button"
                              >
                                <MoreVertical
                                  size={14}
                                  className="text-gray-600"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex mb-2.5 text-xs text-gray-800">
                            <MapPin
                              size={14}
                              className="mr-2 flex-shrink-0 mt-0.5"
                            />
                            <div className="line-clamp-2 leading-tight">
                              {stableCarData.location || "Unknown location"}
                            </div>
                          </div>

                          {/* Speed and Time */}
                          <div className="flex items-center justify-between text-xs text-gray-800 mb-2">
                            <div className="flex items-center">
                              <Gauge size={14} className="mr-2 flex-shrink-0" />
                              <span>{stableCarData.speed || "0"} km/h</span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-2 flex-shrink-0" />
                              <span>
                                {formatDateTime(stableCarData.gps_time)}
                              </span>
                            </div>
                          </div>

                          {/* New fields: Signal Strength, Mileage, Voltage */}
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-800 border-t border-gray-100 pt-2">
                            {/* Signal Strength */}
                            <div className="flex items-center">
                              <Wifi
                                size={14}
                                className={`mr-1.5 flex-shrink-0 ${getSignalStrengthIcon(
                                  stableCarData.signalstrength
                                )}`}
                              />
                              <span title="Signal Strength">
                                {stableCarData.signalstrength || "0"}
                              </span>
                            </div>
                            {/* Duration */}
                            <div className="flex items-center">
                              <Clock
                                size={14}
                                className="mr-1.5 flex-shrink-0 text-blue-500"
                              />
                              <span title="Duration">
                                {car.duration && car.duration !== "N/A"
                                  ? car.duration
                                  : "-"}
                              </span>
                            </div>
                            {/* Voltage */}
                            <div className="flex items-center">
                              <Battery
                                size={14}
                                className="mr-1.5 flex-shrink-0 text-green-500"
                              />
                              <span title="Battery Voltage">
                                {formatVoltage(stableCarData.voltage)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Expanded options inside card */}
                      {expanded && (
                        <div className="mt-3 border-t pt-2 bg-blue-50 border-blue-200 shadow-lg rounded-b-xl animate-fadeIn">
                          <ul className="space-y-1">
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                Vehicle Info
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                Driver Info
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                Vehicle Dispatch
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                Replay
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                Service Info
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-sm text-gray-900 font-medium transition-colors cursor-pointer focus:outline-none focus:bg-blue-200">
                                History Report
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center transition-opacity duration-500 opacity-100">
                <div className="transition-transform duration-500 transform scale-100">
                  <Car size={40} className="text-gray-300 mb-3" />
                </div>
                <div className="text-gray-500 mb-2 transition-all duration-300 transform translate-y-0 opacity-100">
                  No vehicle data available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default VehicleList;
