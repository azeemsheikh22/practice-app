import React, { useState, useImperativeHandle } from "react";
import CreatePolicyModal from "./CreatePolicyModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchPolicyTypeList } from "../../features/alertpolicySlice";
import { setExportType } from "../../features/alertSlice";
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

export default function PolicyManagementHeader({ 
  searchQuery, 
  setSearchQuery, 
  totalRecords,
  onEditPolicyRef // New prop to expose edit function to parent
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showUserPoliciesOnly, setShowUserPoliciesOnly] = useState(false);
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get policyTypeList from alertpolicy slice
  const policyTypeList = useSelector(state => state.alertpolicy?.policyTypeList);

  // Form state for the modal
  const [formData, setFormData] = useState({
    alertType: "",
    highPriority: false,
    policyName: ""
  });

  // Sample data - you can replace with actual data
  const displayTotalRecords = totalRecords || 0;

  // Export handlers
  const handleExport = (type) => {
    setShowExportDropdown(false);
    dispatch(setExportType(type));
  };

  const handleCreateNewPolicy = () => {
    // Dispatch API call to fetch policy type list
    dispatch(fetchPolicyTypeList())
    setIsEditMode(false);
    setShowCreatePolicyModal(true);
  };

  const handleEditPolicy = (policyData) => {
    // Dispatch API call to fetch policy type list
    dispatch(fetchPolicyTypeList())
    setIsEditMode(true);
    // Set form data with existing policy data
    setFormData({
      alertType: policyData.alertType || "",
      highPriority: policyData.highPriority || false,
      policyName: policyData.policyName || ""
    });
    setShowCreatePolicyModal(true);
  };

  const handleCloseModal = () => {
    setShowCreatePolicyModal(false);
    setIsEditMode(false);
    // Reset form data
    setFormData({
      alertType: "",
      highPriority: false,
      policyName: ""
    });
  };

  const handleNext = () => {
    if (formData.policyName.trim()) {
      // Navigate to add-policy route with formData as state
      navigate("/add-policy", { state: formData });
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

  // Expose handleEditPolicy function to parent component
  useImperativeHandle(onEditPolicyRef, () => ({
    editPolicy: handleEditPolicy
  }), []);

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
            Showing {displayTotalRecords} Policy Management Records
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
                    className="absolute cursor-pointer top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    <div className="py-1">
                      {[
                   
                        { icon: FileSpreadsheet, label: 'Excel', type: 'excel' },
                        { icon: FileText, label: 'CSV', type: 'csv' },
                        { icon: File, label: 'PDF', type: 'pdf' }
                      ].map(({ icon: Icon, label, type }) => (
                        <button
                          key={type}
                          onClick={() => handleExport(type)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ color: 'var(--text-color)', cursor: 'pointer' }}
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

      {/* Create Policy Modal (imported) */}
      <CreatePolicyModal
        show={showCreatePolicyModal}
        onClose={handleCloseModal}
        formData={formData}
        handleFormChange={handleFormChange}
        handleNext={handleNext}
        isNextDisabled={isNextDisabled}
        policyTypeList={policyTypeList}
        isEditMode={isEditMode}
      />
    </>
  );
}