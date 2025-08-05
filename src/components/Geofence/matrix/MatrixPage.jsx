import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, X, Menu, ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import MatrixSidebar from "./MatrixSidebar";
import MatrixTable from "./MatrixTable";

const MatrixPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("today");
  const [metricsData, setMetricsData] = useState(null);
  const [matrixTableData, setMatrixTableData] = useState(null);
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const location = useLocation();

  // Parse geofenceId from URL query parameters using router location
  const getGeofenceIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("geofenceId"); // default to 9274 if not present
  };

  const getGeofenceNameFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("geofenceName") || "Geofence Matrix";
  };

  const geoid = getGeofenceIdFromUrl();
  const geofenceName = getGeofenceNameFromUrl();


  // console.log(geoid)

  const handleClose = () => {
    window.close();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Helper function to get date range based on selectedTimeFilter
  const getDateRange = (filter) => {
    const now = new Date();
    let fromDate, toDate;

    switch (filter) {
      case "today": {
        // Always use today's date for both from and to
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      case "this_week": {
        const day = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - day);
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, "0");
        const dayStr = String(start.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${dayStr} 00:00:00`;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const endYear = end.getFullYear();
        const endMonth = String(end.getMonth() + 1).padStart(2, "0");
        const endDay = String(end.getDate()).padStart(2, "0");
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      case "last_week": {
        const lastWeekDay = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - lastWeekDay - 7);
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, "0");
        const dayStr = String(start.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${dayStr} 00:00:00`;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const endYear = end.getFullYear();
        const endMonth = String(end.getMonth() + 1).padStart(2, "0");
        const endDay = String(end.getDate()).padStart(2, "0");
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      case "yesterday": {
        // Use yesterday's date for both from and to
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, "0");
        const day = String(yesterday.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      default: {
        // For custom month filters like "june_2025"
        const [monthName, year] = filter.split("_");
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        const startYear = start.getFullYear();
        const startMonth = String(start.getMonth() + 1).padStart(2, "0");
        const startDay = String(start.getDate()).padStart(2, "0");
        const endYear = end.getFullYear();
        const endMonth = String(end.getMonth() + 1).padStart(2, "0");
        const endDay = String(end.getDate()).padStart(2, "0");
        fromDate = `${startYear}/${startMonth}/${startDay} 00:00:00`;
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
    }

    return {
      from: fromDate,
      to: toDate,
    };
  };

  // Fetch metrics data when selectedTimeFilter or geoid changes
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { from, to } = getDateRange(selectedTimeFilter);

        const response = await axios.get(
          `${API_BASE_URL}api/geofence/GeofenceMatrics`,
          {
            params: {
              geoid,
              datefrom: from,
              dateto: to,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMetricsData(response.data);
      } catch (error) {
        console.error("Error fetching geofence metrics:", error);
        setMetricsData(null);
      }
    };

    fetchMetrics();
  }, [selectedTimeFilter, geoid]);

  // Fetch matrix table data when selectedTimeFilter or geoid changes
  useEffect(() => {
    const fetchMatrixTableData = async () => {
      try {
        const { from, to } = getDateRange(selectedTimeFilter);

        const response = await axios.get(
          `${API_BASE_URL}api/geofence/GeofenceStops`,
          {
            params: {
              geoid,
              datefrom: from,
              dateto: to,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMatrixTableData(response.data);
      } catch (error) {
        console.error("Error fetching geofence stops:", error);
        setMatrixTableData(null);
      }
    };

    fetchMatrixTableData();
  }, [selectedTimeFilter, geoid]);

  return (
    <div className=" bg-gray-50 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-sm border-b border-gray-200  px-2 h-[10vh] overflow-hidden relative z-40"
      >
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-8 h-8 bg-[#D52B1E]/10 rounded-md text-[#D52B1E] hover:bg-[#D52B1E]/20 transition-colors"
            >
              <Menu size={20} />
            </motion.button>

            <div className="p-2 bg-[#D52B1E]/10 rounded-lg">
              <MapPin size={24} className="text-[#D52B1E]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                {geofenceName}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="flex items-center px-3 py-2 cursor-pointer bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
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
        className="relative h-[90vh] overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200">
            <MatrixSidebar
              selectedTimeFilter={selectedTimeFilter}
              setSelectedTimeFilter={setSelectedTimeFilter}
              metricsData={metricsData}
            />
          </div>

          {/* Mobile Sidebar */}
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
                    Matrix Analytics
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

                <MatrixSidebar
                  selectedTimeFilter={selectedTimeFilter}
                  setSelectedTimeFilter={setSelectedTimeFilter}
                  isMobile={true}
                  metricsData={metricsData}
                />
              </motion.div>
            </>
          )}

          {/* Table Section */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <MatrixTable selectedTimeFilter={selectedTimeFilter} matrixTableData={matrixTableData} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatrixPage;
