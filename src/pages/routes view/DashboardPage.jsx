import React from "react";

const dashboardData = [
  {
    vehicle: "C-2815",
    assigned: "Yes",
    routeName: "S&C_UEPL KHI...",
    offRouteCount: 0,
    kmTravelled: 0,
    restAreaCount: 0,
    restAreaUsed: 0,
    totalStops: 0,
    unauthorized: 0,
  },
  {
    vehicle: "JQ-1264-48KL",
    assigned: "Yes",
    routeName: "S&C_UEPL NAIMAT...",
    offRouteCount: 32,
    kmTravelled: 5057.66,
    restAreaCount: 161,
    restAreaUsed: 161,
    totalStops: 0,
    unauthorized: 0,
  },
  {
    vehicle: "JQ-1868",
    assigned: "Yes",
    routeName: "S&C_UEPL NAIMAT...",
    offRouteCount: 428,
    kmTravelled: 1155,
    restAreaCount: 294,
    restAreaUsed: 292,
    totalStops: 8,
    unauthorized: 2,
  },
  // ...more sample rows as needed
];

export default function DashboardPage() {
  return (
    <div className="w-full">
      {/* Header - styled like PlanningPage */}
      <div className="w-full space-y-2 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">Plan Vs. Actual</h1>
              <p className="text-sm text-gray-600">Search your Vehicle from the list below</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Would you like to search for a Vehicle?"
                  className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
                /> 
              </div>
              {/* Date picker */}
              <div className="relative w-full sm:w-48">
                <input
                  type="date"
                  className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-0"
                  value={new Date().toISOString().slice(0, 10)}
                  onChange={() => {}}
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                />
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M3 11H21M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/></svg>
              </div>
            </div>
            {/* Export button removed from here, will be in table header */}
          </div>
        </div>
      </div>
      {/* Table - styled like PlanningPage */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-md font-semibold text-gray-900">Plan Vs. Actual ({dashboardData.length})</h3>
          <button
            onClick={() => alert('Export feature coming soon!')}
            className="px-3 cursor-pointer py-1.5 text-sm bg-[#1F557F]/10 text-[#1F557F] hover:bg-[#1F557F]/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Route Assigned</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Route Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Off Route Events (Count)</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">KM Travelled</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Assigned Rest Area (Count)</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Used</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Total Stops</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Unauthorized</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm text-gray-900">{row.vehicle}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.assigned}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.routeName}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.offRouteCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.kmTravelled}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.restAreaCount}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.restAreaUsed}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.totalStops}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.unauthorized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
