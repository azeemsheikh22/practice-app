import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";

export default function RouteHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef(null);

  // Static data for now (API nahi hai abhi)
  const totalRoutes = 125;

  // Outside click handler for download dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Download options
  const downloadOptions = [
    {
      label: "Copy",
      icon: <FileText size={14} />,
      action: () => console.log("Copy"),
    },
    {
      label: "Excel",
      icon: <FileSpreadsheet size={14} />,
      action: () => console.log("Excel"),
    },
    {
      label: "CSV",
      icon: <FileDown size={14} />,
      action: () => console.log("CSV"),
    },
    {
      label: "PDF",
      icon: <FileText size={14} />,
      action: () => console.log("PDF"),
    },
  ];

  return (
    <div className="w-full space-y-2 mb-3">
      {/* ✅ COMPACT Main Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
      >
        {/* ✅ COMPACT Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800 mb-1">Route List</h1>
            <p className="text-sm text-gray-600">
              Search and edit your Route from the list below
            </p>
          </div>

          {/* ✅ COMPACT Create Route Button - Updated with theme colors */}
          <div className="flex-shrink-0">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                const newWindow = window.open(
                  "/#/create-route",
                  "CreateRoute",
                  "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
                );
                if (newWindow) {
                  newWindow.focus();
                } else {
                  alert("Please allow popups for this site to create routes");
                }
              }}
              className="btn btn-primary btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0"
            >
              <Plus size={14} className="mr-1.5" />
              Create New Route
            </motion.button>
          </div>
        </div>

        {/* ✅ COMPACT Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* ✅ COMPACT Left side - Search and showing info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            {/* ✅ COMPACT Search Input - Updated with theme colors */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search for a route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
              />
            </div>

            {/* ✅ COMPACT Showing info - Updated with theme colors */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-[#25689f] rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">
                Showing <span className="font-semibold text-[#25689f]">50</span>{" "}
                of{" "}
                <span className="font-semibold text-[#25689f]">
                  {totalRoutes}
                </span>{" "}
                routes
              </span>
            </div>
          </div>

          {/* ✅ COMPACT Right side - Download button - Updated with theme colors */}
          <div className="flex-shrink-0">
            <div className="relative" ref={downloadRef}>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="btn btn-ghost btn-sm text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center px-2.5 py-1.5 text-sm h-auto min-h-0"
              >
                <Download size={12} className="mr-1.5" />
                Download
              </motion.button>

              {/* ✅ COMPACT Download Options */}
              {isDownloadOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                >
                  {downloadOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        option.action();
                        setIsDownloadOpen(false);
                      }}
                      className="flex items-center w-full px-2.5 py-1.5 text-xs text-gray-700 hover:bg-[#25689f]/10 hover:text-[#25689f] transition-colors duration-150"
                    >
                      {option.icon}
                      <span className="ml-1.5">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
