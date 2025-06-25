import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Save, X, Menu, ChevronLeft } from "lucide-react";
import GeofenceMap from "./GeofenceMap";
import DetailTab from "./DetailTab";
import AdvanceTab from "./AdvanceTab";
import { useSearchParams } from "react-router-dom"; // ADD THIS IMPORT
import { setSelectedLocation } from "../../../features/locationSearchSlice";
import { useDispatch } from "react-redux";

const CreateGeofence = () => {
  const [searchParams] = useSearchParams(); // ADD THIS HOOK
  const [activeTab, setActiveTab] = useState("detail");
  const [mapType, setMapType] = useState("street");
  const [activeTool, setActiveTool] = useState(null);
  const [geofenceData, setGeofenceData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  // Form states
  const [detailForm, setDetailForm] = useState({
    geofenceName: "",
    address: "",
    group: "",
    city: "",
    category: "",
    description: "",
  });

  const [advanceForm, setAdvanceForm] = useState({
    contactName: "",
    contactPhone: "",
    placeId: "",
    markerColor: "#D52B1E",
    showOn: [],
  });

  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (lat && lng) {
      const coordinates = {
        lat: parseFloat(lat),
        lon: parseFloat(lng),
        display_name: `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(
          6
        )}`,
        type: "coordinates",
      };
      // Set this as selected location to trigger existing rectangle logic
      dispatch(setSelectedLocation(coordinates));
    }
  }, [searchParams, dispatch]);

  // Get URL parameters
  const isEditMode = searchParams.get("type") === "edit";
  const geofenceId = searchParams.get("id");
  // const matrixMode = searchParams.get("matrix");

  // Rest of your existing functions remain same...
  const handleGeofenceDrawn = (data) => {
    setGeofenceData(data);
  };

  const handleClose = () => {
    window.close();
  };

  const handleSave = () => {
    const formData = activeTab === "detail" ? detailForm : advanceForm;

    const completeData = {
      formData,
      geofenceData,
      timestamp: new Date().toISOString(),
    };

    console.log("Save complete geofence data:", completeData);
    setIsSidebarOpen(false);
  };

  const handleCancel = () => {
    if (activeTab === "detail") {
      setDetailForm({
        geofenceName: "",
        address: "",
        group: "",
        city: "",
        category: "",
        description: "",
      });
    } else {
      setAdvanceForm({
        contactName: "",
        contactPhone: "",
        placeId: "",
        markerColor: "#D52B1E",
        showOn: [],
      });
    }
    setGeofenceData(null);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header - remains same */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 h-[10vh] overflow-hidden relative z-40"
      >
        {/* Header content remains same */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-[#D52B1E]/10 rounded-lg text-[#D52B1E] hover:bg-[#D52B1E]/20 transition-colors"
            >
              <Menu size={20} />
            </motion.button>

            <div className="p-2 bg-[#D52B1E]/10 rounded-lg">
              <MapPin size={24} className="text-[#D52B1E]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Geofence" : "Create Geofence"}
              </h1>
              {isEditMode && geofenceId && (
                <p className="text-sm text-gray-600">
                  Editing Geofence ID: {geofenceId}
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              detailForm={detailForm}
              setDetailForm={setDetailForm}
              advanceForm={advanceForm}
              setAdvanceForm={setAdvanceForm}
              geofenceData={geofenceData}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
          </div>

          {/* Mobile Sidebar - remains same but add urlCoordinates prop */}
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
                      Geofence Settings
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
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      detailForm={detailForm}
                      setDetailForm={setDetailForm}
                      advanceForm={advanceForm}
                      setAdvanceForm={setAdvanceForm}
                      geofenceData={geofenceData}
                      handleSave={handleSave}
                      handleCancel={handleCancel}
                      isMobile={true}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Map Section - pass urlCoordinates */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <GeofenceMap
              mapType={mapType}
              setMapType={setMapType}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onGeofenceDrawn={handleGeofenceDrawn}
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
            className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-[#D52B1E] text-white rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-[#B8241A] transition-colors"
          >
            <Menu size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Status Bar */}
      {geofenceData && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed bottom-20 left-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">
                ✅ {geofenceData.type} Geofence Ready
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
  activeTab,
  setActiveTab,
  detailForm,
  setDetailForm,
  advanceForm,
  setAdvanceForm,
  geofenceData,
  handleSave,
  handleCancel,
  isMobile = false,
}) => {
  return (
    <>
      {/* Tabs remain same */}
      <div className="flex mb-6 space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "detail"
              ? "bg-white text-[#D52B1E] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Detail
        </button>
        <button
          onClick={() => setActiveTab("advance")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "advance"
              ? "bg-white text-[#D52B1E] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Advance Options
        </button>
      </div>

      {/* Tab Content - pass urlCoordinates to DetailTab */}
      {activeTab === "detail" && (
        <DetailTab detailForm={detailForm} setDetailForm={setDetailForm} />
      )}

      {activeTab === "advance" && (
        <AdvanceTab advanceForm={advanceForm} setAdvanceForm={setAdvanceForm} />
      )}

      {/* Rest remains same */}
      {geofenceData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <h4 className="text-sm font-medium text-green-800 mb-2">
            ✅ Geofence Drawn
          </h4>
          <p className="text-xs text-green-600">
            Type: <span className="font-medium">{geofenceData.type}</span>
          </p>
          {geofenceData.area && (
            <p className="text-xs text-green-600">
              Area: <span className="font-medium">{geofenceData.area} km²</span>
            </p>
          )}
        </motion.div>
      )}

      <div
        className={`flex ${
          isMobile ? "flex-col space-y-3" : "justify-end space-x-3"
        } mt-2 pt-2 border-t border-gray-200`}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancel}
          className={`${
            isMobile ? "w-full" : ""
          } px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200`}
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`${
            isMobile ? "w-full" : ""
          } flex items-center justify-center px-6 py-2 bg-[#D52B1E] text-white rounded-lg hover:bg-[#B8241A] transition-colors duration-200`}
        >
          <Save size={16} className="mr-2" />
          Save Geofence
        </motion.button>
      </div>
    </>
  );
};

export default CreateGeofence;
