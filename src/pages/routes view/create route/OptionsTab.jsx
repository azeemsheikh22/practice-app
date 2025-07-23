import React from "react";
import { motion } from "framer-motion";
import { MapPin, Shield } from "lucide-react";

const OptionsTab = ({ routeForm, setRouteForm }) => {
  const handleFormTypeChange = (formType) => {
    setRouteForm({
      ...routeForm,
      options: {
        ...routeForm.options,
        formType: formType,
      },
    });
  };

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Location Input Options
        </h3>

        {/* Form Location Option */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            routeForm.options?.formType === "location"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
          onClick={() => handleFormTypeChange("location")}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <input
                type="radio"
                name="formType"
                value="location"
                checked={routeForm.options?.formType === "location"}
                onChange={() => handleFormTypeChange("location")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Form Location
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Search and select locations using address or coordinates
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Geofence Option */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            routeForm.options?.formType === "geofence"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
          onClick={() => handleFormTypeChange("geofence")}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <input
                type="radio"
                name="formType"
                value="geofence"
                checked={routeForm.options?.formType === "geofence"}
                onChange={() => handleFormTypeChange("geofence")}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Form Geofence
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Select locations from predefined geofence areas
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Information Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              How it works:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • <strong>Form Location:</strong> Type addresses or coordinates to search locations
              </li>
              <li>
                • <strong>Form Geofence:</strong> Select from predefined geofence areas with exact coordinates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsTab;

