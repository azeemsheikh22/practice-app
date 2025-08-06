
import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pencil, Trash2 } from "lucide-react";
import { fetchRouteListForUser, selectFilteredRoutes } from "../../features/routeSlice";

const RouteTable = () => {
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState({});

  // Get filtered routes and loading state from Redux store
  const routes = useSelector(selectFilteredRoutes);
  const routesLoading = useSelector((state) => state.route.loading);

  // Fetch routes data on component mount (fetches all, filtering is selector-based)
  useEffect(() => {
    dispatch(fetchRouteListForUser());
  }, [dispatch]);


  // Transform Redux routes data to match table structure
  const routeData = (routes || []).map((route, index) => ({
    id: index + 1,
    routeName: route.routeName || 'N/A',
    origin: route.originLatLng ? 
      `${route.originLatLng.split(' ')[0]}, ${route.originLatLng.split(' ')[1]}` : 
      'N/A',
    destination: route.destinationLatLng ? 
      `${route.destinationLatLng.split(' ')[0]}, ${route.destinationLatLng.split(' ')[1]}` : 
      'N/A',
    originID: route.OriginID || 0,
    destinationID: route.DestinationID || 0,
    routeString: route.routeString || '',
    originalData: route // Keep original data for reference
  }));

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
      const selectedRoutes = Object.keys(selectedRows)
        .filter(key => selectedRows[key])
        .map(key => routeData[key].routeName);
      
      if (window.confirm(`Are you sure you want to delete ${selectedCount} selected routes?\n\nRoutes: ${selectedRoutes.join(', ')}`)) {
        // TODO: Implement delete functionality
        console.log('Deleting routes:', selectedRoutes);
        setSelectedRows({});
      }
    }
  };

  const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text || 'N/A';
    return text.substring(0, maxLength) + "...";
  };

  // Function to format coordinates for display
  const formatCoordinates = (latLng) => {
    if (!latLng) return 'N/A';
    const [lat, lng] = latLng.split(' ');
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  };


  // CSV Export function (without Route String)
  const handleExportCSV = () => {
    if (!routeData.length) return;
    // Define CSV headers (no Route String)
    const headers = [
      'Route Name',
      'Origin',
      'Destination',
      'Origin ID',
      'Destination ID'
    ];
    // Map data rows (no Route String)
    const rows = routeData.map(row => [
      row.routeName,
      row.origin,
      row.destination,
      row.originID,
      row.destinationID
    ]);
    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routes_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      {/* ✅ COMPACT Table Header */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-md font-semibold text-gray-900">
              Routes ({routeData.length})
            </h3>
            {routesLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#25689f]"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            )}
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
          
          {/* Refresh & Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(fetchRouteListForUser())}
              disabled={routesLoading}
              className="px-3 cursor-pointer py-1.5 text-sm bg-[#25689f]/10 text-[#25689f] hover:bg-[#25689f]/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {routesLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={routeData.length === 0}
              className="px-3 cursor-pointer py-1.5 text-sm bg-[#1F557F]/10 text-[#1F557F] hover:bg-[#1F557F]/20 rounded-lg transition-colors disabled:opacity-50"
            >
              Export
            </button>
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
                  className="rounded border-gray-300 w-4 h-4 text-[#25689f] focus:ring-[#25689f]/30"
                  disabled={routeData.length === 0}
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
                    <div className="text-sm font-medium">
                      {routesLoading ? 'Loading routes...' : 'No routes found'}
                    </div>
                    <div className="text-xs mt-1">
                      {routesLoading ? 'Please wait...' : 'No routes available in the system'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              routeData.map((item, index) => (
                <tr
                  key={`route-${item.id}-${index}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-[#25689f]/10" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      className="rounded border-gray-300 w-4 h-4 text-[#25689f] focus:ring-[#25689f]/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div 
                      className="text-sm font-medium text-gray-900" 
                      title={item.routeName}
                    >
                      {truncateText(item.routeName, 35)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div 
                      className="text-sm text-gray-600" 
                      title={`Coordinates: ${item.originalData.originLatLng}`}
                    >
                      {formatCoordinates(item.originalData.originLatLng)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div 
                      className="text-sm text-gray-600" 
                      title={`Coordinates: ${item.originalData.destinationLatLng}`}
                    >
                      {formatCoordinates(item.originalData.destinationLatLng)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        className="p-1.5 cursor-pointer hover:bg-[#25689f]/10 rounded-lg transition-colors group"
                        title={`Edit Route: ${item.routeName}`}
                        onClick={() => {
                          // Navigate to edit route page with id and edit=true
                          window.open(
                            `/#/create-route?id=${item.originalData.id || item.id}&edit=true`,
                            "EditRoute",
                            "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
                          );
                        }}
                      >
                        <Pencil className="w-4 h-4 text-[#25689f] group-hover:text-[#1F557F]" />
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
