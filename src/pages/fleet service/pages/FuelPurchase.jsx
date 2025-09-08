import React, { useState } from 'react';
import Select from 'react-select';

const FuelPurchase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({ value: 'this-month', label: 'This Month' });
  const [selectedVehicle, setSelectedVehicle] = useState({ value: 'all', label: 'All Vehicle' });

  // Empty fuel purchase data - as shown in the image
  const fuelPurchaseData = [];

  // Period options for "Show purchases for"
  const periodOptions = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Vehicle filter options
  const vehicleOptions = [
    { value: 'all', label: 'All Vehicle' },
    { value: 'vehicle-1', label: 'Vehicle 1' },
    { value: 'vehicle-2', label: 'Vehicle 2' }
  ];

  // Stats data - all zeros as shown in image
  const statsData = {
    totalQuantity: '0.00',
    totalCost: '0.00',
    averagePrice: '0.00'
  };

  // Date range for current selection
  const dateRange = '01/09/2025 - 08/09/2025';

  // Custom select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      cursor: "pointer",
      minHeight: "32px",
      fontSize: "14px",
      borderColor: state.isFocused ? "#25689f" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #25689f" : "none",
      "&:hover": {
        borderColor: "#25689f"
      }
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#25689f" : state.isFocused ? "#f3f4f6" : "white",
      color: state.isSelected ? "white" : "#374151"
    })
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              Fuel Purchases
            </h1>
          </div>
          
          {/* Add Button */}
          <div className="flex-shrink-0">
            <button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
              + Add Fuel Purchase
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
          {/* Show purchases for */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">
              Show purchases for:
            </label>
            <div className="w-40">
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          {/* Filter transactions for this vehicle */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap">
              Filter transactions for this vehicle:
            </label>
            <div className="w-40">
              <Select
                options={vehicleOptions}
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mt-3">
          <span className="text-sm text-gray-600">{dateRange}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Quantity */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {statsData.totalQuantity} L
            </div>
            <div className="text-sm text-gray-600">
              Total Quantity
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              PKR {statsData.totalCost}
            </div>
            <div className="text-sm text-gray-600">
              Total Cost
            </div>
          </div>
        </div>

        {/* Average Price per Unit */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              PKR {statsData.averagePrice}
            </div>
            <div className="text-sm text-gray-600">
              Average Price per Unit
            </div>
          </div>
        </div>
      </div>

      {/* No Records Found Message */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">
            No Fuel Purchase Records Found
          </h2>
        </div>
      </div>

      {/* Table Structure (Empty) */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Vehicle ▲
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Location Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Volume (L)
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Unit Cost (PKR/L)
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Cost (PKR)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
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
                      Loading fuel purchases...
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
                      Error loading fuel purchases: {error}
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                    <div className="text-sm">
                      No data available in table
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination area (empty state) */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="p-2 text-gray-400 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center mx-1">
                <div className="w-full h-1 bg-gray-400 rounded"></div>
              </div>
              <button className="p-2 text-gray-400 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelPurchase;
