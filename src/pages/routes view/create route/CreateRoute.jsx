import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Save, X, Menu, ChevronLeft } from "lucide-react";
import RouteMap from "./RouteMap";
import RouteDetailTab from "./RouteDetailTab";
import { useSearchParams } from "react-router-dom";

const CreateRoute = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routeData, setRouteData] = useState(null);

  // Form states
  const [routeForm, setRouteForm] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    waypoints: [],
    routeType: "fastest", // fastest, shortest, avoid-highways
    vehicleType: "car", // car, truck, motorcycle
    description: "",
  });

  // Get URL parameters
  const isEditMode = searchParams.get("type") === "edit";
  const routeId = searchParams.get("id");

  const handleRouteCalculated = (data) => {
    setRouteData(data);
  };

  const handleClose = () => {
    window.close();
  };

  const handleSave = () => {
    const completeData = {
      formData: routeForm,
      routeData,
      timestamp: new Date().toISOString(),
    };

    console.log("Save complete route data:", completeData);
    setIsSidebarOpen(false);
  };

  const handleClearAll = () => {
    setRouteForm({
      routeName: "",
      startLocation: "",
      endLocation: "",
      waypoints: [],
      routeType: "fastest",
      vehicleType: "car",
      description: "",
    });
    setRouteData(null);
    setIsSidebarOpen(false);
  };

  const handleFindRoute = () => {
    if (routeForm.startLocation && routeForm.endLocation) {
      console.log("Finding route...", routeForm);
      // Here you would call your routing API
    } else {
      alert("Please enter both start and end locations");
    }
  };

  const handleOptimizeRoute = () => {
    if (routeData) {
      console.log("Optimizing route...", routeData);
      // Here you would call route optimization API
    } else {
      alert("Please calculate a route first");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 h-[10vh] overflow-hidden relative z-40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-colors"
            >
              <Menu size={20} />
            </motion.button>

            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Route size={24} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Route" : "Create Route"}
              </h1>
              {isEditMode && routeId && (
                <p className="text-sm text-gray-600">
                  Editing Route ID: {routeId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <X size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[90vh]">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200 p-3">
            <SidebarContent
              routeForm={routeForm}
              setRouteForm={setRouteForm}
              routeData={routeData}
              handleSave={handleSave}
              handleClearAll={handleClearAll}
              handleFindRoute={handleFindRoute}
              handleOptimizeRoute={handleOptimizeRoute}
            />
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleSidebar}
                  className="lg:hidden fixed inset-0 bg-black/50 z-[9999]"
                />

                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="lg:hidden fixed left-0 top-0 h-full w-[400px] bg-white shadow-2xl z-[10000] overflow-auto"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Route Settings
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSidebar}
                      className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </motion.button>
                  </div>

                  <div className="p-4">
                    <SidebarContent
                      routeForm={routeForm}
                      setRouteForm={setRouteForm}
                      routeData={routeData}
                      handleSave={handleSave}
                      handleClearAll={handleClearAll}
                      handleFindRoute={handleFindRoute}
                      handleOptimizeRoute={handleOptimizeRoute}
                      isMobile={true}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Map Section */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <RouteMap
              startLocation={routeForm.startLocation}
              endLocation={routeForm.endLocation}
              waypoints={routeForm.waypoints}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        </div>
      </motion.div>

      {/* Mobile Floating Action Button */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-blue-600 transition-colors"
          >
            <Menu size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Status Bar */}
      {routeData && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed bottom-20 left-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">
                ✅ Route Calculated
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
            >
              Settings
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const SidebarContent = ({
  routeForm,
  setRouteForm,
  routeData,
  handleSave,
  handleClearAll,
  handleFindRoute,
  handleOptimizeRoute,
  isMobile = false,
}) => {
  return (
    <>
      {/* Route Detail Form */}
      <RouteDetailTab routeForm={routeForm} setRouteForm={setRouteForm} />

      {/* Route Status */}
      {routeData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <h4 className="text-sm font-medium text-green-800 mb-2">
            ✅ Route Calculated
          </h4>
          <p className="text-xs text-green-600">
            Distance: <span className="font-medium">{routeData.distance || 'N/A'}</span>
          </p>
          <p className="text-xs text-green-600">
            Duration: <span className="font-medium">{routeData.duration || 'N/A'}</span>
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className={`flex ${isMobile ? "flex-col space-y-3" : "flex-col space-y-2"} mt-4 pt-4 border-t border-gray-200`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFindRoute}
          className={`${isMobile ? "w-full" : ""} flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200`}
        >
          <Route size={16} className="mr-2" />
          Find Route
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOptimizeRoute}
          className={`${isMobile ? "w-full" : ""} flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200`}
        >
          <Route size={16} className="mr-2" />
          Optimize Route
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`${isMobile ? "w-full" : ""} flex items-center justify-center px-4 py-2 bg-[#D52B1E] text-white rounded-lg hover:bg-[#B8241A] transition-colors duration-200`}
        >
          <Save size={16} className="mr-2" />
          Save Route
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearAll}
          className={`${isMobile ? "w-full" : ""} px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200`}
        >
          Clear All
        </motion.button>
      </div>
    </>
  );
};

export default CreateRoute;
