import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import ManageCategoriesModal from "./ManageCategoriesModal";

export default function GeofenceHeader() {
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const { totalGeofences, geofencesToCorrect, loading, error } = useSelector(
    (state) => state.geofence
  );

  // ✅ Function to open Create Geofence in new window
  const handleCreateGeofence = () => {
    const newWindow = window.open(
      "/#/create-geofence", // Hash prefix add kiya
      "CreateGeofence",
      "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
    );

    if (newWindow) {
      newWindow.focus();
    } else {
      // Fallback if popup blocked
      alert("Please allow popups for this site to create geofences");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2, scale: 1.02 },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const cardData = [
    {
      id: "total",
      icon: <MapPin size={14} className="text-[#D52B1E]" />,
      value: loading ? "..." : totalGeofences.toLocaleString(),
      label: "Total Geofences",
      buttonText: "Show All",
      tooltipData: [
        "Total active geofences in system",
        "Includes all types and categories",
        `Current count: ${totalGeofences}`,
        "Real-time data from database",
      ],
    },
    {
      id: "correct",
      icon: <AlertTriangle size={14} className="text-[#D52B1E]" />,
      value: loading ? "..." : geofencesToCorrect.toLocaleString(),
      label: "Geofence to Correct",
      buttonText: "Correct Now",
      tooltipData: [
        "Geofences requiring attention",
        "Based on needCorrection flag",
        "Issues: boundaries, overlaps",
        "Priority: High correction needed",
      ],
    },
    {
      id: "suggested",
      icon: <CheckCircle size={14} className="text-[#D52B1E]" />,
      value: "0",
      label: "Suggested Geofence",
      buttonText: "View and Edit",
      tooltipData: [
        "AI-generated suggestions",
        "Based on vehicle patterns",
        "No suggestions available",
        "Feature coming soon",
      ],
    },
  ];

  return (
    <div className="w-full space-y-2 mb-3">
      {/* Compact Header Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 bg-white rounded-lg p-2.5 shadow-sm border border-gray-100"
      >
        {/* Left side - Stats text */}
        <div className="flex items-center">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <h2 className="text-sm font-semibold text-gray-800">
              Showing{" "}
              <span className="text-blue-600">
                {loading ? "..." : totalGeofences}
              </span>{" "}
              of{" "}
              <span className="text-blue-600">
                {loading ? "..." : totalGeofences}
              </span>{" "}
              Geofences
            </h2>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col sm:flex-row gap-1.5">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsManageCategoriesOpen(true)}
            className="btn btn-ghost btn-sm text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 h-auto min-h-0 px-2.5 py-1 text-xs"
          >
            <MapPin size={12} className="mr-1" />
            Manage Categories
          </motion.button>

          {/* ✅ Updated Create Geofence button */}
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleCreateGeofence}
            className="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white shadow-md hover:shadow-lg transition-all duration-200 h-auto min-h-0 px-2.5 py-1 text-xs"
          >
            <MapPin size={12} className="mr-1" />
            Create Geofence
          </motion.button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-2"
        >
          <div className="flex items-center">
            <AlertTriangle size={14} className="text-red-500 mr-1.5" />
            <p className="text-red-700 text-xs font-medium">
              Error loading geofences: {error}
            </p>
          </div>
        </motion.div>
      )}

      {/* Compact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {cardData.map((card, index) => (
          <motion.div
            key={card.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              type: "spring",
              stiffness: 200,
            }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 shadow-md shadow-gray-300/20 hover:shadow-gray-400/30 transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 min-h-[85px]"
          >
            {/* Background decorative elements - smaller */}
            <div className="absolute top-0 right-0 w-10 h-10 bg-[#D52B1E]/10 rounded-full transform translate-x-5 -translate-y-5"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 bg-black/5 rounded-full transform -translate-x-3 translate-y-3"></div>

            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Header with icon, number, label and button in one row */}
              <div className="flex items-center justify-between w-full">
                {/* Left side - Icon and content */}
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 bg-[#D52B1E]/10 backdrop-blur-sm rounded-md group-hover:bg-[#D52B1E]/20 transition-all duration-300 border border-[#D52B1E]/20">
                    <div className="w-3.5 h-3.5 flex items-center justify-center text-[#D52B1E]">
                      {card.icon}
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-bold text-black">
                      {card.value}
                    </div>
                    <p className="text-black/80 font-medium text-xs leading-tight">
                      {card.label}
                    </p>
                  </div>
                </div>

                {/* Right side - Action Button */}
                <div className="flex-shrink-0">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="px-2.5 py-1 bg-[#D52B1E] hover:bg-[#B8241A] text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs flex items-center space-x-1"
                  >
                    <span>{card.buttonText}</span>
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D52B1E]/0 via-[#D52B1E]/5 to-[#D52B1E]/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </motion.div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-2"
        >
          <div className="flex items-center space-x-1.5 text-gray-600">
            <div className="w-2.5 h-2.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Loading geofences...</span>
          </div>
        </motion.div>
      )}

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </div>
  );
}
