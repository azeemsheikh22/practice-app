import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, RefreshCw } from "lucide-react";

const MatrixTable = ({ selectedTimeFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("vehicle");
  const [sortDirection, setSortDirection] = useState("asc");

  // Dummy table data
  const tableData = [
    {
      id: 1,
      vehicle: "TRK-001",
      driver: "Ahmed Ali",
      arrivalTime: "08:30 AM",
      departureTime: "10:15 AM",
      distance: "45.2 km",
      stopDuration: "1h 45m",
      travelDuration: "3h 20m"
    },
    {
      id: 2,
      vehicle: "TRK-002",
      driver: "Muhammad Hassan",
      arrivalTime: "09:15 AM",
      departureTime: "11:30 AM",
      distance: "67.8 km",
      stopDuration: "2h 15m",
      travelDuration: "4h 10m"
    },
    {
      id: 3,
      vehicle: "TRK-003",
      driver: "Fatima Khan",
      arrivalTime: "07:45 AM",
      departureTime: "09:20 AM",
      distance: "32.1 km",
      stopDuration: "1h 35m",
      travelDuration: "2h 50m"
    },
    {
      id: 4,
      vehicle: "TRK-004",
      driver: "Ali Raza",
      arrivalTime: "10:00 AM",
      departureTime: "12:45 PM",
      distance: "89.3 km",
      stopDuration: "2h 45m",
      travelDuration: "5h 15m"
    },
    {
      id: 5,
      vehicle: "TRK-005",
      driver: "Sara Ahmed",
      arrivalTime: "11:30 AM",
      departureTime: "01:15 PM",
      distance: "23.7 km",
      stopDuration: "1h 45m",
      travelDuration: "2h 30m"
    },
    {
      id: 6,
      vehicle: "TRK-006",
      driver: "Omar Sheikh",
      arrivalTime: "06:45 AM",
      departureTime: "08:30 AM",
      distance: "56.4 km",
      stopDuration: "1h 45m",
      travelDuration: "3h 45m"
    },
    {
      id: 7,
      vehicle: "TRK-007",
      driver: "Zainab Malik",
      arrivalTime: "12:15 PM",
      departureTime: "02:30 PM",
      distance: "41.8 km",
      stopDuration: "2h 15m",
      travelDuration: "3h 10m"
    },
    {
      id: 8,
      vehicle: "TRK-008",
      driver: "Hassan Qureshi",
      arrivalTime: "09:45 AM",
      departureTime: "11:20 AM",
      distance: "78.9 km",
      stopDuration: "1h 35m",
      travelDuration: "4h 25m"
    }
  ];

  // Filter and sort data
  const filteredData = tableData.filter(item =>
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    console.log("Exporting data for:", selectedTimeFilter);
    alert("Export functionality will be implemented");
  };

  const handleRefresh = () => {
    console.log("Refreshing data for:", selectedTimeFilter);
    alert("Data refreshed successfully");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Vehicle Matrix Data
            </h2>
            <p className="text-sm text-gray-600">
              Showing data for: {selectedTimeFilter.replace('_', ' ')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicle or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D52B1E] focus:border-[#D52B1E] w-64"
              />
            </div>
            
            {/* Action Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={14} className="mr-1" />
              Export
            </motion.button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('vehicle')}
              >
                <div className="flex items-center space-x-1">
                  <span>Vehicle</span>
                  {sortField === 'vehicle' && (
                    <span className="text-[#D52B1E]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('driver')}
              >
                <div className="flex items-center space-x-1">
                  <span>Driver</span>
                  {sortField === 'driver' && (
                    <span className="text-[#D52B1E]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrival Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departure Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stop Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Travel Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#D52B1E]/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-[#D52B1E] font-medium text-sm">
                        {row.vehicle.slice(-2)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {row.vehicle}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.driver}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {row.arrivalTime}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {row.departureTime}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {row.distance}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.stopDuration}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {row.travelDuration}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* No Data State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg font-medium mb-2">
              No data found
            </div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search or time filter
            </div>
          </div>
        )}
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredData.length} of {tableData.length} entries
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatrixTable;
