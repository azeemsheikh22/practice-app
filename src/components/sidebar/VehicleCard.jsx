import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Gauge,
  MoreVertical,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";

// Import the same vehicle icons used in the map
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";

// Cleanup function for localStorage
const cleanupOldMenuStates = () => {
  try {
    const keys = Object.keys(localStorage);
    const menuKeys = keys.filter((key) => key.startsWith("vehicleMenu_"));

    // Keep only last 50 menu states
    if (menuKeys.length > 50) {
      const oldKeys = menuKeys.slice(0, menuKeys.length - 50);
      oldKeys.forEach((key) => localStorage.removeItem(key));
    }
  } catch (error) {
    console.warn("Failed to cleanup localStorage:", error);
  }
};

const VehicleCard = ({ car }) => {
  const dispatch = useDispatch();
  const selectedVehicleId = useSelector(
    (state) => state.mapInteraction.selectedVehicleId
  );
  const isSelected = selectedVehicleId === car.car_id;

  // LocalStorage se initial state get karein
  const getInitialMenuState = () => {
    try {
      const savedState = localStorage.getItem(`vehicleMenu_${car.car_id}`);
      return savedState ? JSON.parse(savedState) : false;
    } catch (error) {
      return false;
    }
  };

  const [menuOpen, setMenuOpen] = useState(getInitialMenuState);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Cleanup localStorage on component mount
  useEffect(() => {
    cleanupOldMenuStates();
  }, []);

  // Calculate dynamic height based on active submenus
  const getMenuHeight = () => {
    if (!menuOpen) return "max-h-0";

    let baseHeight = 400; // Base height for main menu items

    if (activeSubmenu === "directions") {
      baseHeight += 80; // Add height for directions submenu (2 items)
    }
    if (activeSubmenu === "vehicleOptions") {
      baseHeight += 160; // Add height for vehicle options submenu (4 items)
    }

    return `max-h-[${baseHeight}px]`;
  };

  // Get status color
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

  // Get vehicle icon based on status
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

  // Format date and time to be more readable
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

  const handleCardClick = () => {
    if (!menuOpen) {
      dispatch(setSelectedVehicle(car.car_id));
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    setActiveSubmenu(null); // Reset submenu when closing

    // LocalStorage mein save karein
    try {
      localStorage.setItem(
        `vehicleMenu_${car.car_id}`,
        JSON.stringify(newMenuState)
      );
    } catch (error) {
      console.warn("Failed to save menu state to localStorage:", error);
    }
  };

  const handleMenuItemClick = (action, e) => {
    e.stopPropagation();

    // Handle different menu actions
    switch (action) {
      case "findNearest":
        console.log("Find Nearest clicked for", car.carname);
        break;
      case "viewReplay":
        console.log("View Replay clicked for", car.carname);
        break;
      case "dailyReport":
        console.log("Daily Report clicked for", car.carname);
        break;
      case "detailedReport":
        console.log("Detailed Report clicked for", car.carname);
        break;
      case "zoomTo":
        console.log("Zoom To clicked for", car.carname);
        break;
      case "createGeofence":
        console.log("Create Geofence clicked for", car.carname);
        break;
      case "removeFromMap":
        console.log("Remove from Map clicked for", car.carname);
        break;
      case "directionsTo":
        console.log("Directions To clicked for", car.carname);
        break;
      case "directionsFrom":
        console.log("Directions From clicked for", car.carname);
        break;
      case "editVehicle":
        console.log("Edit Vehicle clicked for", car.carname);
        break;
      case "editDriver":
        console.log("Edit Driver clicked for", car.carname);
        break;
      case "sendMessage":
        console.log("Send Message clicked for", car.carname);
        break;
      case "roadsideAssistance":
        console.log("Roadside Assistance clicked for", car.carname);
        break;
      default:
        break;
    }

    // Menu close kar ke localStorage update karein
    setMenuOpen(false);
    setActiveSubmenu(null);
    try {
      localStorage.setItem(`vehicleMenu_${car.car_id}`, JSON.stringify(false));
    } catch (error) {
      console.warn("Failed to save menu state to localStorage:", error);
    }
  };

  const handleSubmenuToggle = (submenuName, e) => {
    e.stopPropagation();
    setActiveSubmenu(activeSubmenu === submenuName ? null : submenuName);
  };

  // Listen for close events from other cards (global menu management)
  useEffect(() => {
    const handleCloseOtherMenus = (event) => {
      if (event.detail.excludeId !== car.car_id && menuOpen) {
        setMenuOpen(false);
        setActiveSubmenu(null);
        try {
          localStorage.setItem(
            `vehicleMenu_${car.car_id}`,
            JSON.stringify(false)
          );
        } catch (error) {
          console.warn("Failed to save menu state to localStorage:", error);
        }
      }
    };

    window.addEventListener("closeOtherMenus", handleCloseOtherMenus);

    return () => {
      window.removeEventListener("closeOtherMenus", handleCloseOtherMenus);
    };
  }, [car.car_id, menuOpen]);

  // Trigger close other menus when opening this menu
  useEffect(() => {
    if (menuOpen) {
      window.dispatchEvent(
        new CustomEvent("closeOtherMenus", {
          detail: { excludeId: car.car_id },
        })
      );
    }
  }, [menuOpen, car.car_id]);

  return (
    <div
      className={`vehicle-card-container relative border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md overflow-visible
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-300 bg-white hover:border-blue-300"
        }`}
      onClick={handleCardClick}
      style={{
        marginBottom: "10px",
        willChange: "transform",
        contain: "layout style paint",
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <img
                src={getVehicleIcon(car.movingstatus)}
                alt="Vehicle"
                className="w-5 h-5 transition-transform duration-200"
                style={
                  car.movingstatus?.toLowerCase() === "moving"
                    ? {
                        transform: `rotate(${(car.head || 0) - 140}deg)`,
                      }
                    : {}
                }
              />
            </div>
            <div className="font-semibold text-gray-900 truncate max-w-[150px]">
              {car.carname || `Vehicle ${car.car_id}`}
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`px-2 py-0.5 rounded-full text-white text-xs mr-2 ${getStatusColor(
                car.movingstatus
              )}`}
            >
              {car.movingstatus || "Unknown"}
            </div>

            {/* 3-dot menu button */}
            <button
              onClick={handleMenuToggle}
              className="menu-button p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            >
              {menuOpen ? (
                <ChevronUp size={14} className="text-gray-600" />
              ) : (
                <MoreVertical size={14} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex mb-2.5 text-xs text-gray-800">
          <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
          <div className="line-clamp-2 leading-tight">
            {car.location || "Unknown location"}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-800">
          <div className="flex items-center">
            <Gauge size={14} className="mr-2 flex-shrink-0" />
            <span>{car.speed || "0"} km/h</span>
          </div>

          <div className="flex items-center">
            <Clock size={14} className="mr-2 flex-shrink-0" />
            <span>{formatDateTime(car.gps_time)}</span>
          </div>
        </div>
      </div>

      {/* Expandable menu section with dynamic height */}
      <div
        className={`bg-gray-50 border-t border-gray-200 transition-all duration-300 overflow-hidden ${
          menuOpen ? "py-2" : "py-0"
        }`}
        style={{
          maxHeight: menuOpen
            ? activeSubmenu === "directions"
              ? "480px"
              : activeSubmenu === "vehicleOptions"
              ? "560px"
              : "400px"
            : "0px",
          transition: "max-height 0.3s ease-in-out",
        }}
      >
        <div className="p-2 space-y-1">
          {/* Find Nearest */}
          <button
            onClick={(e) => handleMenuItemClick("findNearest", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Find Nearest
          </button>

          {/* View Replay */}
          <button
            onClick={(e) => handleMenuItemClick("viewReplay", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            View Replay
          </button>

          {/* Run Daily Report */}
          <button
            onClick={(e) => handleMenuItemClick("dailyReport", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Run Daily Report
          </button>

          {/* Run Detailed Report */}
          <button
            onClick={(e) => handleMenuItemClick("detailedReport", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Run Detailed Report
          </button>

          {/* Zoom To */}
          <button
            onClick={(e) => handleMenuItemClick("zoomTo", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Zoom To
          </button>

          {/* Create Geofence */}
          <button
            onClick={(e) => handleMenuItemClick("createGeofence", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Create a Geofence Here
          </button>

          {/* Remove from Live Map */}
          <button
            onClick={(e) => handleMenuItemClick("removeFromMap", e)}
            className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium"
          >
            Remove from Live Map
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Directions - Expandable */}
          <div>
            <button
              onClick={(e) => handleSubmenuToggle("directions", e)}
              className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium flex items-center justify-between"
            >
              <span>Directions</span>
              <ChevronRight
                size={14}
                className={`transform transition-transform duration-200 ${
                  activeSubmenu === "directions" ? "rotate-90" : ""
                }`}
              />
            </button>
            <div
              className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                activeSubmenu === "directions"
                  ? "max-h-20 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <button
                onClick={(e) => handleMenuItemClick("directionsTo", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Get Directions To Here
              </button>
              <button
                onClick={(e) => handleMenuItemClick("directionsFrom", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Get Directions From Here
              </button>
            </div>
          </div>

          {/* Vehicle Options - Expandable */}
          <div>
            <button
              onClick={(e) => handleSubmenuToggle("vehicleOptions", e)}
              className="w-full text-left text-sm py-2 px-3 text-gray-800 hover:bg-gray-100 rounded font-medium flex items-center justify-between"
            >
              <span>Vehicle Options</span>
              <ChevronRight
                size={14}
                className={`transform transition-transform duration-200 ${
                  activeSubmenu === "vehicleOptions" ? "rotate-90" : ""
                }`}
              />
            </button>

            <div
              className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                activeSubmenu === "vehicleOptions"
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <button
                onClick={(e) => handleMenuItemClick("editVehicle", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Edit Vehicle
              </button>
              <button
                onClick={(e) => handleMenuItemClick("editDriver", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Edit Driver
              </button>
              <button
                onClick={(e) => handleMenuItemClick("sendMessage", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Send Message
              </button>
              <button
                onClick={(e) => handleMenuItemClick("roadsideAssistance", e)}
                className="w-full text-left text-sm py-1.5 px-3 text-gray-700 hover:bg-gray-100 rounded"
              >
                Roadside Assistance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
