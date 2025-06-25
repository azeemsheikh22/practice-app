import React from "react";
import { motion } from "framer-motion";

const AdvanceTab = ({ advanceForm, setAdvanceForm }) => {
  // Marker color options
  const markerColorOptions = [
    { value: "#D52B1E", label: "Red", color: "#D52B1E" },
    { value: "#8B5CF6", label: "Purple", color: "#8B5CF6" },
    { value: "#3B82F6", label: "Blue", color: "#3B82F6" },
  ];

  // Handle checkbox changes for show on options
  const handleShowOnChange = (option, isChecked) => {
    const currentShowOn = advanceForm.showOn || [];
    
    if (isChecked) {
      // Add option if not already present
      if (!currentShowOn.includes(option)) {
        setAdvanceForm({
          ...advanceForm,
          showOn: [...currentShowOn, option]
        });
      }
    } else {
      // Remove option
      setAdvanceForm({
        ...advanceForm,
        showOn: currentShowOn.filter(item => item !== option)
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Name
        </label>
        <input
          type="text"
          value={advanceForm.contactName}
          onChange={(e) =>
            setAdvanceForm({
              ...advanceForm,
              contactName: e.target.value,
            })
          }
          placeholder="Enter contact name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Phone Number
        </label>
        <input
          type="tel"
          value={advanceForm.contactPhone}
          onChange={(e) =>
            setAdvanceForm({
              ...advanceForm,
              contactPhone: e.target.value,
            })
          }
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Place ID
        </label>
        <input
          type="text"
          value={advanceForm.placeId}
          onChange={(e) =>
            setAdvanceForm({
              ...advanceForm,
              placeId: e.target.value,
            })
          }
          placeholder="Enter place ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E]"
        />
      </div>
      
      {/* Enhanced Marker Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Marker Color
        </label>
        <div className="grid grid-cols-3 gap-3">
          {markerColorOptions.map((option) => (
            <div
              key={option.value}
              onClick={() =>
                setAdvanceForm({
                  ...advanceForm,
                  markerColor: option.value,
                })
              }
              className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                advanceForm.markerColor === option.value
                  ? `border-[${option.color}] bg-gradient-to-br from-white to-gray-50 shadow-md`
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Color Circle */}
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform duration-200 ${
                    advanceForm.markerColor === option.value ? "scale-110" : ""
                  }`}
                  style={{ backgroundColor: option.color }}
                ></div>
                
                {/* Color Label */}
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    advanceForm.markerColor === option.value
                      ? "text-gray-800"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </span>
                
                {/* Selection Indicator */}
                {advanceForm.markerColor === option.value && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show On Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Show On
        </label>
        <div className="space-y-3">
          {/* Map Checkbox */}
          <div className="flex items-center">
            <div className="relative">
              <input
                type="checkbox"
                id="show-on-map"
                checked={advanceForm.showOn?.includes('map') || false}
                onChange={(e) => handleShowOnChange('map', e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="show-on-map"
                className="flex items-center cursor-pointer"
              >
                <div
                  className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 mr-3 ${
                    advanceForm.showOn?.includes('map')
                      ? "bg-[#D52B1E] border-[#D52B1E] text-white"
                      : "border-gray-300 hover:border-[#D52B1E]"
                  }`}
                >
                  {advanceForm.showOn?.includes('map') && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 select-none">
                  Map
                </span>
              </label>
            </div>
          </div>

          {/* Address Checkbox */}
          <div className="flex items-center">
            <div className="relative">
              <input
                type="checkbox"
                id="show-on-address"
                checked={advanceForm.showOn?.includes('address') || false}
                onChange={(e) => handleShowOnChange('address', e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="show-on-address"
                className="flex items-center cursor-pointer"
              >
                <div
                  className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 mr-3 ${
                    advanceForm.showOn?.includes('address')
                      ? "bg-[#D52B1E] border-[#D52B1E] text-white"
                      : "border-gray-300 hover:border-[#D52B1E]"
                  }`}
                >
                  {advanceForm.showOn?.includes('address') && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 select-none">
                  Address
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvanceTab;
