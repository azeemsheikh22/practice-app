import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronUp,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
  SearchX,
  Search,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { selectCarData, selectSelectedVehicles } from "../../features/gpsTrackingSlice";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";

const MapDataTable = ({ isOpen, onToggle, sidebarWidth = 346 }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);

  // ✅ VIRTUAL SCROLLING STATE
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const scrollContainerRef = useRef(null);
  const selectedVehiclesFromSlice = useSelector(selectSelectedVehicles);

  // ✅ Column visibility state
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    status: true,
    location: true,
    lastUpdate: true,
    speed: true,
    mileage: true,
    signalStrength: true,
    latitude: true,
    longitude: true,
    acc: true,
    engine: true,
    head: true,
    terminalKey: true,
    voltage: true,
    duration: true,
    trend: true,
  });

  const dispatch = useDispatch();
  const carData = useSelector(selectCarData) || [];
  const [mergedCarData, setMergedCarData] = useState([]);
  const prevCarDataRef = useRef([]);

  useEffect(() => {
    if (!Array.isArray(carData) || carData.length === 0) return;
    // Build a map of incoming vehicles by car_id
    const incomingMap = new Map();
    carData.forEach((car) => {
      if (car && car.car_id) incomingMap.set(String(car.car_id), car);
    });
    // Build a map of previous vehicles by car_id
    const prevMap = new Map();
    prevCarDataRef.current.forEach((car) => {
      if (car && car.car_id) prevMap.set(String(car.car_id), car);
    });
    // Update or keep previous vehicles
    incomingMap.forEach((car, car_id) => {
      prevMap.set(car_id, car);
    });
    const mergedArr = Array.from(prevMap.values());
    setMergedCarData(mergedArr);
    prevCarDataRef.current = mergedArr;
  }, [carData]);

  // On first mount, initialize mergedCarData if carData is present
  useEffect(() => {
    if (mergedCarData.length === 0 && carData.length > 0) {
      setMergedCarData(carData);
      prevCarDataRef.current = carData;
    }
  }, []);

  // ✅ Column definitions
  const columnDefinitions = [
    { key: "name", label: "Vehicle", width: "140px", isSticky: true },
    { key: "status", label: "Status", width: "100px" },
    { key: "duration", label: "Duration", width: "100px" },
    { key: "location", label: "Location", width: "250px" },
    { key: "lastUpdate", label: "Last Update", width: "160px" },
    { key: "speed", label: "Speed", width: "80px" },
    { key: "mileage", label: "Mileage", width: "90px" },
    { key: "signalStrength", label: "Signal", width: "80px" },
    { key: "latitude", label: "Latitude", width: "100px" },
    { key: "longitude", label: "Longitude", width: "100px" },
    { key: "acc", label: "ACC", width: "60px" },
    { key: "engine", label: "Engine", width: "70px" },
    { key: "head", label: "Direction", width: "80px" },
    { key: "terminalKey", label: "Unit ID", width: "120px" },
    { key: "voltage", label: "Voltage", width: "80px" },
    { key: "trend", label: "Movement Trend", width: "100px" },
  ];

  // ✅ VIRTUAL SCROLLING CONSTANTS
  const ROW_HEIGHT = 48;
  const BUFFER_SIZE = 5; // Extra rows to render for smooth scrolling

  // ✅ Toggle functions
  const toggleColumnVisibility = useCallback((columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  const toggleAllColumns = useCallback(() => {
    const allVisible = Object.values(visibleColumns).every(
      (visible) => visible
    );
    const newState = {};
    Object.keys(visibleColumns).forEach((key) => {
      newState[key] = !allVisible;
    });
    setVisibleColumns(newState);
  }, [visibleColumns]);

  // ✅ Location Display Component
  const LocationDisplay = ({ location, status }) => {
    const [showFull, setShowFull] = useState(false);
    const maxLength = 25;

    if (!location || location.length <= maxLength) {
      return (
        <span
          className={`text-xs ${
            status === "Moving"
              ? "text-[#00C951]"
              : status === "Stop"
              ? "text-[#FB2C36]"
              : status === "Idle"
              ? "text-[#F0B100]"
              : "text-gray-500"
          }`}
          title={location}
        >
          {location || "N/A"}
        </span>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <span
          className={`text-xs ${
            status === "Moving"
              ? "text-[#00C951]"
              : status === "Stop"
              ? "text-[#FB2C36]"
              : status === "Idle"
              ? "text-[#F0B100]"
              : "text-gray-500"
          } cursor-pointer`}
          title={location}
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? location : `${location.substring(0, maxLength)}...`}
        </span>
        <button
          onClick={() => setShowFull(!showFull)}
          className={`text-xs ${
            status === "Moving"
              ? "text-[#00C951]"
              : status === "Stop"
              ? "text-[#FB2C36]"
              : status === "Idle"
              ? "text-[#F0B100]"
              : "text-gray-500"
          } font-medium flex-shrink-0`}
        >
          {showFull ? "Less" : "More"}
        </button>
      </div>
    );
  };

  // ✅ Data transformation
  const transformedData = useMemo(() => {
    // Only show vehicles whose car_id is in selectedVehiclesFromSlice
    const selectedSet = new Set((selectedVehiclesFromSlice || []).map(String));
    return mergedCarData
      .filter(car => car && car.car_id && selectedSet.has(String(car.car_id)))
      .map((car, index) => ({
        id: car?.car_id ?? index + 1,
        name: car?.carname ?? `Vehicle ${car?.car_id ?? index + 1}`,
        status: car?.movingstatus ?? "Unknown",
        location: car?.location ?? "Unknown",
        lastUpdate: car?.gps_time
          ? new Date(car.gps_time).toLocaleString()
          : "N/A",
        speed: typeof car?.speed === "number" ? `${car.speed} km/h` : "0 km/h",
        mileage: typeof car?.mileage === "number" ? `${car.mileage} km` : "N/A",
        signalStrength: car?.signalstrength ?? "N/A",
        latitude: car?.latitude ?? "N/A",
        longitude: car?.longitude ?? "N/A",
        acc:
          typeof car?.acc === "number" ? (car.acc === 1 ? "On" : "Off") : "N/A",
        engine: car?.engine === "1" ? "On" : car?.engine === "0" ? "Off" : "N/A",
        head: car?.head ?? "N/A",
        terminalKey: car?.terminalkey ?? "N/A",
        voltage: car?.voltage ?? "N/A",
        duration: car?.duration ?? "N/A",
        trend: car?.trend ?? "N/A",
        originalData: car,
      }));
  }, [mergedCarData, selectedVehiclesFromSlice]);

  // ✅ Filtering and sorting
  const sortedData = useMemo(() => {
    let filtered = transformedData.filter((row) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return Object.values(row).some(
        (value) =>
          value !== undefined &&
          value !== null &&
          value.toString().toLowerCase().includes(term)
      );
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        return sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
    }

    return filtered;
  }, [transformedData, searchTerm, sortField, sortDirection]);

  // ✅ VIRTUAL SCROLLING CALCULATIONS
  const visibleRows = useMemo(() => {
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_SIZE,
      sortedData.length
    );

    const actualStartIndex = Math.max(0, startIndex - BUFFER_SIZE);

    return {
      startIndex: actualStartIndex,
      endIndex,
      visibleData: sortedData.slice(actualStartIndex, endIndex),
      offsetY: actualStartIndex * ROW_HEIGHT,
    };
  }, [scrollTop, containerHeight, sortedData]);

  // ✅ Scroll handler
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // ✅ Container height effect
  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isFullyOpen]);

  // ✅ Event handlers
  const handleRowClick = useCallback(
    (row, event) => {
      if (event.target.tagName === "BUTTON" || event.target.closest("button")) {
        return;
      }

      if (selectedRowId === row.id) {
        setSelectedRowId(null);
        dispatch(setSelectedVehicle(null));
      } else {
        setSelectedRowId(row.id);
        dispatch(setSelectedVehicle(row.id));
      }
    },
    [selectedRowId, dispatch]
  );

  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const getStatusColor = useCallback((status) => {
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
  }, []);

  const getRowBackgroundColor = useCallback(
    (status, rowId) => {
      if (selectedRowId === rowId) {
        return "bg-blue-100 border-l-4 border-blue-500";
      }

      switch (status.toLowerCase()) {
        case "moving":
        case "run":
          return "bg-white";
        case "idle":
          return "bg-white";
        case "stop":
          return "bg-white";
        case "offline":
          return "bg-white";
        default:
          return "";
      }
    },
    [selectedRowId]
  );

  const toggleFullOpen = () => setIsFullyOpen(!isFullyOpen);

  const closeTable = (e) => {
    e.stopPropagation();
    setIsFullyOpen(false);
    onToggle();
  };

  // ✅ Render table cell
  const renderTableCell = useCallback(
    (row, columnKey, style = {}) => {
      if (!visibleColumns[columnKey]) return null;

      const cellContent = {
        name: (
          <td
            className="px-3 py-2 text-xs font-medium text-gray-900 bg-white sticky left-0 z-10 shadow-md truncate"
            style={style}
          >
            {row.name}
          </td>
        ),
        status: (
          <td className="px-3 py-2 whitespace-nowrap" style={style}>
            <span
              className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(
                row.status
              )} text-white`}
            >
              {row.status}
            </span>
          </td>
        ),
        location: (
          <td className="px-3 py-2 text-xs text-gray-500" style={style}>
            <div className="w-full overflow-hidden">
              <LocationDisplay location={row.location} status={row?.status} />
            </div>
          </td>
        ),
        lastUpdate: (
          <td
            className={`px-3 py-2 text-xs ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            } truncate`}
            style={style}
          >
            {row.lastUpdate}
          </td>
        ),
        speed: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.speed}
          </td>
        ),
        mileage: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.mileage}
          </td>
        ),
        signalStrength: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.signalStrength}
          </td>
        ),
        latitude: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            } truncate`}
            style={style}
          >
            {row.latitude}
          </td>
        ),
        longitude: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            } truncate`}
            style={style}
          >
            {row.longitude}
          </td>
        ),
        acc: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.acc}
          </td>
        ),
        engine: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.engine}
          </td>
        ),
        head: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.head}
          </td>
        ),
        terminalKey: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            } truncate`}
            style={style}
          >
            {row.terminalKey}
          </td>
        ),
        voltage: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs  ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.voltage}
          </td>
        ),
        duration: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.duration}
          </td>
        ),
        trend: (
          <td
            className={`px-3 py-2 whitespace-nowrap text-xs ${
              row?.status === "Moving"
                ? "text-[#00C951]"
                : row?.status === "Stop"
                ? "text-[#FB2C36]"
                : row?.status === "Idle"
                ? "text-[#F0B100]"
                : "text-gray-500"
            }`}
            style={style}
          >
            {row.trend && row.trend !== "N/A" ? row.trend : "-"}
          </td>
        ),
      };

      return cellContent[columnKey];
    },
    [visibleColumns, getStatusColor]
  );

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ease-in-out z-[720] 
        ${
          isOpen ? (isFullyOpen ? "h-[75vh]" : "h-[45vh]") : "h-0"
        } bg-transparent`}
    >
      <div className="h-full flex bg-transparent">
        <div
          className="hidden xl:block bg-transparent"
          style={{ width: `${sidebarWidth}px` }}
        ></div>

        <div
          className={`flex-grow bg-white w-[58%] overflow-hidden border-t border-none transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {isOpen && (
            <div className="flex flex-col bg-white border-b border-gray-200">
              {/* ✅ Header */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark text-sm">
                    Vehicle Data
                  </span>
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {sortedData.length}
                  </span>
                  {sortedData.length !== transformedData.length && (
                    <span className="text-xs text-gray-500">
                      of {transformedData.length}
                    </span>
                  )}
                </div>

                <div className="flex-grow mx-4 hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-8 pr-3 py-1 border border-gray-200 rounded-md text-xs placeholder-gray-400 focus:outline-none"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTerm("")}
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* ✅ Column Settings Dropdown */}
                  <div className="relative">
                    <button
                      className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors duration-200 flex items-center gap-1"
                      title="Column Settings"
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    >
                      <Settings size={14} className="text-gray-600" />
                    </button>

                    {/* ✅ Column Visibility Dropdown */}
                    {showColumnDropdown && (
                      <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              Show Columns
                            </h3>
                            <button
                              onClick={toggleAllColumns}
                              className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              {Object.values(visibleColumns).every((v) => v)
                                ? "Hide All"
                                : "Show All"}
                            </button>
                          </div>
                        </div>

                        <div className="p-2 space-y-1">
                          {columnDefinitions.map((column, index) => (
                            <label
                              key={index}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns[column.key]}
                                onChange={() =>
                                  toggleColumnVisibility(column.key)
                                }
                                className="w-4 h-4 text-primary border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                {visibleColumns[column.key] ? (
                                  <Eye
                                    size={12}
                                    className="mr-1 text-green-500"
                                  />
                                ) : (
                                  <EyeOff
                                    size={12}
                                    className="mr-1 text-gray-400"
                                  />
                                )}
                                {column.label}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="p-2 border-t border-gray-100 text-xs text-gray-500">
                          {
                            Object.values(visibleColumns).filter((v) => v)
                              .length
                          }{" "}
                          of {columnDefinitions.length} columns visible
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors duration-200"
                    title={isFullyOpen ? "Minimize" : "Maximize"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullOpen();
                    }}
                  >
                    {isFullyOpen ? (
                      <Minimize2 size={14} className="text-gray-600" />
                    ) : (
                      <Maximize2 size={14} className="text-gray-600" />
                    )}
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 cursor-pointer rounded-full transition-colors duration-200"
                    title="Close"
                    onClick={closeTable}
                  >
                    <X size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Mobile search */}
              <div className="px-3 py-1 md:hidden">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ OPTIMIZED: Virtual Scrolling Table */}
          <div
            ref={scrollContainerRef}
            className={`overflow-auto relative ${
              isFullyOpen ? "h-[calc(86vh-120px)]" : "h-[calc(57vh-120px)]"
            }`}
            style={{
              willChange: "transform",
              scrollbarWidth: "thin",
            }}
            onScroll={handleScroll}
            onClick={() => setShowColumnDropdown(false)}
          >
            {sortedData.length > 0 ? (
              <div style={{ position: "relative" }}>
                {/* ✅ STICKY HEADER */}
                <table className="w-full min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      {columnDefinitions.map((column, index) => {
                        if (!visibleColumns[column.key]) return null;

                        return (
                          <th
                            key={index}
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap bg-gray-50 ${
                              column.isSticky
                                ? "sticky left-0 z-30 shadow-md"
                                : ""
                            }`}
                            style={{
                              width: column.width,
                              minWidth: column.width,
                            }}
                            onClick={() => handleSort(column.key)}
                          >
                            <div className="flex items-center">
                              {column.label}
                              {sortField === column.key &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp size={14} className="ml-1" />
                                ) : (
                                  <ChevronDown size={14} className="ml-1" />
                                ))}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                </table>

                {/* ✅ VIRTUAL SCROLLING BODY */}
                <div
                  style={{
                    height: sortedData.length * ROW_HEIGHT,
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
                    <table className="w-full min-w-full table-fixed">
                      <tbody className="bg-white divide-y divide-gray-200">
                        {visibleRows.visibleData.map((row, index) => (
                          <tr
                            key={index}
                            className={`cursor-pointer transition-colors duration-200 ${getRowBackgroundColor(
                              row.status,
                              row.id
                            )} `}
                            style={{ height: ROW_HEIGHT }}
                            onClick={(e) => handleRowClick(row, e)}
                            title="Click to select and zoom to vehicle"
                          >
                            {columnDefinitions.map(
                              (column, colIndex) =>
                                renderTableCell(row, column.key, {
                                  width: column.width,
                                }) &&
                                React.cloneElement(
                                  renderTableCell(row, column.key, {
                                    width: column.width,
                                  }),
                                  { key: `${row.id}-${column.key}` }
                                )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <SearchX size={40} className="text-gray-300 mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "No vehicles found"
                    : "No vehicle data available"}
                </h3>
                <p className="text-gray-500 text-center max-w-md text-sm">
                  {searchTerm
                    ? `No vehicles match "${searchTerm}". Try adjusting your search.`
                    : "Vehicle data will appear here when available."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-3 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDataTable;
