import React from "react";
import { useSelector } from "react-redux";
import { selectReplayTrips, selectReplayTripsLoading } from "../../features/replaySlice";


const tripFields = [
  { label: "Start Time", key: "Start Time", type: "datetime" },
  { label: "Arrival Time", key: "Arrival Time", type: "datetime" },
  { label: "Start Location", key: "Start Location" },
  { label: "Stop Location", key: "Stop Location" },
  { label: "Distance (km)", key: "Distance" },
  { label: "Travel Time", key: "Travel Time" },
  { label: "Standing Time", key: "Standing Time" },
  { label: "Idle Duration", key: "Idle Duration" },
  { label: "Avg Speed", key: "Avg Speed" },
  { label: "Max Speed", key: "Max Speed" },
  { label: "Driver", key: "Driver" },
];

const ReplayTripsTab = ({ selectedVehicle }) => {
  const trips = useSelector(selectReplayTrips);
  const loading = useSelector(selectReplayTripsLoading);

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
        <div className="grid gap-4" style={{maxHeight: '70vh', overflowY: 'auto', paddingBottom: 8}}>
          {trips.map((trip, idx) => (
            <div
              key={idx}
              className="rounded-xl shadow-md border border-gray-200 bg-white p-4 flex flex-col gap-2 hover:shadow-lg transition relative"
              style={{minWidth: 320}}
            >
              <div className="absolute top-2 right-4 text-xs text-gray-400 font-semibold">Trip #{idx+1}</div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {tripFields.map(field => (
                  <div key={field.key} className="flex flex-col min-w-[160px] max-w-[260px]">
                    <span className="text-[11px] text-gray-500 font-medium">{field.label}</span>
                    <span className="text-[13px] font-semibold text-gray-800 truncate" title={trip[field.key] ? String(trip[field.key]) : "-"}>
                      {field.type === "datetime" && trip[field.key]
                        ? new Date(trip[field.key]).toLocaleString()
                        : (trip[field.key] ?? "-")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
