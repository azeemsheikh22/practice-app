import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const ActionModal = ({ isOpen, onClose, vehicleData }) => {
  const [formData, setFormData] = useState({
    carName: vehicleData?.vehicle || "",
    gpsTime: new Date().toLocaleString(),
    alertType: "",
    contactPerson: "",
    contactNumber: "",
    extensionNo: "",
    actionPerformed: "",
    sendEmail: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log("Action saved:", formData);
    // TODO: API call to save action
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[905]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl z-10 mx-4 max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Action Performed Details
            </h3>
            <button
              onClick={onClose}
              className="p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Car Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Car Name
            </label>
            <input
              type="text"
              name="carName"
              value={formData.carName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
              readOnly
            />
          </div>

          {/* GPS Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPS Time
            </label>
            <input
              type="text"
              name="gpsTime"
              value={formData.gpsTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
              readOnly
            />
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Type
            </label>
            <select
              name="alertType"
              value={formData.alertType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select alert type</option>
              <option value="speed">Speed Alert</option>
              <option value="geofence">Geofence Alert</option>
              <option value="maintenance">Maintenance Alert</option>
              <option value="emergency">Emergency Alert</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Contact Person and Contact Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact#
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Extension No and Action Performed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension No.
              </label>
              <input
                type="text"
                name="extensionNo"
                value={formData.extensionNo}
                onChange={handleInputChange}
                placeholder="Enter extension number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Performed
              </label>
              <textarea
                name="actionPerformed"
                value={formData.actionPerformed}
                onChange={handleInputChange}
                placeholder="Describe the action"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Send Email Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="sendEmail"
              checked={formData.sendEmail}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Send Email
            </label>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActionModal;
