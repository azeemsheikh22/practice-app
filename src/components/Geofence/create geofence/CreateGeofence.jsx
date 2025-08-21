import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Save, X, Menu, ChevronLeft } from "lucide-react";
import GeofenceMap from "./GeofenceMap";
import DetailTab from "./DetailTab";
import AdvanceTab from "./AdvanceTab";
import { useSearchParams } from "react-router-dom";
import { setSelectedLocation } from "../../../features/locationSearchSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategoryForDrawing } from "../../../features/geofenceSlice";
import axios from "axios";
import {
  initializeConnection,
  selectConnectionStatus,
} from "../../../features/gpsTrackingSlice";

const CreateGeofence = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("detail");
  const [mapType, setMapType] = useState("street");
  const [activeTool, setActiveTool] = useState(null);
  const [geofenceData, setGeofenceData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [EditGeofenceData, setEditGeofenceData] = useState(null);
  const dispatch = useDispatch();
  const { geofenceCatList } = useSelector((state) => state.geofence);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Get URL parameters (move above all useEffects)
  const isEditMode = searchParams.get("type") === "edit";
  const geofenceId = searchParams.get("id");

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
    markerColor: "#25689f", // ✅ Changed default color to blue theme
    showOn: [],
  });

  // Auto-fill advanceForm in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      EditGeofenceData &&
      Array.isArray(EditGeofenceData) &&
      EditGeofenceData.length > 0
    ) {
      const data = EditGeofenceData[0];
      // Marker color mapping
      const markerColorMap = {
        Red: "#D52B1E",
        Purple: "#8B5CF6",
        Blue: "#3B82F6",
      };
      let markerColor =
        markerColorMap[data.MarkerColor] || data.MarkerColor || "#25689f";
      // ShowOn array
      let showOn = [];
      if (data.chkShowOnMap === "true" || data.chkShowOnMap === true)
        showOn.push("map");
      if (data.chkAddress === "true" || data.chkAddress === true)
        showOn.push("address");
      setAdvanceForm({
        contactName: data.contactName || "",
        contactPhone: data.contactPhone || "",
        placeId: data.placeID || data.placeId || "",
        markerColor,
        showOn,
      });
    }
  }, [isEditMode, EditGeofenceData]);

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

  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  // const geofenceName = searchParams.get("geofenceName");

  // Fetch metrics data when selectedTimeFilter or geoid changes
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}api/Geofence/Geofence`,
          {
            params: {
              geoid: geofenceId,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEditGeofenceData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching geofence metrics:", error);
        setEditGeofenceData(null);
      }
    };

    fetchMetrics();
  }, [geofenceId]);

  // Set selected category for drawing when edit data loads
  useEffect(() => {
    if (
      EditGeofenceData &&
      Array.isArray(EditGeofenceData) &&
      EditGeofenceData.length > 0 &&
      geofenceCatList &&
      geofenceCatList.length > 0
    ) {
      const data = EditGeofenceData[0];
      // Find the category object matching the edit data's category
      let catId =
        data.CategoryValue ||
        data.category ||
        data.category_id ||
        data.categoryId ||
        data.category_id_fk;
      if (catId) {
        const foundCat = geofenceCatList.find(
          (cat) => cat.id?.toString() === catId.toString()
        );
        if (foundCat) {
          dispatch(setSelectedCategoryForDrawing(foundCat));
        }
      }
    }
  }, [EditGeofenceData, geofenceCatList, dispatch]);

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
        markerColor: "#25689f", // ✅ Reset to blue theme
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
      {/* Header - Reduced height and padding to match CreateRoute */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-3 py-2 sm:py-3 overflow-hidden relative z-40"
      >
        {/* Responsive Header content */}
        <div className="flex items-center justify-between w-full min-h-[48px]">
          {/* Left: Sidebar toggle, icon, title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-9 h-9 bg-[#25689f]/10 rounded-md text-[#25689f] hover:bg-[#25689f]/20 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </motion.button>
            <div className="p-1 bg-[#25689f]/10 rounded-md flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#25689f]" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[60vw] sm:max-w-xs">
                {isEditMode ? "Edit Geofence" : "Create Geofence"}
              </h1>
              {/* Show geofence name in header if edit mode and data available */}
              {isEditMode &&
                EditGeofenceData &&
                Array.isArray(EditGeofenceData) &&
                EditGeofenceData.length > 0 && (
                  <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[60vw] sm:max-w-xs">
                    <span className="font-medium">Name:</span>{" "}
                    {EditGeofenceData[0].geofenceName || "-"}
                  </div>
                )}
            </div>
          </div>
          {/* Right: Close button */}
          <div className="flex items-center justify-end flex-shrink-0 ml-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="flex items-center px-2 sm:px-3 py-2 cursor-pointer bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[92vh]">
          {/* Desktop Sidebar - Reduced padding */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200">
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
              isEditMode={isEditMode}
              EditGeofenceData={EditGeofenceData}
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
                  className="lg:hidden fixed left-0 top-0 h-full w-[350px] bg-white shadow-2xl z-[10000] overflow-auto"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-medium text-gray-900">
                      Geofence Settings
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSidebar}
                      className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </motion.button>
                  </div>

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
                    isEditMode={isEditMode}
                    EditGeofenceData={EditGeofenceData}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Map Section */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <GeofenceMap
              mapType={mapType}
              setMapType={setMapType}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onGeofenceDrawn={handleGeofenceDrawn}
              editMode={isEditMode}
              editGeofenceData={EditGeofenceData}
            />
          </div>
        </div>
      </motion.div>
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
  isEditMode = false,
  EditGeofenceData = null,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Tabs - Updated with blue theme and compact design */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-1 m-4 rounded-lg">
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
            activeTab === "detail"
              ? "bg-white text-[#25689f] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Detail
        </button>
        <button
          onClick={() => setActiveTab("advance")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer duration-200 ${
            activeTab === "advance"
              ? "bg-white text-[#25689f] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Advance Options
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === "detail" && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DetailTab
                detailForm={detailForm}
                setDetailForm={setDetailForm}
                editMode={isEditMode}
                editGeofenceData={EditGeofenceData}
              />
            </motion.div>
          )}

          {activeTab === "advance" && (
            <motion.div
              key="advance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <AdvanceTab
                advanceForm={advanceForm}
                setAdvanceForm={setAdvanceForm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Geofence Status - Updated with blue theme and compact design */}
      {geofenceData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 bg-[#25689f]/10 border border-[#25689f]/20 rounded-lg"
        >
          <h4 className="text-sm font-medium text-[#25689f] mb-1">
            ✅ Geofence Drawn
          </h4>
          <p className="text-xs text-[#1F557F]">
            Type: <span className="font-medium">{geofenceData.type}</span>
          </p>
          {geofenceData.area && (
            <p className="text-xs text-[#1F557F]">
              Area: <span className="font-medium">{geofenceData.area} km²</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Action Buttons - Enhanced and compact */}
      <div
        className={`flex ${
          isMobile ? "flex-col space-y-3" : "flex-col space-y-3"
        } p-4 pt-0`}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`${
            isMobile ? "w-full" : ""
          } flex items-center justify-center cursor-pointer px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white rounded-xl hover:from-[#1F557F] hover:to-[#184567] transition-all duration-200 shadow-md hover:shadow-lg`}
        >
          <Save size={16} className="mr-2" />
          Save Geofence
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancel}
          className={`${
            isMobile ? "w-full" : ""
          } px-4 py-3 text-sm font-semibold cursor-pointer border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};

export default CreateGeofence;
