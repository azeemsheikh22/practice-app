import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from 'react-hot-toast';
import { 
  selectReplayTrips, 
  selectReplayTripsLoading, 
  selectSelectedTrip,
  setSelectedTrip,
} from "../../features/replaySlice";


const tripFields = [
  { label: "Start", key: "Start Time", type: "datetime", icon: "🚀" },
  { label: "End", key: "Arrival Time", type: "datetime", icon: "🏁" },
  { label: "From", key: "Start Location", icon: "📍" },
  { label: "To", key: "Stop Location", icon: "📌" },
  { label: "Distance", key: "Distance", icon: "🛣️", unit: "km" },
  { label: "Duration", key: "Travel Time", icon: "⏱️" },
  { label: "Standing", key: "Standing Time", icon: "🅿️" },
  { label: "Idle", key: "Idle Duration", icon: "�" },
  { label: "Avg Speed", key: "Avg Speed", icon: "🏃", unit: "km/h" },
  { label: "Max Speed", key: "Max Speed", icon: "🚀", unit: "km/h" },
];

const ReplayTripsTab = ({ selectedVehicle }) => {
  const dispatch = useDispatch();
  const trips = useSelector(selectReplayTrips);
  const loading = useSelector(selectReplayTripsLoading);
  const selectedTrip = useSelector(selectSelectedTrip);
  const filters = useSelector(state => state.replay.filters || {});
  const displayMode = filters.displayMode;

  console.log("Trips Data:", trips);

  const handleTripSelect = (trip, index) => {
    // If marker mode is active, don't allow trip selection and show toast
    if (displayMode === 'marker') {
      toast.error('Trip selection not available in Marker mode. Please switch to Line mode to select trips.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontWeight: '500',
        },
        icon: '⚠️'
      });
      return;
    }

    // If same trip is clicked, deselect it
    if (selectedTrip && selectedTrip.index === index) {
      dispatch(setSelectedTrip(null));
    } else {
      // Sirf trip select karen, checkbox ko affect na karen
      dispatch(setSelectedTrip({ ...trip, index }));
      toast.success(`Trip ${index + 1} selected successfully!`, {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#166534',
          fontWeight: '500',
        },
        icon: '✅'
      });
    }
  };

  // Clear selected trip when trips data changes (new vehicle selected)
  useEffect(() => {
    if (selectedTrip && trips && trips.length === 0) {
      dispatch(setSelectedTrip(null));
    }
  }, [trips, selectedTrip, dispatch]);

  // Monitor display mode changes
  useEffect(() => {
    if (displayMode === 'marker' && selectedTrip) {
      dispatch(setSelectedTrip(null));
    }
  }, [dispatch, selectedTrip, displayMode]);

  return (
    <div className="flex-1 p-2">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="animate-spin h-6 w-6 mb-2 text-[#25689f]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <div className="text-sm">Loading trips data...</div>
        </div>
      ) : Array.isArray(trips) && trips.length > 0 ? (
        <div className="space-y-3" style={{maxHeight: '75vh', overflowY: 'auto', paddingBottom: 8}}>
          {trips.map((trip, idx) => {
            const isSelected = selectedTrip && selectedTrip.index === idx;
            
            return (
            <div
              key={idx}
              onClick={() => handleTripSelect(trip, idx)}
              className={`rounded-lg shadow-sm border transition-all duration-200 overflow-hidden ${
                displayMode === 'marker' 
                  ? 'cursor-not-allowed opacity-70' 
                  : 'cursor-pointer'
              } ${
                isSelected 
                  ? 'border-[#25689f] bg-blue-50 shadow-md ring-2 ring-[#25689f]/20' 
                  : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
              }`}
            >
              {/* Trip Header */}
              <div className={`px-3 py-2 ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#25689f] to-[#1F557F]' 
                  : 'bg-gradient-to-r from-[#25689f] to-[#1F557F]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    🛣️ Trip {idx+1}
                    {isSelected && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Selected</span>}
                  </span>
                  <span className="text-white/90 text-xs flex items-center gap-1">
                  {trip.Driver || 'Unknown Driver'}
                  </span>
                </div>
              </div>

              {/* Trip Content - Compact Grid */}
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {tripFields.map(field => {
                    const rawValue = trip[field.key];
                    let displayValue = "-";
                    let fullValue = "-";
                    
                    if (rawValue != null) {
                      if (field.type === "datetime") {
                        const date = new Date(rawValue);
                        displayValue = date.toLocaleDateString() + " " + date.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        fullValue = date.toLocaleString();
                      } else if (typeof rawValue === 'object') {
                        displayValue = JSON.stringify(rawValue).substring(0, 20) + "...";
                        fullValue = JSON.stringify(rawValue);
                      } else {
                        const strValue = String(rawValue);
                        displayValue = strValue.length > 25 ? strValue.substring(0, 25) + "..." : strValue;
                        fullValue = strValue;
                        if (field.unit) {
                          displayValue += ` ${field.unit}`;
                          fullValue += ` ${field.unit}`;
                        }
                      }
                    }

                    return (
                      <div 
                        key={field.key} 
                        className="flex flex-col"
                        title={displayValue.includes("...") ? `${field.label}: ${fullValue}` : undefined}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px]">{field.icon}</span>
                          <span className="text-[10px] text-gray-500 font-medium">{field.label}</span>
                        </div>
                        <span className="text-[12px] font-medium text-gray-800 leading-tight truncate">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">🛣️</div>
          <div className="text-sm">
            {selectedVehicle
              ? `No trip data available for ${selectedVehicle.text}`
              : "Select a vehicle to view trip history"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplayTripsTab;
