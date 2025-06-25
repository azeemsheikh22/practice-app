import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Car, RefreshCw, Download, FileText } from "lucide-react";
import {
  setActiveFilter,
  clearFilter,
  setDashboardData,
} from "../../features/liveDashboardSlice";

const LiveDashboardHeader = () => {
  const dispatch = useDispatch();
  const {
    dashboardStats = [],
    totalVehicles = 0,
    activeFilter = null,
    loading = false,
    lastUpdated = null,
    dashboardData = [],
  } = useSelector((state) => state.liveDashboard || {});

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Icon Component (using image URLs)
  const DynamicIcon = ({ iconUrl, alt }) => (
    <img
      src={iconUrl}
      alt={alt}
      className="w-7 h-7 object-contain"
      onError={(e) => {
        // Fallback to default icon if image not found
        e.target.src = "https://via.placeholder.com/20x20?text=?";
      }}
    />
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setTimeout(() => {
        // Re-dispatch dashboard data to refresh
        dispatch(setDashboardData(dashboardData));
        setIsRefreshing(false);
      }, 2000);
    } catch (error) {
      console.error("Refresh failed:", error);
      setIsRefreshing(false);
    }
  };

  const handleExport = (type) => {
    console.log(`Exporting ${type}...`);
  };

  const handleCardClick = (statId) => {
    if (activeFilter === statId) {
      dispatch(clearFilter());
    } else {
      dispatch(setActiveFilter(statId));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, scale: 1.02 },
  };

  return (
    <div className="space-y-6">
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200"
>
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    {/* Left Section */}
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-[#D52B1E]/10 rounded-lg border border-[#D52B1E]/20">
        <Car className="w-5 h-5 sm:w-6 sm:h-6 text-[#D52B1E]" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">
          LIVE DASHBOARD
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-sm space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-[#D52B1E] rounded-full animate-pulse"></div>
            <span className="text-gray-600">Live Active</span>
          </div>
          <span className="text-gray-500">
            {currentTime.toLocaleTimeString()}
          </span>
          {lastUpdated && (
            <span className="text-gray-400 text-xs">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Right Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 text-center w-full sm:w-auto">
        <div className="text-xl sm:text-2xl font-bold text-gray-800">
          {totalVehicles}
        </div>
        <div className="text-xs text-gray-600">Total Vehicles</div>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-600 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
        <button
          onClick={() => handleExport("csv")}
          className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
          title="Export CSV"
        >
          <FileText className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => handleExport("excel")}
          className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
          title="Export Excel"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  </div>
</motion.div>


      {/* Dashboard Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            onClick={() => handleCardClick(stat.id)}
            className={`relative bg-white border rounded-lg p-4 cursor-pointer group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
              activeFilter === stat.id
                ? `border-[#D52B1E] border-2 bg-red-50`
                : `border-gray-200 border`
            }`}
          >
            {/* Active Filter Indicator */}
            {activeFilter === stat.id && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-[#D52B1E] rounded-full"></div>
            )}

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
                <div className="w-full h-full bg-gray-600 rounded-full"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-white flex items-center justify-center">
                  <DynamicIcon iconUrl={stat.icon} alt={stat.label} />
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {stat.count}
                </div>
              </div>

              {/* Label */}
              <div className="mb-2">
                <h3 className="font-semibold text-gray-600 text-sm">
                  {stat.label}
                </h3>
                <p className="text-xs text-gray-600 mt-1">{stat.subLabel}</p>
              </div>

              {/* Click indicator */}
              <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to filter
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#D52B1E]" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* No Stats Message */}
      {!loading && dashboardStats.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <div className="text-gray-500 text-lg font-medium mb-2">
            No dashboard statistics available
          </div>
          <div className="text-gray-400 text-sm">
            Vehicle data is required to generate dashboard statistics
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDashboardHeader;
