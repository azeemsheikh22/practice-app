import React, { useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Clock,
  Gauge,
  MoreVertical,
  Battery,
  Wifi,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";

// Import the same vehicle icons used in the map
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";

const VehicleCard = React.memo(({ car }) => {
  const dispatch = useDispatch();
  const selectedVehicleId = useSelector(
    (state) => state.mapInteraction.selectedVehicleId
  );
  const isSelected = selectedVehicleId === car.car_id;

  const [expanded, setExpanded] = useState(false);

  // ✅ STABLE: Memoize car data to prevent unnecessary re-renders
  // Added new fields: signalstrength, mileage, voltage
  const stableCarData = useMemo(() => ({
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
  }), [
    car.car_id,
    car.carname,
    car.movingstatus,
    car.location,
    car.speed,
    car.gps_time,
    car.head,
    car.signalstrength,
    car.mileage,
    car.voltage,
    car.engine,
  ]);

  // Get status color - memoized
  const getStatusColor = useCallback((status) => {
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
  }, []);

  // Get vehicle icon based on status - memoized
  const getVehicleIcon = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "moving":
        return movingIcon;
      case "idle":
        return idleIcon;
      case "stop":
      default:
        return stoppedIcon;
    }
  }, []);

  // Format date and time - memoized
  const formatDateTime = useCallback((timeString) => {
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
  }, []);

  // Get signal strength icon based on value
  const getSignalStrengthIcon = useCallback((strength) => {
    const signalValue = parseInt(strength) || 0;
    if (signalValue >= 5) return "text-green-500";
    if (signalValue >= 3) return "text-yellow-500";
    return "text-red-500";
  }, []);

  // Format mileage with commas and fixed decimal
  // const formatMileage = useCallback((mileage) => {
  //   if (mileage === null || mileage === undefined) return "N/A";
  //   return parseFloat(mileage).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // }, []);

  // Format voltage (show only the second value if comma-separated, else show as is)
  const formatVoltage = useCallback((voltage) => {
    if (voltage === null || voltage === undefined) return "N/A";
    if (typeof voltage === "string" && voltage.includes(",")) {
      const parts = voltage.split(",");
      return (parts[1] ? parseFloat(parts[1]).toFixed(2) : parseFloat(parts[0]).toFixed(2)) + " V";
    }
    if (voltage !== "N/A") {
      return parseFloat(voltage).toFixed(2) + " V";
    }
    return "N/A";
  }, [])  ;

  const handleCardClick = useCallback(() => {
    if (!expanded) {
      dispatch(setSelectedVehicle(stableCarData.car_id));
    }
  }, [dispatch, stableCarData.car_id, expanded]);

  const handleExpandToggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);


  return (
    <>
      <div
        className={`vehicle-card-container relative border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md
          ${
            isSelected
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-300 bg-white hover:border-blue-300"
          }`}
        onClick={handleCardClick}
        style={{
          marginBottom: "10px",
        }}
      >
        <div className="p-4">
          {/* Header with vehicle name and status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0">
                <img
                  src={getVehicleIcon(stableCarData.movingstatus)}
                  alt="Vehicle"
                  className="w-5 h-5 transition-transform duration-200"
                  style={
                    stableCarData.movingstatus?.toLowerCase() === "moving"
                      ? {
                          transform: `rotate(${(stableCarData.head || 0) - 140}deg)`,
                        }
                      : {}
                  }
                />
              </div>
              <div className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">
                {stableCarData.carname || `Vehicle ${stableCarData.car_id}`}
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
                onClick={handleExpandToggle}
                className="menu-button p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                title="Show Options"
                type="button"
              >
                <MoreVertical size={14} className="text-gray-600" />
              </button>
            </div>
          </div>

                {/* Location */}
                <div className="flex mb-2.5 text-xs text-gray-800">
            <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
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
              <span>{formatDateTime(stableCarData.gps_time)}</span>
            </div>
          </div>

          {/* New fields: Signal Strength, Mileage, Voltage */}
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-800 border-t border-gray-100 pt-2">
            {/* Signal Strength */}
            <div className="flex items-center">
              <Wifi size={14} className={`mr-1.5 flex-shrink-0 ${getSignalStrengthIcon(stableCarData.signalstrength)}`} />
              <span title="Signal Strength">
                {stableCarData.signalstrength || "0"}
              </span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center">
              <Clock size={14} className="mr-1.5 flex-shrink-0 text-blue-500" />
              <span title="Duration">
                {car.duration && car.duration !== "N/A" ? car.duration : "-"}
              </span>
            </div>
            
            {/* Voltage */}
            <div className="flex items-center">
              <Battery size={14} className="mr-1.5 flex-shrink-0 text-green-500" />
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
    </>
  );
}, (prevProps, nextProps) => {
  // Simplify comparison: only re-render if car_id or selectedVehicleId changes
  return prevProps.car.car_id === nextProps.car.car_id;
});

VehicleCard.displayName = "VehicleCard";

export default VehicleCard;

