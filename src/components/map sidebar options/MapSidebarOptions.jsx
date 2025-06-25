import React, { useState, useRef } from "react";
import {
  X,
  Layers,
  MapPin,
  Settings,
  Car,
  ChevronRight,
  Route,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIconClustering,
  setIconClustering,
  selectShowAllLabels,
  setShowAllLabels,
  selectShowGeofences,
  setShowGeofences,
} from "../../features/mapInteractionSlice";
import {
  selectMovingStatusFilter,
  setMovingStatusFilter,
} from "../../features/gpsTrackingSlice";
import { fetchGeofenceForUser } from "../../features/geofenceSlice";
import IconLegendModal from "./IconLegendModal";
import AdvancedOptionsModal from "./AdvancedOptionsModal";
import {
  fetchRouteListForUser,
  selectRoutesLoading,
  selectShowRoutes,
  setShowRoutes,
} from "../../features/routeSlice";

const MapSidebarOptions = ({ isOpen, onClose }) => {
  const [isIconLegendOpen, setIsIconLegendOpen] = useState(false);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const optionsRef = useRef(null);
  const dispatch = useDispatch();

  const { userGeofences } = useSelector((state) => state.geofence);
  const { routes: userRoutes } = useSelector((state) => state.route);
  const iconClustering = useSelector(selectIconClustering);
  const movingStatusFilter = useSelector(selectMovingStatusFilter);
  const showAllLabels = useSelector(selectShowAllLabels);
  const showGeofences = useSelector(selectShowGeofences);
  const routesLoading = useSelector(selectRoutesLoading);

  // ✅ UPDATED: Redux se showRoutes state use karein
  const showRoutes = useSelector(selectShowRoutes);

  console.warn("hello", userRoutes);

  const toggleShowAllLabels = () => {
    dispatch(setShowAllLabels(!showAllLabels));
  };

  const handleVehicleFilterChange = (filter) => {
    dispatch(setMovingStatusFilter(filter));
  };

  const toggleIconClustering = () => {
    dispatch(setIconClustering(!iconClustering));
  };

  const toggleGeofences = () => {
    const newValue = !showGeofences;
    dispatch(setShowGeofences(newValue));
    if (newValue) {
      if (!userGeofences || userGeofences.length === 0) {
        dispatch(fetchGeofenceForUser());
      }
    } else {
    }
  };

  // ✅ UPDATED: toggleRoutes function with Redux state
  const toggleRoutes = () => {
    const newValue = !showRoutes;

    // Redux state update
    dispatch(setShowRoutes(newValue));

    // Conditional API dispatch
    if (newValue) {
      // Routes ON kiya gaya hai, API call karein
      if (!userRoutes || userRoutes.length === 0) {
        console.log("Fetching routes for user...");
        dispatch(fetchRouteListForUser());
      } else {
        console.log("Routes already loaded:", userRoutes.length);
      }
    } else {
      // Routes OFF kiya gaya hai
      console.log("Routes turned off");
    }
  };

  const openIconLegend = () => {
    setIsIconLegendOpen(true);
  };

  const closeIconLegend = () => {
    setIsIconLegendOpen(false);
  };

  const openAdvancedOptions = () => {
    setIsAdvancedOptionsOpen(true);
  };

  const closeAdvancedOptions = () => {
    setIsAdvancedOptionsOpen(false);
  };

  // ✅ BALANCED Toggle Switch Component
  const ToggleSwitch = ({ id, checked, onChange, label, icon }) => (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-md transition duration-200">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 flex items-center cursor-pointer"
      >
        {icon && (
          <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        {label}
      </label>
      <button
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
          checked ? "bg-primary" : "bg-gray-200"
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  // ✅ BALANCED Menu Item Component
  const MenuItem = ({ label, icon, onClick }) => (
    <div
      className="flex items-center justify-between py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-md transition duration-200"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && (
          <span className="mr-2.5 w-4 h-4 flex items-center justify-center text-gray-500">
            {icon}
          </span>
        )}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  );

  // ✅ BALANCED Radio Button Component
  const RadioButton = ({ label, icon, isSelected, onClick, colorClass }) => (
    <div
      className={`flex items-center p-2.5 rounded-md cursor-pointer transition duration-200 ${
        isSelected
          ? `${colorClass} border border-${colorClass.replace(
              "bg-",
              ""
            )}/50 shadow-sm`
          : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center w-full">
        <div
          className={`w-4 h-4 rounded-full mr-2.5 flex items-center justify-center ${
            isSelected ? "border-2 border-primary" : "border-2 border-gray-300"
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        {icon && (
          <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={optionsRef}
            className="fixed top-0 right-0 h-full bg-white shadow-xl z-50 overflow-hidden flex flex-col"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }} // ✅ BALANCED WIDTH: 320px
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* ✅ BALANCED Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-base font-semibold text-gray-800">
                Map Settings
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition duration-200 cursor-pointer"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            {/* ✅ BALANCED Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* ✅ BALANCED Vehicle Filter Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
                  Show Vehicles
                </h4>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  {["all", "Moving", "Idle", "Stop"].map((type) => (
                    <RadioButton
                      key={type}
                      label={`${type === "all" ? "All" : type} Vehicles`}
                      icon={
                        <Car
                          size={16}
                          className={`text-${
                            type === "Moving"
                              ? "green"
                              : type === "Idle"
                              ? "yellow"
                              : type === "Stop"
                              ? "red"
                              : "blue"
                          }-500`}
                        />
                      }
                      isSelected={movingStatusFilter === type}
                      onClick={() => handleVehicleFilterChange(type)}
                      colorClass={`bg-${
                        type === "Moving"
                          ? "green"
                          : type === "Idle"
                          ? "yellow"
                          : type === "Stop"
                          ? "red"
                          : "blue"
                      }-50`}
                    />
                  ))}
                </div>
              </div>

              {/* ✅ BALANCED Map Options Section */}
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
                  Map Options
                </h4>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <ToggleSwitch
                    id="iconClustering"
                    checked={iconClustering}
                    onChange={toggleIconClustering}
                    label="Icon Clustering"
                    icon={<Layers size={16} className="text-blue-500" />}
                  />
                  <ToggleSwitch
                    id="showAllLabels"
                    checked={showAllLabels}
                    onChange={toggleShowAllLabels}
                    label="Show All Labels"
                    icon={<MapPin size={16} className="text-red-500" />}
                  />
                  <div
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={openIconLegend}
                  >
                    <div className="flex items-center">
                      <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
                        <Layers size={16} className="text-orange-500" />
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Icon Legend
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* ✅ BALANCED Add to Map Section */}
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
                  Add to Map
                </h4>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <ToggleSwitch
                    id="userGeofences"
                    checked={showGeofences}
                    onChange={toggleGeofences}
                    label="Geofences"
                    icon={<Layers size={16} className="text-green-500" />}
                  />
                  {/* ✅ UPDATED: Routes Toggle with Redux state */}
                  <ToggleSwitch
                    id="userRoutes"
                    checked={showRoutes}
                    onChange={toggleRoutes}
                    label={`Routes`}
                    icon={<Route size={16} className="text-blue-500" />}
                  />
                  {/* Suggested Geofences - Disabled */}
                  <div className="flex items-center justify-between py-2.5 px-3 opacity-50 cursor-not-allowed">
                    <label className="text-sm font-medium text-gray-400 flex items-center">
                      <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
                        <MapPin size={16} className="text-gray-400" />
                      </span>
                      Suggested Geofences
                    </label>
                    <button
                      disabled
                      className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 cursor-not-allowed"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md translate-x-0.5" />
                    </button>
                  </div>
                  {/* Garmin Stops - Disabled */}
                  <div className="flex items-center justify-between py-2.5 px-3 opacity-50 cursor-not-allowed">
                    <label className="text-sm font-medium text-gray-400 flex items-center">
                      <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
                        <Car size={16} className="text-gray-400" />
                      </span>
                      Garmin Stops
                    </label>
                    <button
                      disabled
                      className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 cursor-not-allowed"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md translate-x-0.5" />
                    </button>
                  </div>
                </div>
                {/* ✅ BALANCED Advanced Options */}
                <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <MenuItem
                    label="Advanced Options"
                    icon={<Settings size={16} className="text-gray-500" />}
                    onClick={openAdvancedOptions}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Legend Modal */}
      <IconLegendModal isOpen={isIconLegendOpen} onClose={closeIconLegend} />

      {/* Advanced Options Modal */}
      <AdvancedOptionsModal
        isOpen={isAdvancedOptionsOpen}
        onClose={closeAdvancedOptions}
      />
    </>
  );
};

export default MapSidebarOptions;
