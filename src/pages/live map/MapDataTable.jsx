import React, { useState } from "react";
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
import { selectCarData } from "../../features/gpsTrackingSlice";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";

const MapDataTable = ({ isOpen, onToggle, sidebarWidth = 346 }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);

  // ✅ NEW: Column visibility state
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
  });

  const dispatch = useDispatch();
  const carData = useSelector(selectCarData) || [];

  // ✅ NEW: Column definitions for easy management
  const columnDefinitions = [
    { key: "name", label: "Vehicle", width: "140px", isSticky: true },
    { key: "status", label: "Status", width: "100px" },
    { key: "location", label: "Location", width: "250px" },
    { key: "lastUpdate", label: "Last Update", width: "160px" },
    { key: "speed", label: "Speed", width: "80px" },
    { key: "mileage", label: "Mileage", width: "90px" },
    { key: "signalStrength", label: "Signal", width: "80px" },
    { key: "latitude", label: "Latitude", width: "100px" },
    { key: "longitude", label: "Longitude", width: "100px" },
    { key: "acc", label: "ACC", width: "60px" },
    { key: "engine", label: "Engine", width: "70px" },
    { key: "head", label: "Heading", width: "80px" },
    { key: "terminalKey", label: "Terminal ID", width: "120px" },
    { key: "voltage", label: "Voltage", width: "80px" },
  ];

  // ✅ NEW: Toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // ✅ NEW: Select/Deselect all columns
  const toggleAllColumns = () => {
    const allVisible = Object.values(visibleColumns).every(
      (visible) => visible
    );
    const newState = {};
    Object.keys(visibleColumns).forEach((key) => {
      newState[key] = !allVisible;
    });
    setVisibleColumns(newState);
  };

  // ✅ UPDATED: Compact Location component - Single line with tooltip
  const LocationDisplay = ({ location }) => {
    const [showFull, setShowFull] = useState(false);
    const maxLength = 25;

    if (!location || location.length <= maxLength) {
      return (
        <span className="text-xs text-gray-700" title={location}>
          {location || "N/A"}
        </span>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <span
          className="text-xs text-gray-700 cursor-pointer"
          title={location}
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? location : `${location.substring(0, maxLength)}...`}
        </span>
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-xs text-[#D52B1E] hover:text-[#B8241A] font-medium flex-shrink-0"
        >
          {showFull ? "Less" : "More"}
        </button>
      </div>
    );
  };

  const transformedData = carData.map((car, index) => ({
    id: car?.car_id ?? index + 1,
    name: car?.carname ?? `Vehicle ${car?.car_id ?? index + 1}`,
    status: car?.movingstatus ?? "Unknown",
    location: car?.location ?? "Unknown",
    lastUpdate: car?.gps_time ? new Date(car.gps_time).toLocaleString() : "N/A",
    speed: typeof car?.speed === "number" ? `${car.speed} km/h` : "0 km/h",
    mileage: typeof car?.mileage === "number" ? `${car.mileage} km` : "N/A",
    signalStrength: car?.signalstrength ?? "N/A",
    latitude: car?.latitude ?? "N/A",
    longitude: car?.longitude ?? "N/A",
    acc: typeof car?.acc === "number" ? (car.acc === 1 ? "On" : "Off") : "N/A",
    engine: car?.engine === "1" ? "On" : car?.engine === "0" ? "Off" : "N/A",
    head: car?.head ?? "N/A",
    terminalKey: car?.terminalkey ?? "N/A",
    voltage: car?.voltage ?? "N/A",
    originalData: car,
  }));

  const tableData = transformedData;

  // ✅ UPDATED: Handle row click with toggle functionality
  const handleRowClick = (row, event) => {
    if (event.target.tagName === "BUTTON" || event.target.closest("button")) {
      return;
    }

    console.log("Row clicked:", row.originalData);

    if (selectedRowId === row.id) {
      setSelectedRowId(null);
      dispatch(setSelectedVehicle(null));
    } else {
      setSelectedRowId(row.id);
      dispatch(setSelectedVehicle(row.id));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = tableData.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value.toString().toLowerCase().includes(term)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
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

  const getStatusColor = (status) => {
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

  const getRowBackgroundColor = (status, rowId) => {
    if (selectedRowId === rowId) {
      return "bg-blue-100 border-l-4 border-blue-500";
    }

    switch (status.toLowerCase()) {
      case "moving":
      case "run":
        return "bg-green-50";
      case "idle":
        return "bg-yellow-50";
      case "stop":
        return "bg-red-50";
      case "offline":
        return "bg-gray-50";
      default:
        return "";
    }
  };

  const toggleFullOpen = () => setIsFullyOpen(!isFullyOpen);

  const closeTable = (e) => {
    e.stopPropagation();
    setIsFullyOpen(false);
    onToggle();
  };

  // ✅ UPDATED: Sortable header that respects visibility
  const SortableHeader = ({
    field,
    label,
    isSticky = false,
    width = "auto",
  }) => {
    if (!visibleColumns[field]) return null;

    return (
      <th
        scope="col"
        className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap bg-gray-50 ${
          isSticky ? "sticky left-0 z-20 shadow-md" : ""
        }`}
        style={{ width: width, minWidth: width }}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center">
          {label}
          {sortField === field &&
            (sortDirection === "asc" ? (
              <ChevronUp size={14} className="ml-1" />
            ) : (
              <ChevronDown size={14} className="ml-1" />
            ))}
        </div>
      </th>
    );
  };

  // ✅ NEW: Render table cell based on column visibility
  const renderTableCell = (row, columnKey, style = {}) => {
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
            <LocationDisplay location={row.location} />
          </div>
        </td>
      ),
      lastUpdate: (
        <td className="px-3 py-2 text-xs text-gray-500 truncate" style={style}>
          {row.lastUpdate}
        </td>
      ),
      speed: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.speed}
        </td>
      ),
      mileage: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.mileage}
        </td>
      ),
      signalStrength: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.signalStrength}
        </td>
      ),
      latitude: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 truncate"
          style={style}
        >
          {row.latitude}
        </td>
      ),
      longitude: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 truncate"
          style={style}
        >
          {row.longitude}
        </td>
      ),
      acc: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.acc}
        </td>
      ),
      engine: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.engine}
        </td>
      ),
      head: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.head}
        </td>
      ),
      terminalKey: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 truncate"
          style={style}
        >
          {row.terminalKey}
        </td>
      ),
      voltage: (
        <td
          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
          style={style}
        >
          {row.voltage}
        </td>
      ),
    };

    return cellContent[columnKey];
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ease-in-out z-20 
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
          className={`flex-grow bg-white w-[58%] overflow-hidden border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {isOpen && (
            <div className="flex flex-col bg-white border-b border-gray-200">
              {/* ✅ UPDATED: Header with column settings */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark text-sm">
                    Vehicle Data
                  </span>
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {tableData.length}
                  </span>
                </div>

                <div className="flex-grow mx-4 hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-8 pr-3 py-1 border border-gray-200 rounded-md text-xs placeholder-gray-400 focus:outline-none "
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

                <div className="flex items-center gap-1">
                  {/* ✅ NEW: Column Settings Dropdown */}
                  <div className="relative">
                    <button
                      className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors duration-200 flex items-center gap-1"
                      title="Column Settings"
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    >
                      <Settings size={14} className="text-gray-600" />
                    </button>

                    {/* ✅ NEW: Column Visibility Dropdown */}
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
                          {columnDefinitions.map((column,index) => (
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
                                className="w-4 h-4 text-primary border-gray-300 rounded "
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

          {/* ✅ UPDATED: Table content with dynamic columns */}
          <div
            className={`overflow-x-scroll overflow-y-scroll relative ${
              isFullyOpen ? "h-[calc(78vh-60px)]" : "h-[calc(48vh-60px)]"
            }`}
            style={{
              willChange: "transform",
              overflowAnchor: "none",
              scrollbarWidth: "thin",
              msOverflowStyle: "scrollbar",
            }}
            onClick={() => setShowColumnDropdown(false)} // Close dropdown when clicking table area
          >
            {sortedData.length > 0 ? (
              <table className="w-full min-w-full table-fixed divide-y divide-gray-200 transition-opacity duration-300 ease-in-out">
                <thead className="bg-white sticky top-0 z-20">
                  <tr>
                    {columnDefinitions.map((column, index) => (
                      <SortableHeader
                        key={index}
                        field={column.key}
                        label={column.label}
                        isSticky={column.isSticky}
                        width={column.width}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((row,index) => (
                    <tr
                      key={index}
                      className={`cursor-pointer transition-colors duration-200 ${getRowBackgroundColor(
                        row.status,
                        row.id
                      )}`}
                      onClick={(e) => handleRowClick(row, e)}
                      title="Click to select and zoom to vehicle"
                    >
                      {columnDefinitions.map((column) =>
                        renderTableCell(row, column.key, {
                          width: column.width,
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
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
