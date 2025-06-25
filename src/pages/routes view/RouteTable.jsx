import { useState, useMemo, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";

const RouteTable = () => {
  const [selectedRows, setSelectedRows] = useState({});

  // Static route data (6-7 lines)
  const routeData = [
    {
      id: 1,
      routeName: "Karachi to Lahore Express Route",
      origin: "Karachi Port Area, Sindh",
      destination: "Lahore Industrial Area, Punjab",
    },
    {
      id: 2,
      routeName: "Islamabad City Tour",
      origin: "Blue Area, Islamabad",
      destination: "Faisal Mosque, Islamabad",
    },
    {
      id: 3,
      routeName: "Multan to Faisalabad Highway",
      origin: "Multan Cantt Station",
      destination: "Faisalabad Clock Tower Area",
    },
    {
      id: 4,
      routeName: "Peshawar to Swat Valley Route",
      origin: "Peshawar University Road",
      destination: "Mingora Swat Main Bazaar",
    },
    {
      id: 5,
      routeName: "Quetta to Gwadar Coastal Highway",
      origin: "Quetta Railway Station",
      destination: "Gwadar Port Authority",
    },
    {
      id: 6,
      routeName: "Sialkot to Gujranwala Industrial Route",
      origin: "Sialkot International Airport",
      destination: "Gujranwala Industrial Estate",
    },
    {
      id: 7,
      routeName: "Hyderabad to Sukkur National Highway",
      origin: "Hyderabad Bypass Road",
      destination: "Sukkur Barrage Area",
    },
  ];

  // Row selection handlers
  const handleRowSelect = useCallback((index) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = Object.keys(selectedRows).length === routeData.length;
    if (allSelected) {
      setSelectedRows({});
    } else {
      const newSelection = {};
      routeData.forEach((_, index) => {
        newSelection[index] = true;
      });
      setSelectedRows(newSelection);
    }
  }, [selectedRows, routeData.length]);

  const handleDeleteSelected = () => {
    const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;
    if (selectedCount > 0) {
      alert(`Delete ${selectedCount} selected routes?`);
      setSelectedRows({});
    }
  };

  const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      {/* ✅ COMPACT Table Header - Similar to GeofenceTable */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-md font-semibold text-gray-900">
              Routes ({routeData.length})
            </h3>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedCount} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-1 text-red-600 hover:bg-red-50 rounded text-lg"
                  title="Delete Selected"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ COMPACT Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* ✅ COMPACT Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedCount === routeData.length && routeData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Route Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* ✅ COMPACT Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {routeData.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">No routes found</div>
                    <div className="text-xs mt-1">No routes available</div>
                  </div>
                </td>
              </tr>
            ) : (
              routeData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-blue-50" : ""
                  }`}
                >
                      <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900" title={item.routeName}>
                      {truncateText(item.routeName, 35)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-600" title={item.origin}>
                      {truncateText(item.origin, 30)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-600" title={item.destination}>
                      {truncateText(item.destination, 30)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Route"
                      >
                        <Pencil className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
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
  );
};

export default RouteTable;

