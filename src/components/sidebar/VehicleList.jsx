import React, { useState, memo, useCallback } from "react";
import VehicleCard from "./VehicleCard";
import { Car, ChevronDown } from "lucide-react";
import "../../styles/performance.css";

const VehicleList = memo(({ carData, sidebarHeight }) => {
  const [sortOption, setSortOption] = useState("nameAZ");

  // Sort options
  const sortOptions = [
    { value: "nameAZ", label: "Sort A to Z" },
    { value: "driver", label: "Sort by Driver" },
    { value: "group", label: "Sort by Group" },
    { value: "status", label: "Sort by Status" },
    { value: "lastUpdate", label: "Sort by Last Update" },
  ];

  // Sort vehicles based on selected option
  const sortedVehicles = React.useMemo(() => {
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

  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);

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

      {/* Vehicle List - Simplified without react-window */}
      <div className="flex-1 overflow-y-auto">
        {sortedVehicles.length > 0 ? (
          <div className="space-y-2.5">
            {sortedVehicles.map((car, index) => (
              <VehicleCard key={car.car_id || index} car={car} />
            ))}
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
  );
});

export default VehicleList;
