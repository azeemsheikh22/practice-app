import React, { useState, useCallback } from "react";
import {
  X,
  Layers,
  MapPin,
  Settings,
  Car,
  ChevronRight,
  Route,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setIconClustering,
  setShowAllLabels,
  setShowGeofences,
} from "../../features/mapInteractionSlice";
import {
  setMovingStatusFilter,
} from "../../features/gpsTrackingSlice";
import { fetchGeofenceForUser } from "../../features/geofenceSlice";
import IconLegendModal from "./IconLegendModal";
import AdvancedOptionsModal from "./AdvancedOptionsModal";
import {
  fetchRouteListForUser,
  setShowRoutes,
} from "../../features/routeSlice";

const MapSidebarOptions = ({ isOpen, onClose }) => {
  const [isIconLegendOpen, setIsIconLegendOpen] = useState(false);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const dispatch = useDispatch();

  // ✅ Optimized selector - only get what we need
  const {
    userGeofences,
    userRoutes,
    iconClustering,
    movingStatusFilter,
    showAllLabels,
    showGeofences,
    showRoutes,
  } = useSelector((state) => ({
    userGeofences: state.geofence.userGeofences,
    userRoutes: state.route.routes,
    iconClustering: state.mapInteraction.iconClustering,
    movingStatusFilter: state.gpsTracking.movingStatusFilter,
    showAllLabels: state.mapInteraction.showAllLabels,
    showGeofences: state.mapInteraction.showGeofences,
    showRoutes: state.route.showRoutes,
  }), (prev, next) => {
    // Custom equality check to prevent unnecessary re-renders
    return JSON.stringify(prev) === JSON.stringify(next);
  });

  // ✅ Memoized callbacks
  const toggleShowAllLabels = () => {
    dispatch(setShowAllLabels(!showAllLabels));
  };

  const handleVehicleFilterChange = (filter) => {
    dispatch(setMovingStatusFilter(filter));
  };

  const toggleIconClustering = () => {
    dispatch(setIconClustering(!iconClustering));
  }
  const toggleGeofences = () => {
    const newValue = !showGeofences;
    dispatch(setShowGeofences(newValue));
    if (newValue && (!userGeofences || userGeofences.length === 0)) {
      dispatch(fetchGeofenceForUser());
    }
  };

  const toggleRoutes = () => {
    const newValue = !showRoutes;
    dispatch(setShowRoutes(newValue));
    if (newValue && (!userRoutes || userRoutes.length === 0)) {
      dispatch(fetchRouteListForUser());
    }
  };

  // ✅ Simple CSS transition instead of Framer Motion
  if (!isOpen) return null;

  return (
    <>
      {/* ✅ Simple CSS-based sidebar - No Framer Motion */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-[900] overflow-hidden flex flex-col transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          width: '320px',
          transform: 'translateZ(0)', // Hardware acceleration
          willChange: 'transform',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-800">
            Map Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-150"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content - Virtualized for better performance */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Vehicle Filter Section */}
            <VehicleFilterSection
              movingStatusFilter={movingStatusFilter}
              onFilterChange={handleVehicleFilterChange}
            />

            {/* Map Options Section */}
            <MapOptionsSection
              iconClustering={iconClustering}
              showAllLabels={showAllLabels}
              onToggleIconClustering={toggleIconClustering}
              onToggleShowAllLabels={toggleShowAllLabels}
              onOpenIconLegend={() => setIsIconLegendOpen(true)}
            />

            {/* Add to Map Section */}
            <AddToMapSection
              showGeofences={showGeofences}
              showRoutes={showRoutes}
              onToggleGeofences={toggleGeofences}
              onToggleRoutes={toggleRoutes}
            />

            {/* Advanced Options Section */}
            <AdvancedOptionsSection
              onOpenAdvancedOptions={() => setIsAdvancedOptionsOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals - Only render when needed */}
      {isIconLegendOpen && (
        <IconLegendModal
          isOpen={isIconLegendOpen}
          onClose={() => setIsIconLegendOpen(false)}
        />
      )}
      {isAdvancedOptionsOpen && (
        <AdvancedOptionsModal
          isOpen={isAdvancedOptionsOpen}
          onClose={() => setIsAdvancedOptionsOpen(false)}
        />
      )}
    </>
  );
};

// ✅ Separate components for better performance
const VehicleFilterSection = React.memo(({ movingStatusFilter, onFilterChange }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
      Show Vehicles
    </h4>
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {["all", "Moving", "Idle", "Stop"].map((type) => (
        <RadioButton
          key={type}
          label={`${type === "all" ? "All" : type} Vehicles`}
          icon={<Car size={16} className={`text-${getColorForType(type)}-500`} />}
          isSelected={movingStatusFilter === type}
          onClick={() => onFilterChange(type)}
          colorClass={`bg-${getColorForType(type)}-50`}
        />
      ))}
    </div>
  </div>
));

const MapOptionsSection = React.memo(({
  iconClustering,
  showAllLabels,
  onToggleIconClustering,
  onToggleShowAllLabels,
  onOpenIconLegend
}) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
      Map Options
    </h4>
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <ToggleSwitch
        checked={iconClustering}
        onChange={onToggleIconClustering}
        label="Icon Clustering"
        icon={<Layers size={16} className="text-blue-500" />}
      />
      <ToggleSwitch
        checked={showAllLabels}
        onChange={onToggleShowAllLabels}
        label="Show All Labels"
        icon={<MapPin size={16} className="text-red-500" />}
      />
      <MenuItem
        label="Icon Legend"
        icon={<Layers size={16} className="text-orange-500" />}
        onClick={onOpenIconLegend}
      />
    </div>
  </div>
));

