import React from "react";

const ContextMenus = ({
  // Context Menu Props
  contextMenu,
  handleZoomToLocation,
  handleCopyCoordinates,
  handleCreateGeofence,
  handleMeasureDistance,
  handleOpenStreetView,
  handleFindNearest,
  handleSendToGarmin,
  handleGetDirectionsTo,
  handleGetDirectionsFrom,
  handleOpenDriverDispatch,

  // Vehicle Context Menu Props
  vehicleContextMenu,
  handleVehicleMenuAction,

  // Geofence Context Menu Props
  geofenceContextMenu,
  handleGeofenceMenuAction,
}) => {
  return (
    <>
      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-[1000] bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 max-h-[50vh] overflow-y-auto"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 200)}px`,
            top: `${Math.max(
              10,
              Math.min(contextMenu.y, window.innerHeight - 400)
            )}px`,
          }}
        >
          {/* Scrollable Menu Items */}
          <div className="py-2 max-h-[calc(50vh-20px)] overflow-y-auto">
            {/* Existing Options */}
            <button
              onClick={handleZoomToLocation}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
                <path d="M11 8v6"></path>
                <path d="M8 11h6"></path>
              </svg>
              Zoom Here
            </button>

            <button
              onClick={handleCopyCoordinates}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Coordinates
            </button>

            <button
              onClick={handleCreateGeofence}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Create Geofence
            </button>

            <button
              onClick={handleMeasureDistance}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 12h10"></path>
                <path d="M9 4v16"></path>
                <path d="M14 7l3 3-3 3"></path>
              </svg>
              Measure Distance
            </button>

            <button
              onClick={handleOpenStreetView}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"></path>
                <path d="M3.6 9h16.8"></path>
                <path d="M3.6 15h16.8"></path>
                <path d="M11.5 3a17 17 0 0 0 0 18"></path>
                <path d="M12.5 3a17 17 0 0 1 0 18"></path>
              </svg>
              Street View
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* New Options */}
            <button
              onClick={handleFindNearest}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"></polygon>
              </svg>
              Find Nearest
            </button>

            {/* ✅ DISABLED: Send to Garmin button */}
            <button
              disabled
              className="w-full flex items-center cursor-not-allowed gap-3 px-4 py-2 text-sm text-gray-400 bg-gray-100 opacity-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Send to Garmin
            </button>

            <button
              onClick={handleGetDirectionsTo}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12,5 19,12 12,19"></polyline>
              </svg>
              Get Directions To Here
            </button>

            <button
              onClick={handleGetDirectionsFrom}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12,5 5,12 12,19"></polyline>
              </svg>
              Get Directions From Here
            </button>

            <button
              onClick={handleOpenDriverDispatch}
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="m22 2-5 10-4-4Z"></path>
              </svg>
              Open Driver Dispatch
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Context Menu */}
      {vehicleContextMenu.visible && vehicleContextMenu.vehicleData && (
        <div
          className="fixed z-[1001] bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 max-h-[70vh] 
          overflow-y-auto"
          style={{
            left: `${Math.min(
              vehicleContextMenu.x,
              window.innerWidth - 200
            )}px`,
            top: `${Math.max(
              10,
              Math.min(
                vehicleContextMenu.y,
                window.innerHeight - Math.min(600, window.innerHeight * 0.8)
              )
            )}px`,
          }}
        >
          {/* Vehicle Name Header - Fixed at top */}
          <div className="sticky top-0 z-10 px-4 py-2 border-b border-gray-100 bg-gray-50">
            <div className="font-semibold text-gray-900 text-sm">
              {vehicleContextMenu.vehicleData.carname ||
                `Vehicle ${vehicleContextMenu.vehicleData.car_id}`}
            </div>
          </div>

          {/* Scrollable Menu Items */}
          <div className="py-1 max-h-[calc(70vh-80px)] overflow-y-auto">
            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "findNearest",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"></polygon>
              </svg>
              Find Nearest
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "viewReplay",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
              View Replay
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "dailyReport",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Run Daily Report
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "detailedReport",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="12" y1="9" x2="8" y2="9"></line>
              </svg>
              Run Detailed Report
            </button>
            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "zoomTo",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
                  <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
                <path d="M11 8v6"></path>
                <path d="M8 11h6"></path>
              </svg>
              Zoom To
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "createGeofence",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Create a Geofence Here
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "removeFromMap",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Remove from Live Map
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Directions */}
            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "directionsTo",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12,5 19,12 12,19"></polyline>
              </svg>
              Get Directions To Here
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "directionsFrom",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12,5 5,12 12,19"></polyline>
              </svg>
              Get Directions From Here
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Vehicle Options */}
            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "editVehicle",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Vehicle
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "editDriver",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Edit Driver
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "sendMessage",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Send Message
            </button>

            <button
              onClick={() =>
                handleVehicleMenuAction(
                  "roadsideAssistance",
                  vehicleContextMenu.vehicleData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
              Roadside Assistance
            </button>
          </div>
        </div>
      )}

      {/* Geofence Context Menu */}
      {geofenceContextMenu.visible && geofenceContextMenu.geofenceData && (
        <div
          className="fixed z-[1002] bg-white border border-gray-200 rounded-lg shadow-lg min-w-48"
          style={{
            left: `${Math.min(
              geofenceContextMenu.x,
              window.innerWidth - 200
            )}px`,
            top: `${Math.max(
              10,
              Math.min(geofenceContextMenu.y, window.innerHeight - 300)
            )}px`,
          }}
        >
          {/* Geofence Name Header */}
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <div
              className="font-semibold text-gray-900 text-sm truncate"
              title={
                geofenceContextMenu.geofenceData.geofenceName ||
                "Unnamed Geofence"
              }
            >
              {geofenceContextMenu.geofenceData.geofenceName &&
              geofenceContextMenu.geofenceData.geofenceName.length > 25
                ? `${geofenceContextMenu.geofenceData.geofenceName.substring(
                    0,
                    25
                  )}...`
                : geofenceContextMenu.geofenceData.geofenceName ||
                  "Unnamed Geofence"}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() =>
                handleGeofenceMenuAction(
                  "zoomTo",
                  geofenceContextMenu.geofenceData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
                <path d="M11 8v6"></path>
                <path d="M8 11h6"></path>
              </svg>
              Zoom To
            </button>

            <button
              onClick={() =>
                handleGeofenceMenuAction(
                  "streetView",
                  geofenceContextMenu.geofenceData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"></path>
                <path d="M3.6 9h16.8"></path>
                <path d="M3.6 15h16.8"></path>
                <path d="M11.5 3a17 17 0 0 0 0 18"></path>
                <path d="M12.5 3a17 17 0 0 1 0 18"></path>
              </svg>
              Street View
            </button>

            <button
              onClick={() =>
                handleGeofenceMenuAction(
                  "editPlace",
                  geofenceContextMenu.geofenceData
                )
              }
              className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Place
            </button>

            {/* ✅ DISABLED: Send Location to Garmin button */}
            <button
              disabled
              className="w-full flex items-center cursor-not-allowed gap-3 px-4 py-2 text-sm text-gray-400 bg-gray-100 opacity-50"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Send Location to Garmin
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContextMenus;

