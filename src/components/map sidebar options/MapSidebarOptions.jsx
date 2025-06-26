import React, { useState, useRef, useMemo, useCallback } from "react";
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
  selectShowRoutes,
  setShowRoutes,
} from "../../features/routeSlice";

const MapSidebarOptions = ({ isOpen, onClose }) => {
  const [isIconLegendOpen, setIsIconLegendOpen] = useState(false);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const optionsRef = useRef(null);
  const dispatch = useDispatch();

  // ✅ PERFORMANCE: Memoize selectors to prevent unnecessary re-renders
  const selectorData = useSelector((state) => ({
    userGeofences: state.geofence.userGeofences,
    userRoutes: state.route.routes,
    iconClustering: state.mapInteraction.iconClustering,
    movingStatusFilter: state.gpsTracking.movingStatusFilter,
    showAllLabels: state.mapInteraction.showAllLabels,
    showGeofences: state.mapInteraction.showGeofences,
    showRoutes: state.route.showRoutes,
  }));

  const {
    userGeofences,
    userRoutes,
    iconClustering,
    movingStatusFilter,
    showAllLabels,
    showGeofences,
    showRoutes,
  } = selectorData;

  // ✅ PERFORMANCE: Memoize callback functions
  const toggleShowAllLabels = useCallback(() => {
    dispatch(setShowAllLabels(!showAllLabels));
  }, [dispatch, showAllLabels]);

  const handleVehicleFilterChange = useCallback(
    (filter) => {
      dispatch(setMovingStatusFilter(filter));
    },
    [dispatch]
  );

  const toggleIconClustering = useCallback(() => {
    dispatch(setIconClustering(!iconClustering));
  }, [dispatch, iconClustering]);

  const toggleGeofences = useCallback(() => {
    const newValue = !showGeofences;
    dispatch(setShowGeofences(newValue));
    if (newValue && (!userGeofences || userGeofences.length === 0)) {
      dispatch(fetchGeofenceForUser());
    }
  }, [dispatch, showGeofences, userGeofences]);

  const toggleRoutes = useCallback(() => {
    const newValue = !showRoutes;
    dispatch(setShowRoutes(newValue));
    if (newValue && (!userRoutes || userRoutes.length === 0)) {
      dispatch(fetchRouteListForUser());
    }
  }, [dispatch, showRoutes, userRoutes]);

  const openIconLegend = useCallback(() => {
    setIsIconLegendOpen(true);
  }, []);

  const closeIconLegend = useCallback(() => {
    setIsIconLegendOpen(false);
  }, []);

  const openAdvancedOptions = useCallback(() => {
    setIsAdvancedOptionsOpen(true);
  }, []);

  const closeAdvancedOptions = useCallback(() => {
    setIsAdvancedOptionsOpen(false);
  }, []);

  // ✅ PERFORMANCE: Memoize heavy components
  const ToggleSwitch = useMemo(
    () =>
      React.memo(({ id, checked, onChange, label, icon }) => (
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
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
              checked ? "bg-primary" : "bg-gray-200"
            }`}
            aria-checked={checked}
            role="switch"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${
                checked ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )),
    []
  );

  const MenuItem = useMemo(
    () =>
      React.memo(({ label, icon, onClick }) => (
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
      )),
    []
  );

  const RadioButton = useMemo(
    () =>
      React.memo(({ label, icon, isSelected, onClick, colorClass }) => (
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
                isSelected
                  ? "border-2 border-primary"
                  : "border-2 border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            {icon && (
              <span className="mr-2.5 w-4 h-4 flex items-center justify-center">
                {icon}
              </span>
            )}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
        </div>
      )),
    []
  );

  // ✅ PERFORMANCE: Optimized animation variants
  const sidebarVariants = useMemo(
    () => ({
      hidden: {
        width: 0,
        opacity: 0,
        transition: {
          type: "tween",
          duration: 0.2,
          ease: "easeInOut",
        },
      },
      visible: {
        width: 320,
        opacity: 1,
        transition: {
          type: "tween",
          duration: 0.2,
          ease: "easeInOut",
        },
      },
    }),
    []
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            ref={optionsRef}
            className="fixed top-0 right-0 h-full bg-white shadow-xl z-50 overflow-hidden flex flex-col will-change-transform"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateZ(0)", // Force hardware acceleration
            }}
          >
            {/* Header - Optimized */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0">
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

            {/* Content - Optimized with transform3d */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{
                transform: "translate3d(0,0,0)",
                willChange: "scroll-position",
              }}
            >
              {/* Vehicle Filter Section */}
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

              {/* Map Options Section */}
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

              {/* Add to Map Section */}
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
                  <ToggleSwitch
                    id="userRoutes"
                    checked={showRoutes}
                    onChange={toggleRoutes}
                    label="Routes"
                    icon={<Route size={16} className="text-blue-500" />}
                  />

                  {/* Disabled Options */}
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
              </div>

              {/* Advanced Options Section */}
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-1">
                  Advanced Options
                </h4>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <MenuItem
                    label="Advanced Filters"
                    icon={<Settings size={16} className="text-purple-500" />}
                    onClick={openAdvancedOptions}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals - Lazy loaded */}
      {isIconLegendOpen && (
        <IconLegendModal isOpen={isIconLegendOpen} onClose={closeIconLegend} />
      )}
      {isAdvancedOptionsOpen && (
        <AdvancedOptionsModal
          isOpen={isAdvancedOptionsOpen}
          onClose={closeAdvancedOptions}
        />
      )}
    </>
  );
};

export default React.memo(MapSidebarOptions);