const AddToMapSection = React.memo(({
  showGeofences,
  showRoutes,
  onToggleGeofences,
  onToggleRoutes
}) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
      Add to Map
    </h4>
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <ToggleSwitch
        checked={showGeofences}
        onChange={onToggleGeofences}
        label="Geofences"
        icon={<Layers size={16} className="text-green-500" />}
      />
      <ToggleSwitch
        checked={showRoutes}
        onChange={onToggleRoutes}
        label="Routes"
        icon={<Route size={16} className="text-blue-500" />}
      />

      {/* Work Orders Toggle - Simple On/Off */}
      <ToggleSwitch
        checked={false} // Default off
        onChange={() => {
          // Simple toggle - no logic
          console.log('Work Orders toggled');
        }}
        label="Work Orders"
        icon={<Car size={16} className="text-orange-500" />}
      />

      {/* Dispatch Button - Like Advanced Filters */}
      <MenuItem
        label="Dispatch"
        icon={<Car size={16} className="text-purple-500" />}
        onClick={() => console.log('Dispatch clicked')}
      />

      {/* Driver Dispatch Button - Like Advanced Filters */}
      <MenuItem
        label="Driver Dispatch"
        icon={<MapPin size={16} className="text-indigo-500" />}
        onClick={() => console.log('Driver Dispatch clicked')}
      />

      {/* Disabled options */}
      <DisabledToggle label="Suggested Geofences" icon={<MapPin size={16} />} />
      <DisabledToggle label="Garmin Stops" icon={<Car size={16} />} />
    </div>
  </div>
));



const AdvancedOptionsSection = React.memo(({ onOpenAdvancedOptions }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
      Advanced Options
    </h4>
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <MenuItem
        label="Advanced Filters"
        icon={<Settings size={16} className="text-purple-500" />}
        onClick={onOpenAdvancedOptions}
      />
    </div>
  </div>
));

// ✅ Optimized Toggle Switch
const ToggleSwitch = React.memo(({ checked, onChange, label, icon }) => (
  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-md transition-colors duration-150 cursor-pointer">
    <label className="text-sm font-medium text-gray-700 flex items-center">
      {icon && <span className="mr-2.5 w-4 h-4">{icon}</span>}
      {label}
    </label>
    <button
      onClick={onChange}
      className={`relative cursor-pointer inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 ${checked ? "bg-primary" : "bg-gray-200"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-150 ${checked ? "translate-x-4" : "translate-x-0.5"
          }`}
      />
    </button>
  </div>
));

// ✅ Optimized Menu Item
const MenuItem = React.memo(({ label, icon, onClick }) => (
  <div
    className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors duration-150"
    onClick={onClick}
  >
    <div className="flex items-center">
      {icon && <span className="mr-2.5 w-4 h-4">{icon}</span>}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-400" />
  </div>
));

// ✅ Optimized Radio Button
const RadioButton = React.memo(({ label, icon, isSelected, onClick, colorClass }) => (
  <div
    className={`flex items-center p-2.5 rounded-md cursor-pointer transition-colors duration-150 ${isSelected ? `${colorClass} border border-current/20` : "hover:bg-gray-50"
      }`}
    onClick={onClick}
  >
    <div className="flex items-center w-full">
      <div
        className={`w-4 h-4 rounded-full mr-2.5 flex items-center justify-center border-2 ${isSelected ? "border-primary" : "border-gray-300"
          }`}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      {icon && <span className="mr-2.5 w-4 h-4">{icon}</span>}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  </div>
));

// ✅ Disabled Toggle Component
const DisabledToggle = React.memo(({ label, icon }) => (
  <div className="flex items-center justify-between py-2.5 px-3 opacity-50 cursor-not-allowed">
    <label className="text-sm font-medium text-gray-400 flex items-center">
      <span className="mr-2.5 w-4 h-4 text-gray-400">{icon}</span>
      {label}
    </label>
    <button
      disabled
      className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 cursor-not-allowed"
    >
      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md translate-x-0.5" />
    </button>
  </div>
));

// ✅ Helper function
const getColorForType = (type) => {
  switch (type) {
    case "Moving": return "green";
    case "Idle": return "yellow";
    case "Stop": return "red";
    default: return "blue";
  }
};

export default React.memo(MapSidebarOptions);
