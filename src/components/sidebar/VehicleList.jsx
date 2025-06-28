import React, { useState, memo, useMemo, useCallback, useEffect } from "react";
import VehicleCard from "./VehicleCard";
import { Car, ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSelectedVehicle } from "../../features/mapInteractionSlice";
import { FixedSizeList as List } from "react-window";
import "../../styles/performance.css";

// Hook for responsive height
const useResponsiveHeight = () => {
  const [height, setHeight] = useState(350);

  useEffect(() => {
    const updateHeight = () => {
      const screenWidth = window.innerWidth;
      let newHeight;
      if (screenWidth < 640) {
        // sm
        newHeight = 400;
      } else if (screenWidth < 768) {
        // md
        newHeight = 820;
      } else if (screenWidth < 1024) {
        // lg
        newHeight = 500;
      } else if (screenWidth > 1280) {
        // xl
        newHeight = 450;
      } else {
        // 2xl
        newHeight = 450;
      }

      setHeight(newHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return height;
};

const VehicleList = memo(({ carData }) => {
  const [sortOption, setSortOption] = useState("nameAZ"); // Changed default to "nameAZ"
  // const selectedVehicleId = useSelector(
  //   (state) => state.mapInteraction.selectedVehicleId
  // );
  const dispatch = useDispatch();

  // Use responsive height hook
  const responsiveHeight = useResponsiveHeight();

  // Sort options
  const sortOptions = [
    { value: "nameAZ", label: "Sort A to Z" },
    { value: "driver", label: "Sort by Driver" },
    { value: "group", label: "Sort by Group" },
    { value: "status", label: "Sort by Status" },
    { value: "lastUpdate", label: "Sort by Last Update" },
  ];

  // useMemo for sorting vehicles
  const sortedVehicles = useMemo(() => {
    if (!carData || carData.length === 0) return [];

    let sorted = [...carData];

    switch (sortOption) {
      case "nameAZ":
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;

      case "driver":
        // Since driver info is not in the data structure, we'll sort by carname as fallback
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;

      case "group":
        // Since group info is not in the data structure, we'll sort by carname as fallback
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
          // Priority: Moving > Idle > Stop > Others
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
          return timeB - timeA; // Most recent first
        });
        break;

      default:
        // Default to A-Z sorting
        sorted.sort((a, b) => {
          const nameA = (a.carname || "").toLowerCase();
          const nameB = (b.carname || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }

    return sorted;
  }, [carData, sortOption]);

  // useCallback for functions
  const handleDeselectVehicle = useCallback(() => {
    dispatch(setSelectedVehicle(null));
  }, [dispatch]);

  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);

  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        zIndex: 1000 - index, // Upper cards have higher z-index
      }}
    >
      <VehicleCard car={sortedVehicles[index]} />
    </div>
  );

  return (
    <div className="p-3 transition-opacity duration-300 opacity-100">
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

      {/* Deselect button - Only show when a vehicle is selected */}
      {/* <div className="mb-3 transition-all duration-200 transform translate-y-0 opacity-100">
        <button
          onClick={handleDeselectVehicle}
          className={`text-primary font-bold text-sm hover:underline flex items-center p-1 transition-transform duration-200 hover:scale-105 active:scale-95 ${
            selectedVehicleId ? "opacity-100" : "opacity-60"
          }`}
          disabled={!selectedVehicleId}
        >
          DESELECT VEHICLE
        </button>
      </div> */}

      <div className="space-y-3">
        {sortedVehicles.length > 0 ? (
          <List
            height={responsiveHeight} // Use responsive height
            itemCount={sortedVehicles.length}
            itemSize={140}
            itemData={sortedVehicles}
          >
            {Row}
          </List>
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
  );
});

export default VehicleList;
