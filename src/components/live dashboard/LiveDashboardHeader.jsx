import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Car, RefreshCw } from "lucide-react";
import {
  setActiveFilter,
  clearFilter,
} from "../../features/liveDashboardSlice";

const LiveDashboardHeader = () => {
  const dispatch = useDispatch();
  const {
    dashboardStats = [],
    totalVehicles = 0,
    activeFilter = null,
    loading = false,
  } = useSelector((state) => state.liveDashboard || {});

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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className=" rounded-lg py-1"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* Left Section - More Compact */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#D52B1E]/10 rounded-md border border-[#D52B1E]/20">
              <Car className="w-5 h-5 text-[#D52B1E]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                LIVE DASHBOARD
              </h1>
            </div>
          </div>

          {/* Right Section - Just Total Vehicles */}
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-md px-3 flex flex-row items-center justify-center gap-2">
              <div className="text-lg font-bold text-[#D52B1E]">
                {totalVehicles}
              </div>
              <div className="text-xs text-black text-center ">
                Total Vehicles
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Stats Cards - Button Style like in image */}
      <div className="flex gap-2 flex-wrap pb-2">
        {dashboardStats.map((stat, index) => {
          // Unique color and style per stat type
          let baseColor = "bg-gray-100 text-gray-700 border-gray-300";
          let activeColor =
            "bg-[#D52B1E] text-white border-[#D52B1E] shadow-md";
          if (stat.label.toLowerCase().includes("nr"))
            baseColor = "bg-red-100 text-red-700 border-red-300";
          if (stat.label.toLowerCase().includes("city speed"))
            baseColor = "bg-green-100 text-green-700 border-green-300";
          if (stat.label.toLowerCase().includes("nh speed"))
            baseColor = "bg-blue-100 text-blue-700 border-blue-300";
          if (stat.label.toLowerCase().includes("mw limit"))
            baseColor = "bg-yellow-100 text-yellow-700 border-yellow-300";
          if (stat.label.toLowerCase().includes("hills"))
            baseColor = "bg-orange-100 text-orange-700 border-orange-300";
          if (stat.label.toLowerCase().includes("seat belt"))
            baseColor = "bg-green-200 text-green-800 border-green-400";
          if (stat.label.toLowerCase().includes("panic"))
            baseColor = "bg-red-200 text-red-800 border-red-400";
          if (stat.label.toLowerCase().includes("harsh"))
            baseColor = "bg-blue-200 text-blue-800 border-blue-400";
          if (stat.label.toLowerCase().includes("cd duration"))
            baseColor = "bg-indigo-100 text-indigo-700 border-indigo-300";
          if (stat.label.toLowerCase().includes("dd duration"))
            baseColor = "bg-gray-200 text-gray-700 border-gray-400";
          if (stat.label.toLowerCase().includes("black spot"))
            baseColor = "bg-yellow-200 text-yellow-800 border-yellow-400";
          if (stat.label.toLowerCase().includes("nrv"))
            baseColor = "bg-green-100 text-green-700 border-green-300";

          return (
            <motion.button
              key={stat.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{
                duration: 0.3,
                delay: index * 0.01,
              }}
              onClick={() => handleCardClick(stat.id)}
              className={`px-3 py-2 text-sm font-normal cursor-pointer transition-all duration-300 border rounded-sm ${
                activeFilter === stat.id ? activeColor : baseColor
              } ${activeFilter === stat.id ? "scale-105" : "hover:scale-105"}`}
              style={{ letterSpacing: "0.5px" }}
            >
              {stat.label} <span className="font-normal">({stat.count})</span>
            </motion.button>
          );
        })}
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
