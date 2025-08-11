import React from "react";

const planningData = [
  {
    planName: "JQ-1264-48KL to ...",
    scheduleDate: "15/02/2025",
    stops: 0,
    distance: "0 km",
    duration: "00h 00m 00s",
    vehicle: "JQ-1264-48KL",
    status: "InProcess",
  },
  {
    planName: "TMG-534 30Jan24",
    scheduleDate: "30/01/2025",
    stops: 0,
    distance: "0 km",
    duration: "00h 00m 00s",
    vehicle: "TMG-534",
    status: "Completed",
  },
  {
    planName: "KHI-NAIMAT",
    scheduleDate: "20/01/2025",
    stops: 0,
    distance: "0 km",
    duration: "00h 00m 00s",
    vehicle: "TMG-534",
    status: "Completed",
  },
  // ...more sample rows as needed
];

export default function PlanningPage() {
  return (
    <div className="w-full">
      {/* Header - styled like RouteHeader */}
      <div className="w-full space-y-2 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">Route Plans List</h1>
              <p className="text-sm text-gray-600">Search and edit your Route from the list below</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => alert('Create new Route Plan feature coming soon!')}
                className="btn btn-primary btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0 font-semibold"
              >
                Create a new Route Plan
              </button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Would you like to search for a Route?"
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
                />
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-[#25689f] rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">
                  Showing <span className="font-semibold text-[#25689f]">344</span> Route Plans
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
          <h3 className="text-md font-semibold text-gray-900">Route Plans ({planningData.length})</h3>
          <button
            onClick={() => alert('Export feature coming soon!')}
            className="px-3 cursor-pointer py-1.5 text-sm bg-[#1F557F]/10 text-[#1F557F] hover:bg-[#1F557F]/20 rounded-lg transition-colors disabled:opacity-50"
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
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Plan Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Schedule Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Stops</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Distance</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Duration</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {planningData.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900" title={row.planName}>{row.planName}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.scheduleDate}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.stops}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.distance}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.duration}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.vehicle}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.status}</td>
                  <td className="px-3 py-2 text-sm text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-[#25689f] cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h18" /></svg></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
