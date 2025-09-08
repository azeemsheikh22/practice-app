import React, { useState } from 'react';
import Select from 'react-select';

// Utility to convert array of objects to CSV string
function arrayToCSV(data, columns) {
  const header = columns.map(col => col.header).join(",");
  const rows = data.map(row =>
    columns.map(col => String(row[col.key] || '')).join(",")
  );
  return [header, ...rows].join("\r\n");
}

// Utility to download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

const ManageServicePlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState(null);
  const [showFromUsersIManage, setShowFromUsersIManage] = useState(false);

  // Service plans data - empty for now as shown in the image
  const servicePlansData = [];

  // Filter options
  const typeOptions = [
    { value: 'oil-change', label: 'Oil Change' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'repair', label: 'Repair' }
  ];

  const serviceNameOptions = [
    { value: 'oil-change', label: 'Oil Change' },
    { value: 'brake-check', label: 'Brake Check' },
    { value: 'tire-rotation', label: 'Tire Rotation' },
    { value: 'engine-tune', label: 'Engine Tune-up' }
  ];

  // Compact select styles for filters
  const compactSelectStyles = {
    container: (base) => ({
      ...base,
      fontSize: "11px",
      fontWeight: "normal",
      cursor: "pointer",
    }),
    control: (base) => ({
      ...base,
      cursor: "pointer",
      minHeight: "28px",
      height: "28px",
      padding: "0 0",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      marginTop: "-4px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "28px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    menu: (base) => ({
      ...base,
      fontSize: "11px",
    }),
  };

  // CSV export columns (match table columns)
  const exportColumns = [
    { key: 'type', header: 'Type' },
    { key: 'serviceName', header: 'Service Name' },
    { key: 'description', header: 'Description' },
    { key: 'serviceTime', header: 'Service Time' },
    { key: 'distance', header: 'Distance (km)' },
    { key: 'engineHours', header: 'Engine Hours' },
    { key: 'createdOn', header: 'Created On' }
  ];

  const handleExport = () => {
    const csv = arrayToCSV(servicePlansData, exportColumns);
    downloadCSV(csv, 'service-plans.csv');
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              Manage Service Plans
            </h1>
            <p className="text-sm text-gray-600">
              Create and manage service plans for your fleet
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="btn btn-primary btn-sm bg-gradient-to-r from-[#25689f] to-[#1F557F] hover:from-[#1F557F] hover:to-[#184567] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center px-3 py-1.5 text-sm h-auto min-h-0 font-semibold">
              Create A New Service Plan
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            {/* Search Input */}
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
                placeholder="Would you like to search for Record?"
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25689f] focus:border-transparent outline-none transition-all duration-200 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Checkbox for showing service plans from users I manage */}
          <div className="flex-shrink-0">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showFromUsersIManage}
                onChange={(e) => setShowFromUsersIManage(e.target.checked)}
                className="mr-2 h-4 w-4 text-[#25689f] focus:ring-[#25689f] border-gray-300 rounded"
              />
              Show service plans from users I manage
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-md font-semibold text-gray-900">
            Showing {servicePlansData.length} of {servicePlansData.length} Service Plans
          </h3>
          <button
            onClick={handleExport}
            className="px-3 cursor-pointer py-1.5 text-sm bg-[#1F557F]/10 text-[#1F557F] hover:bg-[#1F557F]/20 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            disabled={!servicePlansData.length}
          >
            Export to CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </div>
                    <Select
                      options={typeOptions}
                      value={selectedType}
                      onChange={setSelectedType}
                      isClearable
                      placeholder="All Types"
                      classNamePrefix="react-select"
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Service Name ▲
                    </div>
                    <Select
                      options={serviceNameOptions}
                      value={selectedServiceName}
                      onChange={setSelectedServiceName}
                      isClearable
                      placeholder="All Services"
                      classNamePrefix="react-select"
                      styles={compactSelectStyles}
                    />
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Service Time
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Distance (km)
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Engine Hours
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Created On
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
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
                      Loading service plans...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-red-500">
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
                      Error loading service plans: {error}
                    </div>
                  </td>
                </tr>
              ) : servicePlansData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-12 w-12 mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-600 mb-1">No data available in table</p>
                      <p className="text-sm text-gray-500">Create your first service plan to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                servicePlansData.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      <span className="flex items-center">
                        <img
                          src="/icons/service.png"
                          alt={plan.type}
                          className="w-5 h-5 mr-1"
                        />
                        {plan.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.serviceName}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.description}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.serviceTime}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.distance}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.engineHours}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {plan.createdOn}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 hover:text-[#25689f]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 hover:text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
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
};

export default ManageServicePlans;
