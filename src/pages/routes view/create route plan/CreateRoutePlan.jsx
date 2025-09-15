import { motion, AnimatePresence } from "framer-motion";
import { Route, X, Menu, ChevronLeft, Settings } from "lucide-react";
import ScheduleTab from "./ScheduleTab";
import { useEffect, useState } from "react";
import Select from "react-select";
import RoutePlanMap from "./RoutePlanMap";
import StopLogTab from "./StopLogTab";
import DeviationsTab from "./DeviationsTab";
import VehicleTreeSelect from "./VehicleTreeSelect";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeConnection,
  selectConnectionStatus,
  selectRawVehicleList,
} from "../../../features/gpsTrackingSlice";
import {
  fetchRouteListForUser,
  selectFilteredRoutes,
} from "../../../features/routeSlice";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const CreateRoutePlan = () => {
  const routesLoading = useSelector(state => state.route.loading);
  // Main content tabs: map, stoplog, deviations
  const [mainTab, setMainTab] = useState("map"); // 'map' by default
  const [activeTab, setActiveTab] = useState("route");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const [planName, setPlanName] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [status, setStatus] = useState("Planned");
  const [comments, setComments] = useState("");
  const routes = useSelector(selectFilteredRoutes);
  const [searchParams] = useSearchParams();

  const connectionStatus = useSelector(selectConnectionStatus);

  // Use only Redux routes
  const sourceRoutes = Array.isArray(routes) ? routes : [];

  useEffect(() => {
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  useEffect(() => {
    dispatch(fetchRouteListForUser());
  }, []);

  const handleClose = () => {
    window.close();
  };

  // Responsive sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Full selected route objects derived from selectedRoutes ids
  const selectedRoutesData = sourceRoutes.filter((r) =>
    selectedRoutes.includes(r.id)
  );

  const isEdit = searchParams.get("edit") === "true";
  const routePlanId = searchParams.get("id");
  
  // Store API vehicle IDs for later matching
  const [apiVehicleIds, setApiVehicleIds] = useState([]);
  
  // Get vehicle tree data
  const rawVehicleList = useSelector(selectRawVehicleList);
  const vehicleTreeData = Array.isArray(rawVehicleList)
    ? rawVehicleList.filter((item) => item.Type === "Vehicle" || item.Type === "Group")
    : [];

  useEffect(() => {
    if (isEdit && routePlanId) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      axios
        .get(
          `${API_BASE_URL}api/geofence/RoutePlanDetails?planid=${routePlanId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const data = res.data;
          console.log("RoutePlanDetails API response:", data);
          // Fill form fields from API response
          if (data && data.RoutePlan) {
            setPlanName(data.RoutePlan.planName || "");
            setComments(data.RoutePlan.comments || "");
            setStatus(data.RoutePlan.status === "P" ? "Planned" : data.RoutePlan.status === "IP" ? "InProcess" : data.RoutePlan.status === "C" ? "Completed" : "Planned");
            setScheduleDate(data.RoutePlan.PlanDate ? data.RoutePlan.PlanDate.slice(0, 16) : ""); // yyyy-MM-ddTHH:mm
            setSelectedRoutes(data.RoutePlan.RouteId ? [parseInt(data.RoutePlan.RouteId)] : []);
          }
          // Store vehicle car IDs from API response
          if (data && data.Vehicles && Array.isArray(data.Vehicles)) {
            const carIds = data.Vehicles.map(v => v.carid ? v.carid.toString() : "");
            setApiVehicleIds(carIds);
          }
        })
        .catch((err) => {
          console.error("RoutePlanDetails API error:", err);
        });
    }
  }, [isEdit, routePlanId]);
  
  // Match API vehicle IDs with vehicleTreeData when both are available (only on initial load)
  useEffect(() => {
    if (apiVehicleIds.length > 0 && vehicleTreeData.length > 0 && selectedVehicles.length === 0) {
      // Find vehicles where valueId matches carid from API
      const selectedIds = vehicleTreeData
        .filter(v => apiVehicleIds.includes(v.valueId ? v.valueId.toString() : ""))
        .map(v => v.id);
      setSelectedVehicles(prev => [...prev, ...selectedIds]);
    }
  }, [apiVehicleIds, vehicleTreeData]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Full page loading overlay for route dropdown */}
      {routesLoading && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#25689f] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-[#25689f] font-semibold text-lg">Loading routes...</span>
          </div>
        </div>
      )}
      {/* Header with main tabs on right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200 px-3 py-4 overflow-hidden relative z-40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="cursor-pointer lg:hidden flex items-center justify-center w-8 h-8 bg-[#25689f]/10 rounded-md text-[#25689f] hover:bg-[#25689f]/20 transition-colors"
            >
              <Menu size={16} />
            </motion.button>
            <div className="p-1.5 bg-[#25689f]/10 rounded-md">
              <Route size={18} className="text-[#25689f]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                {isEdit ? "Edit Route Plan" : "Create Route Plan"}
              </h1>
            </div>
          </div>
          {/* Main tabs on right: Stop Log & Deviations only in edit mode */}
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none ${mainTab === "map" ? "bg-[#25689f]/10 text-[#25689f] shadow" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMainTab("map")}
            >
              Map
            </button>
            {isEdit && (
              <>
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none ${mainTab === "stoplog" ? "bg-[#25689f]/10 text-[#25689f] shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setMainTab("stoplog")}
                >
                  Stop Log
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none ${mainTab === "deviations" ? "bg-[#25689f]/10 text-[#25689f] shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setMainTab("deviations")}
                >
                  Deviations
                </button>
              </>
            )}
          </div>
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="cursor-pointer flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              <X size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content: switch by mainTab */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 h-[91vh]">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200">
            <SidebarContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              planName={planName}
              setPlanName={setPlanName}
              selectedRoutes={selectedRoutes}
              setSelectedRoutes={setSelectedRoutes}
              selectedVehicles={selectedVehicles}
              setSelectedVehicles={setSelectedVehicles}
              scheduleDate={scheduleDate}
              setScheduleDate={setScheduleDate}
              status={status}
              setStatus={setStatus}
              comments={comments}
              setComments={setComments}
              sourceRoutes={sourceRoutes}
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
                      Route Plan Settings
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSidebar}
                      className="cursor-pointer p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </motion.button>
                  </div>

                  <SidebarContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    planName={planName}
                    setPlanName={setPlanName}
                    selectedRoutes={selectedRoutes}
                    setSelectedRoutes={setSelectedRoutes}
                    selectedVehicles={selectedVehicles}
                    setSelectedVehicles={setSelectedVehicles}
                    scheduleDate={scheduleDate}
                    setScheduleDate={setScheduleDate}
                    status={status}
                    setStatus={setStatus}
                    comments={comments}
                    setComments={setComments}
                    sourceRoutes={sourceRoutes}
                    isMobile={true}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area: switch by mainTab, StopLogTab/DeviationsTab only in edit mode */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            {mainTab === "map" && <RoutePlanMap selectedRoutesData={selectedRoutesData} />}
            {mainTab === "stoplog" && (
              isEdit ? <StopLogTab /> : <div className="flex items-center justify-center h-full text-lg text-gray-400">Stop Log only available in edit mode.</div>
            )}
            {mainTab === "deviations" && (
              isEdit ? <DeviationsTab /> : <div className="flex items-center justify-center h-full text-lg text-gray-400">Deviations only available in edit mode.</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// SidebarContent component for sidebar fields and tabs
const SidebarContent = ({
  activeTab,
  setActiveTab,
  planName,
  setPlanName,
  selectedRoutes,
  setSelectedRoutes,
  selectedVehicles,
  setSelectedVehicles,
  scheduleDate,
  setScheduleDate,
  status,
  setStatus,
  comments,
  setComments,
  sourceRoutes,
  dummyVehicles,
  isMobile = false,
}) => {
  // For react-select multi-select
  // sourceRoutes is passed in from parent (Redux or fallback)
  const routeOptions = sourceRoutes.map((route) => ({
    value: route.id,
    label: (route.routeName || route.name || `Route ${route.id}`)
      .toString()
      .trim(),
  }));

  // Single select handler
  const handleRouteChange = (selectedOption) => {
    setSelectedRoutes(selectedOption ? [selectedOption.value] : []);
  };
  // VehicleTreeSelect for vehicles
  const rawVehicleList = useSelector(selectRawVehicleList);
  // Only vehicles (not groups)
  const vehicleTreeData = Array.isArray(rawVehicleList)
    ? rawVehicleList.filter(
        (item) => item.Type === "Vehicle" || item.Type === "Group"
      )
    : [];

  const handleVehicleTreeChange = (value) => {
    setSelectedVehicles(value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-1 m-4 rounded-lg">
        <button
          onClick={() => setActiveTab("route")}
          className={`cursor-pointer flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "route"
              ? "bg-white text-[#25689f] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Route size={16} className="mr-2" />
          Route
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`cursor-pointer flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "schedule"
              ? "bg-white text-[#25689f] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Settings size={16} className="mr-2" />
          Schedule
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {activeTab === "route" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] placeholder-gray-400"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <Select
                isMulti={false}
                options={routeOptions}
                value={
                  routeOptions.find((opt) => selectedRoutes[0] === opt.value) ||
                  null
                }
                onChange={handleRouteChange}
                classNamePrefix="react-select"
                placeholder="Select route..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    borderColor: state.isFocused ? "#1e4a6f" : "#d1d5db",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px #1e4a6f33"
                      : undefined,
                    minHeight: "40px",
                  }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicles
              </label>
              <VehicleTreeSelect
                value={selectedVehicles}
                onChange={handleVehicleTreeChange}
                placeholder="Select vehicles"
                multiple={true}
                treeData={vehicleTreeData}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] placeholder-gray-400"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                placeholder="Select date and time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] placeholder-gray-400"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Planned">Planned</option>
                <option value="InProcess">In Process</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e4a6f] focus:border-[#1e4a6f] placeholder-gray-400"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Enter comments (optional)"
              />
            </div>
          </div>
        )}
        {activeTab === "schedule" && <ScheduleTab />}
      </div>

      {/* Footer Buttons */}
      <div
        className={`flex ${
          isMobile ? "flex-col space-y-3" : "justify-end gap-3"
        } p-4 border-t border-gray-100`}
      >
        <button className="cursor-pointer text-[#1e4a6f] hover:underline font-medium">
          Cancel
        </button>
        <button className="cursor-pointer bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white px-4 py-2 rounded-lg hover:from-[#1F557F] hover:to-[#184567] font-semibold shadow-md hover:shadow-lg transition-all">
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateRoutePlan;
