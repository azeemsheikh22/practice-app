import React, { useEffect } from "react";
// Utility to convert array of objects to CSV string
function arrayToCSV(data, columns) {
  const header = columns.map((col) => col.header).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) val = "";
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...rows].join("\r\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoutePlanList,
  selectRoutePlans,
  selectRoutePlansLoading,
  selectRoutePlansError,
} from "../../features/routeSlice";

export default function PlanningPage() {
  const dispatch = useDispatch();
  const routePlans = useSelector(selectRoutePlans);
  const routePlansLoading = useSelector(selectRoutePlansLoading);
  const routePlansError = useSelector(selectRoutePlansError);

  useEffect(() => {
    dispatch(fetchRoutePlanList());
  }, [dispatch]);

  // Use API data, no fallback to dummy data
  const planningData = routePlans || [];
  // CSV export columns (match table columns)
  const exportColumns = [
    { key: "planName", header: "Plan Name" },
    { key: "PlanDate", header: "Schedule Date" },
    { key: "TotalStops", header: "Stops" },
    { key: "TotalDistance", header: "Distance" },
    { key: "TotalDuration", header: "Duration" },
    { key: "RouteVehicles", header: "Vehicle" },
    { key: "status", header: "Status" },
  ];

  const handleExport = () => {
    if (!planningData.length) return;
    const csv = arrayToCSV(planningData, exportColumns);
    downloadCSV(csv, "route-plans.csv");
  };

  return (
    <div className="w-full">
      {/* Header - styled like RouteHeader */}
      <div className="w-full space-y-2 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                Route Plans List
              </h1>
              <p className="text-sm text-gray-600">
                Search and edit your Route from the list below
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  const newWindow = window.open(
                    "/#/create-route-plan",
                    "CreateRoutePlan",
                    "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
                  );
                  if (newWindow) {
                    newWindow.focus();
                  } else {
                    alert("Please allow popups for this site to create routes");
                  }
                }}
                className="btn btn-primary btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0 font-semibold"
              >
                Create a new Route Plan
              </button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <svg
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Would you like to search for a Route?"
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
                />
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-[#25689f] rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">
                  {routePlansLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-[#25689f]">
                        {planningData.length}
                      </span>{" "}
                      Route Plans
                    </>
                  )}
                </span>
              </div>
            </div>
            {/* Export button removed from here, will be in table header */}
          </div>
        </div>
      </div>
      {/* Table - styled like RouteTable */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-md font-semibold text-gray-900">
            Route Plans ({planningData.length})
          </h3>
          <button
            onClick={handleExport}
            className="px-3 cursor-pointer py-1.5 text-sm bg-[#1F557F]/10 text-[#1F557F] hover:bg-[#1F557F]/20 rounded-lg transition-colors disabled:opacity-50"
            disabled={!planningData.length}
          >
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Schedule Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Stops
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routePlansLoading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-[#25689f]"
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
                      Loading route plans...
                    </div>
                  </td>
                </tr>
              ) : routePlansError ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-3 py-8 text-center text-red-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-8 w-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Error loading route plans: {routePlansError}
                    </div>
                  </td>
                </tr>
              ) : planningData.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-8 w-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      No route plans found
                    </div>
                  </td>
                </tr>
              ) : (
                planningData.map((row, idx) => (
                  <tr key={row.idx || idx}>
                    <td className="px-3 py-2">
                      <input type="checkbox" />
                    </td>
                    <td
                      className="px-3 py-2 text-sm font-medium text-gray-900"
                      title={row.planName}
                    >
                      {row.planName}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {row.PlanDate}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {row.TotalStops}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {row.TotalDistance}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {row.TotalDuration}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {row.RouteVehicles}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : row.status === "InProcess"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 hover:text-[#25689f] cursor-pointer"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h18"
                        />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
