import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, X, Menu, ChevronLeft } from "lucide-react";
import MatrixSidebar from "./MatrixSidebar";
import MatrixTable from "./MatrixTable";

const MatrixPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("today");

  const handleClose = () => {
    window.close();
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
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-[#D52B1E]/10 rounded-lg text-[#D52B1E] hover:bg-[#D52B1E]/20 transition-colors"
            >
              <Menu size={20} />
            </motion.button>

            <div className="p-2 bg-[#D52B1E]/10 rounded-lg">
              <MapPin size={24} className="text-[#D52B1E]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Geofence Matrix
              </h1>
              <p className="text-sm text-gray-600">
                Vehicle visits and analytics data
              </p>
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
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white overflow-auto shadow-sm border-r border-gray-200">
            <MatrixSidebar
              selectedTimeFilter={selectedTimeFilter}
              setSelectedTimeFilter={setSelectedTimeFilter}
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
                />
              </motion.div>
            </>
          )}

          {/* Table Section */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
            <MatrixTable selectedTimeFilter={selectedTimeFilter} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatrixPage;
