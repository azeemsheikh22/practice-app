import React, { useState } from "react";
import { motion } from "framer-motion";


const MatrixTable = ({ matrixTableData, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const tableData = matrixTableData || [];

  // Helper function to format date-time strings to readable time
  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    if (typeof dateTime === "object" && Object.keys(dateTime).length === 0) return "";
    const date = new Date(dateTime);
    if (isNaN(date)) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function to safely render values that might be objects
  const safeRender = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }
    return String(value);
  };

  // Toggle expanded state for a row and field
  const toggleExpand = (index, field) => {
    setExpandedRows((prev) => {
      const key = `${index}-${field}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Render text with truncation and "see more" toggle
  const renderExpandableText = (text, index, field, limit = 15) => {
    const isExpanded = expandedRows[`${index}-${field}`];
    if (text.length <= limit) {
      return text;
    }
    if (isExpanded) {
      return (
        <>
          {text}{" "}
          <button
            onClick={() => toggleExpand(index, field)}
            className="text-blue-600 text-xs cursor-pointer underline ml-1"
          >
            see less
          </button>
        </>
      );
    }
    return (
      <>
        {text.slice(0, limit)}{" "}
        <button
          onClick={() => toggleExpand(index, field)}
          className="text-blue-600 text-xs cursor-pointer underline ml-1"
        >
          see more
        </button>
      </>
    );
  };

  // Filter data based on single search input for vehicle or driver (case-insensitive) using startsWith
  const filteredData = tableData.filter((row) => {
    const search = searchTerm.toLowerCase();
    const vehicleMatch = typeof row.car_name === "string" && row.car_name.toLowerCase().startsWith(search);
    const driverMatch = typeof row.Driver === "string" && row.Driver.toLowerCase().startsWith(search);
    return vehicleMatch || driverMatch;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Input */}
      <div className="p-4 bg-gray-50">
        <input
          type="text"
          placeholder="Search Vehicle or Driver"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
      {/* Table */}
      <div className="flex-1 w-full overflow-auto max-h-[79vh]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="ml-2 text-amber-600 font-medium">Loading table...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No results found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Arrival Time
                </th>
                <th className="px-4 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Departure Time
                </th>
                <th className="px-4 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-4 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Stop Duration
                </th>
                <th className="px-4 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 uppercase tracking-wider">
                  Travel Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#D52B1E]/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-[#D52B1E] font-medium text-sm">
                          {safeRender(row.car_name).slice(-2)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {renderExpandableText(safeRender(row.car_name), index, "car_name")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderExpandableText(safeRender(row.Driver), index, "Driver")}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatTime(row.StartDateTime)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {formatTime(row.EndDateTime)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {row.Distance !== undefined ? safeRender(row.Distance) : ""}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {safeRender(row.stopDuration)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {safeRender(row.driveduration)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MatrixTable;

