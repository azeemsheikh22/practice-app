import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Download,
  ChevronDown,
  Copy,
  FileSpreadsheet,
  FileText,
  File,
  Plus,
  Check,
  X,
  AlertTriangle
} from "lucide-react";

export default function PolicyManagementHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showUserPoliciesOnly, setShowUserPoliciesOnly] = useState(false);
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  
  // Form state for the modal
  const [formData, setFormData] = useState({
    alertType: "Accident Incident",
    highPriority: false,
    policyName: ""
  });

  // Sample data - you can replace with actual data
  const totalRecords = 83;

  // Export handlers
  const handleExport = (type) => {
    console.log(`Exporting as ${type}`);
    setShowExportDropdown(false);
    // Add export logic here
  };

  const handleCreateNewPolicy = () => {
    setShowCreatePolicyModal(true);
  };

  const handleCloseModal = () => {
    setShowCreatePolicyModal(false);
    // Reset form data
    setFormData({
      alertType: "Accident Incident",
      highPriority: false,
      policyName: ""
    });
  };

  const handleNext = () => {
    if (formData.policyName.trim()) {
      console.log("Form data:", formData);
      // Navigate to add-policy route
      navigate("/add-policy");
      handleCloseModal();
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if Next button should be disabled
  const isNextDisabled = !formData.policyName.trim();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4"
      >
        {/* Top Row - Record Count and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Record Count */}
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-color)' }}>
            Showing {totalRecords} Policy Management Records
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewPolicy}
            className="flex items-center justify-center cursor-pointer px-3 py-1.5 text-sm font-medium text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 h-auto min-h-0 w-full sm:w-auto"
            style={{ 
              background: `linear-gradient(to right, var(--primary-color), var(--bg-dark))`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `linear-gradient(to right, var(--bg-dark), var(--primary-hover))`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `linear-gradient(to right, var(--primary-color), var(--bg-dark))`;
            }}
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
                <Search size={16} style={{ color: 'var(--primary-color)' }} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Would you like to search for a Policy or Vehicle?"
                className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-200 text-sm"
                style={{ 
                  '--tw-ring-color': 'var(--primary-color)',
                  color: 'var(--text-color)'
                }}
                onFocus={(e) => {
                  e.target.style.ringColor = 'var(--primary-color)';
                  e.target.style.boxShadow = `0 0 0 2px var(--primary-color)`;
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all duration-200 text-sm font-medium h-10 w-full sm:w-auto justify-center sm:justify-start"
                style={{ color: 'var(--text-color)' }}
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
                      {[
                        { icon: Copy, label: 'Copy', type: 'copy' },
                        { icon: FileSpreadsheet, label: 'Excel', type: 'excel' },
                        { icon: FileText, label: 'CSV', type: 'csv' },
                        { icon: File, label: 'PDF', type: 'pdf' }
                      ].map(({ icon: Icon, label, type }) => (
                        <button
                          key={type}
                          onClick={() => handleExport(type)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: 'var(--text-color)' }}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Section - Custom Animated Checkbox */}
          <div className="flex-shrink-0">
            <motion.label 
              className="flex items-center cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={showUserPoliciesOnly}
                onChange={(e) => setShowUserPoliciesOnly(e.target.checked)}
                className="sr-only"
              />
              <motion.div
                className="relative w-4 h-4 rounded border-2 transition-colors duration-200"
                style={{
                  backgroundColor: showUserPoliciesOnly ? 'var(--primary-color)' : '#ffffff',
                  borderColor: showUserPoliciesOnly ? 'var(--primary-color)' : '#d1d5db',
                }}
                animate={{
                  backgroundColor: showUserPoliciesOnly ? 'var(--primary-color)' : '#ffffff',
                  borderColor: showUserPoliciesOnly ? 'var(--primary-color)' : '#d1d5db',
                }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence>
                  {showUserPoliciesOnly && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span 
                className="ml-2 text-sm group-hover:opacity-80 transition-opacity duration-200 whitespace-nowrap"
                style={{ color: 'var(--text-color)' }}
              >
                Show policies for users I manage
              </span>
            </motion.label>
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

      {/* Create Policy Modal */}
      <AnimatePresence>
        {showCreatePolicyModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="px-4 sm:px-8 py-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h2 
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Create a New Policy
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Set up a new policy for your fleet
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-4 sm:px-8 py-6">
                <div className="space-y-6">
                  {/* Alert Type */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <label 
                      className="text-sm font-medium sm:w-32 flex-shrink-0"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Alert Type:
                    </label>
                    <select
                      value={formData.alertType}
                      onChange={(e) => handleFormChange('alertType', e.target.value)}
                      className="flex-1 sm:max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none text-sm transition-all duration-200"
                      style={{ 
                        color: 'var(--text-color)',
                        '--tw-ring-color': 'var(--primary-color)'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = `0 0 0 2px var(--primary-color)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="Accident Incident">Accident Incident</option>
                      <option value="Speed Violation">Speed Violation</option>
                      <option value="Geofence Alert">Geofence Alert</option>
                      <option value="Maintenance Alert">Maintenance Alert</option>
                    </select>
                  </div>

                  {/* High Priority */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                    <label 
                      className="text-sm font-medium sm:w-32 flex-shrink-0 sm:pt-1"
                      style={{ color: 'var(--text-color)' }}
                    >
                      High Priority:
                    </label>
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {/* Custom Checkbox */}
                        <motion.label 
                          className="flex items-center cursor-pointer group mt-0.5"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.highPriority}
                            onChange={(e) => handleFormChange('highPriority', e.target.checked)}
                            className="sr-only"
                          />
                          <motion.div
                            className="relative w-4 h-4 rounded border-2 transition-colors duration-200"
                            style={{
                              backgroundColor: formData.highPriority ? 'var(--primary-color)' : '#ffffff',
                              borderColor: formData.highPriority ? 'var(--primary-color)' : '#d1d5db',
                            }}
                            animate={{
                              backgroundColor: formData.highPriority ? 'var(--primary-color)' : '#ffffff',
                              borderColor: formData.highPriority ? 'var(--primary-color)' : '#d1d5db',
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <AnimatePresence>
                              {formData.highPriority && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <Check size={10} className="text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </motion.label>

                        {/* Warning Icon */}
                        <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />

                        {/* Legend Text */}
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: 'var(--text-color)' }}
                        >
                          A High Priority Alert will be flagged in your email inbox and will remain unread in the Alert Log until you click to open the details.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name this Policy */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <label 
                      className="text-sm font-medium sm:w-32 flex-shrink-0"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Name this Policy:
                    </label>
                    <input
                      type="text"
                      value={formData.policyName}
                      onChange={(e) => handleFormChange('policyName', e.target.value)}
                      className="flex-1 sm:max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent outline-none text-sm transition-all duration-200"
                      placeholder="Enter policy name"
                      style={{ 
                        color: 'var(--text-color)',
                        '--tw-ring-color': 'var(--primary-color)'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = `0 0 0 2px var(--primary-color)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-4">
                <button
                  onClick={handleCloseModal}
                  className="font-medium text-sm cursor-pointer transition-colors hover:opacity-80 order-2 sm:order-1"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={!isNextDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isNextDisabled ? { scale: 0.98 } : {}}
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`px-6 py-2 font-medium cursor-pointer text-sm rounded-md transition-all duration-200 shadow-sm order-1 sm:order-2 w-full sm:w-auto ${
                    isNextDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-md'
                  }`}
                  style={{ 
                    backgroundColor: isNextDisabled ? '#9ca3af' : 'var(--accent-red)',
                    color: '#ffffff'
                  }}
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}