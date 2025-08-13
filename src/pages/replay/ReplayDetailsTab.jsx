import React from "react";

const ReplayDetailsTab = ({ replayLoading, replayData }) => {
  return (
    <div className="flex-1 p-2">
      {replayLoading ? (
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
          <div className="text-sm">Loading replay data...</div>
        </div>
      ) : replayData && Array.isArray(replayData) && replayData.length > 0 ? (
        <div>
          <table className="min-w-full text-xs border border-gray-200 rounded-lg bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">#</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Speed (kph)</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">ODO</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">GPS Time</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Location</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Signal</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">ACC</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Valid</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Head</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Lat</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Lng</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Fuel</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {replayData.map((row, idx) => (
                <tr
                  key={row.msgid || idx}
                  className={idx % 2 === 0 ? "bg-blue-50/30" : "bg-white"}
                >
                  <td className="px-2 py-2 font-medium text-blue-700">{idx + 1}</td>
                  <td className={`px-2 py-2 font-semibold ` +
                    (row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-700")
                  }>
                    {row.status}
                  </td>
                  <td className={`px-2 py-2 text-right ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.speed?.toFixed(2) ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-right ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.odo?.toLocaleString() ?? "-"}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-700"
                  }`}>
                    {row.gps_time
                      ? new Date(row.gps_time).toLocaleString()
                      : "-"}
                  </td>
                  <td className={`px-2 py-2 max-w-[120px] truncate ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-700"
                  }`} title={row.locationName || row.Location}>
                    {(row.locationName || row.Location)?.length > 30
                      ? (row.locationName || row.Location).slice(0, 30) + "..."
                      : row.locationName || row.Location || "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.Signal_Strength ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.acc ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.valid ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.head ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.latitude ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.longitude ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-center ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.fuel ?? "-"}
                  </td>
                  <td className={`px-2 py-2 text-right ${
                    row.status === "Stop"
                      ? "text-[#FB2C36]"
                      : row.status === "Moving"
                      ? "text-[#00C951]"
                      : row.status === "Idle"
                      ? "text-[#F0B100]"
                      : "text-gray-800"
                  }`}>
                    {row.mileage?.toLocaleString() ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-2xl mb-2">🚗</div>
          <div className="text-sm">No replay data available</div>
        </div>
      )}
    </div>
  );
};

export default ReplayDetailsTab;
