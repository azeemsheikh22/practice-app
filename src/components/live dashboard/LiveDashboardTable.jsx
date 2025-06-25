import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Gauge,
  Phone,
  ChevronDown,
  Navigation,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useSelector } from "react-redux";

const LiveDashboardTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  // Get filtered vehicles from Redux
  const { filteredVehicles = [], activeFilter = null } = useSelector(
    (state) => state.liveDashboard || {}
  );

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case "Moving":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
          icon: <Navigation className="w-3 h-3" />,
        };
      case "Stop":
        return {
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          icon: <AlertTriangle className="w-3 h-3" />,
        };
      case "Idle":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          icon: <Clock className="w-3 h-3" />,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          icon: <Activity className="w-3 h-3" />,
        };
    }
  };

  // Speed indicator component
  const SpeedIndicator = ({ speed }) => {
    const getSpeedColor = (speed) => {
      if (speed === 0) return "text-gray-500";
      if (speed <= 30) return "text-green-600";
      if (speed <= 60) return "text-yellow-600";
      return "text-red-600";
    };

    return (
      <div className="flex items-center space-x-2">
        <Gauge className={`w-4 h-4 ${getSpeedColor(speed)}`} />
        <span className={`font-medium ${getSpeedColor(speed)}`}>
          {speed} km/h
        </span>
      </div>
    );
  };

  // Location component with truncation
  const LocationDisplay = ({ location }) => {
    const [showFull, setShowFull] = useState(false);
    const maxLength = 20;

    if (location.length <= maxLength) {
      return <span className="text-sm text-gray-700">{location}</span>;
    }

    return (
      <div className="space-y-1">
        <span className="text-sm text-gray-700">
          {showFull ? location : `${location.substring(0, maxLength)}...`}
        </span>
        <button
          onClick={() => setShowFull(!showFull)}
          className="text-xs text-[#D52B1E] hover:text-[#B8241A] font-medium"
        >
          {showFull ? "Show Less" : "Show More"}
        </button>
      </div>
    );
  };

  // Filter data based on search
  const searchFilteredData = useMemo(() => {
    return filteredVehicles.filter((vehicle) => {
      const matchesSearch =
        globalFilter === "" ||
        vehicle.vehicle?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.driver?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.location?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.sim?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.status?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        vehicle.currentSpot?.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesSearch;
    });
  }, [filteredVehicles, globalFilter]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "group",
        header: "Group",
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-700">
            {getValue() || <span className="text-gray-400">-</span>}
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "vehicle",
        header: "Vehicle",
        cell: ({ getValue }) => (
          <div className="font-semibold text-gray-900">{getValue()}</div>
        ),
        size: 150,
      },
      {
        accessorKey: "driver",
        header: "Driver",
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-700">
            {getValue() || <span className="text-gray-400 italic">-</span>}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          const statusDisplay = getStatusDisplay(status);
          return (
            <div
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusDisplay.bgColor} ${statusDisplay.color} ${statusDisplay.borderColor}`}
            >
              {statusDisplay.icon}
              <span>{status}</span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "lastUpdate",
        header: "Last Update",
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-600 font-mono">{getValue()}</div>
        ),
        size: 180,
      },
      {
        accessorKey: "speed",
        header: "Speed",
        cell: ({ getValue }) => <SpeedIndicator speed={getValue()} />,
        size: 100,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ getValue }) => <LocationDisplay location={getValue()} />,
        size: 300,
      },
      {
        accessorKey: "todayTravel",
        header: "Today Travel",
        cell: ({ getValue }) => (
          <div className="text-sm font-medium text-gray-700">{getValue()}</div>
        ),
        size: 120,
      },
      {
        accessorKey: "cdDuration",
        header: "CD Duration",
        cell: ({ getValue }) => (
          <div className="text-sm font-medium text-gray-700">{getValue()}</div>
        ),
        size: 120,
      },
      {
        accessorKey: "restDuration",
        header: "Rest Duration",
        cell: ({ getValue }) => (
          <div className="text-sm font-medium text-gray-700">{getValue()}</div>
        ),
        size: 120,
      },
      {
        accessorKey: "currentSpot",
        header: "Current Spot",
        cell: ({ getValue }) => (
          <div className="text-sm text-gray-700">{getValue()}</div>
        ),
        size: 120,
      },
      {
        accessorKey: "sim",
        header: "Sim #",
        cell: ({ getValue }) => (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-mono text-gray-700">
              {getValue()}
            </span>
          </div>
        ),
        size: 140,
      },
    ],
    []
  );

  const table = useReactTable({
    data: searchFilteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden my-5">
      {/* Table Header with Search */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Vehicles ({searchFilteredData.length})
            </h3>
            {activeFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Filtered by: {activeFilter}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Search */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D52B1E] focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-2 hover:text-gray-900"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              header.column.getIsSorted() === "desc"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Data State */}
      {searchFilteredData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-medium mb-2">
              No vehicles found
            </div>
            <div className="text-gray-400 text-sm">
              {globalFilter
                ? "Try adjusting your search"
                : activeFilter
                ? `No vehicles match the "${activeFilter}" filter`
                : "No vehicles available"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDashboardTable;
