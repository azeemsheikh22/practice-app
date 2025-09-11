
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Save, X, Menu, ChevronLeft, Settings } from "lucide-react";
import RouteMap from "./RouteMap";
import RouteDetailTab from "./RouteDetailTab";
import OptionsTab from "./OptionsTab"; // New component
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  setCurrentRoute,
  setRouteCalculationData,
} from "../../../features/routeSlice";


const CreateRoute = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [activeTab, setActiveTab] = useState("route"); // New state for tab management
  const dispatch = useDispatch();

  // API base URL and token (match CreateGeofence.jsx)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Edit mode: fetch route data if edit=true and id is present (axios, token, base url)
  useEffect(() => {
    const isEdit = searchParams.get("edit") === "true";
    const routeId = searchParams.get("id");
    if (isEdit && routeId) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}api/Geofence/Route`,
            {
              params: { routeid: routeId },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const dataArr = response.data;
          if (Array.isArray(dataArr) && dataArr.length > 0) {
            const data = dataArr[0];
            // Parse waypoints: origin, waypoints, destination
            const waypointsArr = [];
            // Origin
            if (data.originLatLng) {
              const [olat, olng] = data.originLatLng.split(" ").map(Number);
              waypointsArr.push({ id: 1, location: `${olat}, ${olng}` });
            }
            // Waypoints (pipe-separated)
            if (data.waypoints) {
              const wps = data.waypoints.split("|").filter(Boolean);
              wps.forEach((wp, idx) => {
                const [lat, lng] = wp.split(" ").map(Number);
                waypointsArr.push({ id: waypointsArr.length + 1, location: `${lat}, ${lng}` });
              });
            }
            // Destination
            if (data.destinationLatLng) {
              const [dlat, dlng] = data.destinationLatLng.split(" ").map(Number);
              waypointsArr.push({ id: waypointsArr.length + 1, location: `${dlat}, ${dlng}` });
            }

            // Set form fields
            setRouteForm((prev) => ({
              ...prev,
              routeName: data.routeName || "",
              waypoints: waypointsArr.length > 1 ? waypointsArr : prev.waypoints,
              // You can add more fields if needed
            }));
          }
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };
      fetchRoute();
    }
  }, [searchParams, API_BASE_URL, token]);

  const [routeForm, setRouteForm] = useState(() => {
    // Get coordinates from URL if present
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    let firstLocation = "";
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      firstLocation = `${parseFloat(lat)}, ${parseFloat(lng)}`;
    }
    return {
      routeName: "",
      waypoints: [
        { id: 1, location: firstLocation },
        { id: 2, location: "" },
      ],
      options: {
        formType: "location", // "location" or "geofence"
      }
    };
  });

  // Get URL parameters
  const isEditMode = searchParams.get("edit");
  const routeId = searchParams.get("id");

  // Update handleRouteCalculated function
  const handleRouteCalculated = (data) => {
    setRouteData(data);
    dispatch(setRouteCalculationData(data));
  };

  // Update the handleAddLocationToRoute function to support insertion at specific index
  const handleAddLocationToRoute = (coordinates, insertIndex = null) => {
    if (insertIndex !== null) {
      // Insert at specific position
      const newWaypoint = {
        id: routeForm.waypoints.length + 1,
        location: coordinates,
      };

      const updatedWaypoints = [...routeForm.waypoints];
      updatedWaypoints.splice(insertIndex, 0, newWaypoint);

      // Renumber waypoints
      const renumberedWaypoints = updatedWaypoints.map((wp, index) => ({
        ...wp,
        id: index + 1,
      }));

      setRouteForm({
        ...routeForm,
        waypoints: renumberedWaypoints,
      });
    } else {
      // Original logic for adding to end or filling empty waypoint
      const emptyWaypoint = routeForm.waypoints.find(
        (wp) => !wp.location || wp.location.trim() === ""
      );

      if (emptyWaypoint) {
        const updatedWaypoints = routeForm.waypoints.map((wp) =>
          wp.id === emptyWaypoint.id ? { ...wp, location: coordinates } : wp
        );
        setRouteForm({
          ...routeForm,
          waypoints: updatedWaypoints,
        });
      } else {
        const newWaypoint = {
          id: routeForm.waypoints.length + 1,
          location: coordinates,
        };
        setRouteForm({
          ...routeForm,
          waypoints: [...routeForm.waypoints, newWaypoint],
        });
      }
    }
  };

  // New function to handle waypoint location changes from dragging markers
  const handleWaypointLocationChange = (waypointId, newLocation) => {
    const updatedWaypoints = routeForm.waypoints.map(wp => 
      wp.id === waypointId 
        ? { ...wp, location: newLocation } 
        : wp
    );
    
    setRouteForm({
      ...routeForm,
      waypoints: updatedWaypoints,
    });
    
    // Show a small notification that waypoint was updated
    const successDiv = document.createElement("div");
    successDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease-out;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Waypoint ${waypointId} location updated!
      </div>
    `;

    if (!document.getElementById("waypoint-update-animation")) {
      const style = document.createElement("style");
      style.id = "waypoint-update-animation";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.firstElementChild.style.animation = "slideOutRight 0.3s ease-in";
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, 2000);
  };

  // Add this useEffect to watch for waypoint changes and trigger route recalculation
  useEffect(() => {
    // Trigger route recalculation when waypoints order changes
    if (routeForm.waypoints && routeForm.waypoints.length >= 2) {
      const validWaypoints = routeForm.waypoints.filter(
        (wp) => wp.location && wp.location.trim()
      );
      if (validWaypoints.length >= 2) {
        // Small delay to allow UI to update before recalculating
        const timeoutId = setTimeout(() => {
          console.log("Waypoints reordered, recalculating route...");
        }, 300);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [routeForm.waypoints]);

  const handleClose = () => {
    window.close();
  };

  const handleSave = () => {
    const completeData = {
      formData: routeForm,
      routeData,
      timestamp: new Date().toISOString(),
    };
    setIsSidebarOpen(false);
  };

  // Add this new function for route optimization
  const optimizeWaypointOrder = async (waypoints) => {
    if (waypoints.length < 3) return waypoints; // No need to optimize if less than 3 points

    try {
      // Extract coordinates from waypoints
      const coordinates = [];
      for (const waypoint of waypoints) {
        if (waypoint.location && waypoint.location.trim()) {
          // Parse coordinates or geocode
          const coords = waypoint.location
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            coordinates.push({
              lat: coords[0],
              lng: coords[1],
              id: waypoint.id,
            });
          }
        }
      }

      if (coordinates.length < 3) return waypoints;

      // Keep first and last points fixed, optimize middle points
      const start = coordinates[0];
      const end = coordinates[coordinates.length - 1];
      const middlePoints = coordinates.slice(1, -1);

      if (middlePoints.length === 0) return waypoints;

      // Simple optimization: sort middle points by distance from start
      const optimizedMiddle = middlePoints.sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.lat - start.lat, 2) + Math.pow(a.lng - start.lng, 2)
        );
        const distB = Math.sqrt(
          Math.pow(b.lat - start.lat, 2) + Math.pow(b.lng - start.lng, 2)
        );
        return distA - distB;
      });

      // Reconstruct optimized waypoints
      const optimizedOrder = [start, ...optimizedMiddle, end];

      // Map back to original waypoint format with new order
      const optimizedWaypoints = optimizedOrder.map((coord, index) => ({
        id: index + 1,
        location: `${coord.lat}, ${coord.lng}`,
      }));

      return optimizedWaypoints;
    } catch (error) {
      console.error("Route optimization error:", error);
      return waypoints; // Return original if optimization fails
    }
  };

  // Update the existing handleOptimizeRoute function
  const handleOptimizeRoute = async () => {
    if (!routeForm.waypoints || routeForm.waypoints.length < 2) {
      alert("Need at least 2 waypoints to optimize the route");
      return;
    }

    // Show loading state
    const validWaypoints = routeForm.waypoints.filter(
      (wp) => wp.location && wp.location.trim()
    );

    if (validWaypoints.length < 2) {
      alert("Please add at least 2 valid locations to optimize");
      return;
    }

    try {
      // Show optimization in progress
      console.log("Optimizing route...");

      // Get optimized waypoint order
      const optimizedWaypoints = await optimizeWaypointOrder(validWaypoints);

      // Update route form with optimized waypoints
      setRouteForm({
        ...routeForm,
        waypoints: optimizedWaypoints,
      });

      // Show success message
      showOptimizationSuccessMessage();
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("Route optimization failed. Please try again.");
    }
  };

  // Add this new function for showing optimization success
  const showOptimizationSuccessMessage = () => {
    const successDiv = document.createElement("div");
    successDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideInRight 0.3s ease-out;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Route optimized successfully!
    </div>
  `;

    if (!document.getElementById("optimize-success-animation")) {
      const style = document.createElement("style");
      style.id = "optimize-success-animation";
      style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
      document.head.appendChild(style);
    }

    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.firstElementChild.style.animation =
        "slideOutRight 0.3s ease-in";
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, 3000);
  };

  // Update handleClearAll function
  const handleClearAll = () => {
    // Clear form data
    setRouteForm({
      routeName: "",
      waypoints: [
        { id: 1, location: "" },
        { id: 2, location: "" },
      ],
      options: {
        formType: "location",
      }
    });

    // Clear route data
    setRouteData(null);

    // Clear Redux state
    dispatch(setRouteCalculationData(null));
    dispatch(setCurrentRoute(null));

    setIsSidebarOpen(false);

    // Force re-render by updating waypoints
    setTimeout(() => {
      setRouteForm((prev) => ({
        ...prev,
        waypoints: [
          { id: 1, location: "" },
          { id: 2, location: "" },
        ],
      }));

      // Refresh the page after clearing everything
      window.location.reload();
    }, 100);
  };


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header - Reduced height and padding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200 px-3 py-4  overflow-hidden relative z-40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-8 h-8 bg-[#25689f]/10 rounded-md text-[#25689f] hover:bg-[#25689f]/20 transition-colors"
            >
              <Menu size={16} />
            </motion.button>

            <div className="p-1.5 bg-[#25689f]/10 rounded-md">
              <Route size={18} className="text-[#25689f]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit Route" : "Create Route"}
              </h1>
              {isEditMode && routeId && (
                <p className="text-xs text-gray-500">ID: {routeId}</p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="flex items-center px-3 py-2 cursor-pointer bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
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
          {/* Desktop Sidebar - Reduced padding */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200">
            <SidebarContent
              routeForm={routeForm}
              setRouteForm={setRouteForm}
              routeData={routeData}
              handleSave={handleSave}
              handleClearAll={handleClearAll}
              handleOptimizeRoute={handleOptimizeRoute}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
                      Route Settings
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
                    routeForm={routeForm}
                    setRouteForm={setRouteForm}
                    routeData={routeData}
                    handleSave={handleSave}
                    handleClearAll={handleClearAll}
                    handleOptimizeRoute={handleOptimizeRoute}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isMobile={true}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Map Section */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <RouteMap
              waypoints={routeForm.waypoints || []}
              onRouteCalculated={handleRouteCalculated}
              onAddLocationToRoute={handleAddLocationToRoute}
              onWaypointLocationChange={handleWaypointLocationChange} // Add this new prop
            />
          </div>
        </div>
      </motion.div>

    </div>
  );
};

// Updated SidebarContent component with tabs
const SidebarContent = ({
  routeForm,
  setRouteForm,
  handleSave,
  handleClearAll,
  handleOptimizeRoute,
  activeTab,
  setActiveTab,
  isMobile = false,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimizeClick = async () => {
    setIsOptimizing(true);
    await handleOptimizeRoute();
    setIsOptimizing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50 p-1 m-4 rounded-lg">
        <button
          onClick={() => setActiveTab("route")}
          className={`flex-1 flex cursor-pointer items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "route"
            ? "bg-white text-[#25689f] shadow-sm"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          <Route size={16} className="mr-2" />
          Route
        </button>
        <button
          onClick={() => setActiveTab("options")}
          className={`flex-1 cursor-pointer flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "options"
            ? "bg-white text-[#25689f] shadow-sm"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          <Settings size={16} className="mr-2" />
          Options
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === "route" && (
            <motion.div
              key="route"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RouteDetailTab
                routeForm={routeForm}
                setRouteForm={setRouteForm}
                formType={routeForm.options?.formType || "location"}
              />
            </motion.div>
          )}

          {activeTab === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <OptionsTab routeForm={routeForm} setRouteForm={setRouteForm} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className={`flex ${isMobile ? "flex-col space-y-3" : "flex-col space-y-3"} p-4 pt-0`}>
        <motion.button
          whileHover={{ scale: isOptimizing ? 1 : 1.02 }}
          whileTap={{ scale: isOptimizing ? 1 : 0.98 }}
          onClick={handleOptimizeClick}
          disabled={isOptimizing}
          className={`${isMobile ? "w-full" : ""
            } flex items-center cursor-pointer justify-center px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white rounded-xl hover:from-[#1F557F] hover:to-[#184567] transition-all duration-200 shadow-md hover:shadow-lg ${isOptimizing ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isOptimizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Route size={16} className="mr-2" />
              Optimize Route
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`${isMobile ? "w-full" : ""
            } flex items-center justify-center cursor-pointer px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white rounded-xl hover:from-[#1F557F] hover:to-[#184567] transition-all duration-200 shadow-md hover:shadow-lg`}
        >
          <Save size={16} className="mr-2" />
          Save Route
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearAll}
          className={`${isMobile ? "w-full" : ""
            } px-4 py-3 text-sm font-semibold cursor-pointer border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
        >
          Clear All
        </motion.button>
      </div>
    </div>
  );
};

export default CreateRoute;
