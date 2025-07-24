import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Download,
  ChevronDown,
  Copy,
  FileSpreadsheet,
  FileText,
  File,
  Plus
} from "lucide-react";

export default function PolicyManagementHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showUserPoliciesOnly, setShowUserPoliciesOnly] = useState(false);

  // Sample data - you can replace with actual data
  const totalRecords = 83;

  // Export handlers
  const handleExport = (type) => {
    console.log(`Exporting as ${type}`);
    setShowExportDropdown(false);
    // Add export logic here
  };

  const handleCreateNewPolicy = () => {
    console.log("Create new policy clicked");
    // Add navigation or modal logic here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4"
    >
      {/* Top Row - Record Count and Create Button */}
      <div className="flex items-center justify-between mb-6">
        {/* Record Count */}
        <h2 className="text-xl font-bold text-gray-800">
          Showing {totalRecords} Policy Management Records
        </h2>
        
       
        <motion.button
            whileHover="hover"
            whileTap="tap"
            className="btn btn-primary  btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0"
          >
            <Plus size={14} className="mr-1.5" />
            Create New Policy
          </motion.button>
      </div>

      {/* Bottom Row - Search, Export, and Checkbox */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left Section - Search and Export */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-blue-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Would you like to search for a Policy or Vehicle?"
              className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm placeholder-blue-400"
            />
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 text-sm font-medium h-10"
            >
              <Download size={16} />
              <ChevronDown size={14} />
            </motion.button>

            <AnimatePresence>
              {showExportDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('copy')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={14} />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <File size={14} />
                      PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section - Checkbox */}
        <div className="flex-shrink-0">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={showUserPoliciesOnly}
              onChange={(e) => setShowUserPoliciesOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 focus:ring-2 w-4 h-4 transition-colors duration-200"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 whitespace-nowrap">
              Show policies for users I manage
            </span>
          </label>
        </div>
      </div>

      {/* Click outside handler for dropdown */}
      {showExportDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportDropdown(false)}
        />
      )}
    </motion.div>
  );
}