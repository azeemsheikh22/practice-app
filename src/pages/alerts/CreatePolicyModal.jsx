import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, AlertTriangle } from "lucide-react";

export default function CreatePolicyModal({
  show,
  onClose,
  formData,
  handleFormChange,
  handleNext,
  isNextDisabled,
  policyTypeList
}) {
  if (!show) return null;

  // Set default alert type only in create mode (not edit)
  const isEdit = !!formData.policyName;
  useEffect(() => {
    if (
      !isEdit &&
      Array.isArray(policyTypeList) && policyTypeList.length > 0 &&
      (!formData.alertType || !policyTypeList.some(item => item.alm_type === formData.alertType))
    ) {
      handleFormChange('alertType', policyTypeList[0].alm_type);
    }
  }, [isEdit, policyTypeList, formData.alertType, handleFormChange]);

  // ...existing code...

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
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
                {isEdit ? 'Create a New Policy' : 'Create a New Policy'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEdit ? 'Set up a new policy for your fleet' : 'Set up a new policy for your fleet'}
              </p>
            </div>
            <button
              onClick={onClose}
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
                {Array.isArray(policyTypeList) && policyTypeList.map((item, idx) => (
                  <option key={item.alm_id} value={item.alm_type}>{item.alm_type}</option>
                ))}
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
                  <label className="flex items-center cursor-pointer group mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.highPriority}
                      onChange={(e) => handleFormChange('highPriority', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="relative w-4 h-4 rounded border-2 transition-colors duration-200"
                      style={{
                        backgroundColor: formData.highPriority ? 'var(--primary-color)' : '#ffffff',
                        borderColor: formData.highPriority ? 'var(--primary-color)' : '#d1d5db',
                      }}
                    >
                      {formData.highPriority && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </label>

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
            onClick={onClose}
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
  );
}
