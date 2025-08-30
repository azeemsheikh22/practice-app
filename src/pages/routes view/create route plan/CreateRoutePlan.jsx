import { motion, AnimatePresence } from "framer-motion";
import { Route, Save, X, Menu, ChevronLeft, Settings } from "lucide-react";
import ScheduleTab from "./ScheduleTab";
import { useEffect, useState } from "react";
import Select from "react-select";
import RoutePlanMap from "./RoutePlanMap";
import VehicleTreeSelect from "./VehicleTreeSelect";
import { useDispatch, useSelector } from "react-redux";
import { initializeConnection, selectConnectionStatus, selectRawVehicleList } from "../../../features/gpsTrackingSlice";

const CreateRoutePlan = () => {
  const [activeTab, setActiveTab] = useState("route");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const [planName, setPlanName] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [status, setStatus] = useState("Planned");
  const [comments, setComments] = useState("");

  // Dummy data for routes and vehicles
  const dummyRoutes = [
    { id: 1, name: "Motorway~ M1_UP" },
    { id: 2, name: "Motorway~ M1_DN" },
    { id: 3, name: "Motorway~ M2_UP" },
    { id: 4, name: "Motorway~ M2_DN" },
    { id: 5, name: "Motorway~ M3_UP" },
  ];
  const dummyVehicles = [
    { id: 1, name: "Vehicle 1" },
    { id: 2, name: "Vehicle 2" },
    { id: 3, name: "Vehicle 3" },
  ];

  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  const handleClose = () => {
    window.close();
  };

  // Responsive sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
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
                Create Route Plan
              </h1>
            </div>
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

      {/* Main Content */}
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
              dummyRoutes={dummyRoutes}
              dummyVehicles={dummyVehicles}
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
                    dummyRoutes={dummyRoutes}
                    dummyVehicles={dummyVehicles}
                    isMobile={true}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area: Map */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <RoutePlanMap />
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
  dummyRoutes,
  dummyVehicles,
  isMobile = false,
}) => {
  // For react-select multi-select
  const routeOptions = dummyRoutes.map((route) => ({
    value: route.id,
    label: route.name,
  }));

  const handleRouteChange = (selectedOptions) => {
    setSelectedRoutes(
      selectedOptions ? selectedOptions.map((opt) => opt.value) : []
    );
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
                Routes
              </label>
              <Select
                isMulti
                options={routeOptions}
                value={routeOptions.filter((opt) =>
                  selectedRoutes.includes(opt.value)
                )}
                onChange={handleRouteChange}
                classNamePrefix="react-select"
                placeholder="Select routes..."
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
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#e3eaf6",
                    borderRadius: "0.375rem",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#1e4a6f",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#1e4a6f",
                    ":hover": { backgroundColor: "#c7d7ee", color: "#1e4a6f" },
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
