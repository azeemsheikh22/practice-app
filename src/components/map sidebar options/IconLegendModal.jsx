import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

// Import vehicle icons
import movingIcon from "../../assets/moving-vehicle.png";
import stoppedIcon from "../../assets/stopped-vehicle.png";
import idleIcon from "../../assets/idle-vehicle.png";

const IconLegendModal = ({ isOpen, onClose }) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[300]">
      {/* Black overlay with slight transparency */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      <motion.div 
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl z-10 mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Icon Legend</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Vehicle Status Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3 border-b pb-1">Vehicle Status</h4>
            <div className="space-y-3">
              {/* Moving Vehicle */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <img src={movingIcon} alt="Moving Vehicle" className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Moving</div>
                  <div className="text-sm text-gray-600">Vehicle is currently moving in the direction of the arrow</div>
                </div>
              </div>
              
              {/* Stopped Vehicle */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <img src={stoppedIcon} alt="Stopped Vehicle" className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Stopped</div>
                  <div className="text-sm text-gray-600">Vehicle is currently stopped at that location</div>
                </div>
              </div>
              
              {/* Idle Vehicle */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <img src={idleIcon} alt="Idle Vehicle" className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Idle</div>
                  <div className="text-sm text-gray-600">Vehicle is currently idling at that location</div>
                </div>
              </div>
              
              {/* Privacy Mode */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-white text-xs">P</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Privacy</div>
                  <div className="text-sm text-gray-600">Vehicle has entered into privacy mode</div>
                </div>
              </div>
              
              {/* Towing */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs">T</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Towing</div>
                  <div className="text-sm text-gray-600">Vehicle is currently being towed</div>
                </div>
              </div>
              
              {/* Panic */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Panic</div>
                  <div className="text-sm text-gray-600">A panic alert has been triggered for this vehicle</div>
                </div>
              </div>
              
              {/* Vehicle Clustering */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    5+
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Vehicle Clustering</div>
                  <div className="text-sm text-gray-600">Multiple vehicles in close proximity (click to zoom in)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Places Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3 border-b pb-1">Places</h4>
            <div className="space-y-3">
              {/* Geofence */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 border-2 border-indigo-500 rounded-md"></div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Geofence</div>
                  <div className="text-sm text-gray-600">Geofence location (customizable group category icon)</div>
                </div>
              </div>
              
              {/* Suggested Geofences */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 border-2 border-purple-500 rounded-md border-dashed"></div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Suggested Geofences</div>
                  <div className="text-sm text-gray-600">Geofence suggested by Fleetmatics based on high activity</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Garmin Stops Section */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 border-b pb-1">Garmin Stops</h4>
            <div className="space-y-3">
              {/* En Route */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs">ER</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">En Route</div>
                  <div className="text-sm text-gray-600">Garmin stop has a vehicle en route</div>
                </div>
              </div>
              
              {/* Completed */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Completed</div>
                  <div className="text-sm text-gray-600">Garmin stop has been completed</div>
                </div>
              </div>
              
              {/* Pending */}
              <div className="flex items-start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-white text-xs">P</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Pending</div>
                  <div className="text-sm text-gray-600">Garmin stop is currently pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IconLegendModal;
