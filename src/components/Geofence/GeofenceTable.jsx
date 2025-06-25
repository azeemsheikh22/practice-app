import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Pencil,
  BarChart2,
  GripHorizontal,
  Trash2,
  Users,
  Tag,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchGeofences } from "../../features/geofenceSlice";

// Categories ko dynamic banaya
const getAllCategories = (geofences) => {
  if (!geofences || geofences.length === 0) return ["All"];
  const categories = [
    ...new Set(geofences.map((item) => item.Categoryname).filter(Boolean)),
  ];
  return ["All", ...categories];
};

const VisitProgressBar = ({ visits, maxVisits = 100 }) => {
  const safeVisits = visits || 0;
  const percentage = Math.min((safeVisits / maxVisits) * 100, 100);

  const getColor = (visits) => {
    if (visits >= 50) return "bg-green-500";
    if (visits >= 25) return "bg-yellow-500";
    if (visits >= 10) return "bg-orange-500";
    if (visits > 0) return "bg-blue-500";
    return "bg-gray-300";
  };

  const getTextColor = (visits) => {
    return visits > 0 ? "text-gray-900" : "text-gray-500";
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-medium min-w-[1.5rem] text-xs ${getTextColor(
          safeVisits
        )}`}
      >
        {safeVisits}
      </span>
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${getColor(
            safeVisits
          )}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {safeVisits === 0 && (
        <span className="text-xs text-gray-400">No visits</span>
      )}
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const getCategoryColor = (cat) => {
    switch (cat) {
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
        category
      )}`}
    >
      {category}
    </span>
  );
};

// Geofence Name Display with See More functionality
const GeofenceNameDisplay = ({ name }) => {
  const [showFull, setShowFull] = useState(false);
  const maxLength = 25;

  if (!name || name.length <= maxLength) {
    return (
      <div className="font-medium text-gray-900 text-sm" title={name}>
        {name || "N/A"}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div
        className="font-medium text-gray-900 cursor-pointer text-sm"
        title={name}
        onClick={() => setShowFull(!showFull)}
      >
        {showFull ? name : `${name.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={() => setShowFull(!showFull)}
        className="text-xs text-[#D52B1E] hover:text-[#B8241A] font-medium flex-shrink-0"
      >
        {showFull ? "Less" : "More"}
      </button>
    </div>
  );
};

// Address Display with See More functionality
const AddressDisplay = ({ address }) => {
  const [showFull, setShowFull] = useState(false);
  const maxLength = 30;

  if (!address || address.length <= maxLength) {
    return (
      <div className="text-xs text-gray-600 font-mono truncate" title={address}>
        {address || "N/A"}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <div
        className="text-xs text-gray-600 font-mono cursor-pointer"
        title={address}
        onClick={() => setShowFull(!showFull)}
      >
        {showFull ? address : `${address.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={() => setShowFull(!showFull)}
        className="text-xs text-[#D52B1E] hover:text-[#B8241A] font-medium flex-shrink-0"
      >
        {showFull ? "Less" : "More"}
      </button>
    </div>
  );
};

// Edit button handler
const handleEditGeofence = (item) => {
  const url = `/#/create-geofence?type=edit&matrix=false&id=${item.id}`;

  const newWindow = window.open(
    url,
    "EditGeofence",
    "width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
  );

  if (newWindow) {
    newWindow.focus();
  } else {
    alert("Please allow popups for this site to edit geofences");
  }
};

const handleViewMatrix = (item) => {
  const url = `/#/geofence-matrix?geofenceId=${
    item.id
  }&geofenceName=${encodeURIComponent(item.geofenceName)}`;

  const newWindow = window.open(
    url,
    "GeofenceMatrix",
    "width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
  );

  if (newWindow) {
    newWindow.focus();
  } else {
    alert("Please allow popups for this site to view geofence matrix");
  }
};

export default function GeofenceTable() {
  const [selectedRows, setSelectedRows] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Horizontal scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showScrollHelper, setShowScrollHelper] = useState(false);
  const tableContainerRef = useRef(null);

  const dispatch = useDispatch();
  const { geofences, loading, error, searchQuery } = useSelector(
    (state) => state.geofence
  );

  const categories = useMemo(() => getAllCategories(geofences), [geofences]);

  const filteredData = useMemo(() => {
    if (!geofences || geofences.length === 0) return [];

    return (
      geofences
        .filter((item) => {
          const matchesCategory =
            categoryFilter === "All" || item.Categoryname === categoryFilter;

          const matchesSearch =
            !searchQuery ||
            item.geofenceName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Categoryname?.toLowerCase().includes(
              searchQuery.toLowerCase()
            );

          return matchesCategory && matchesSearch;
        })
        // NEW: Sort by totalvisits in descending order (highest first)
        .sort((a, b) => {
          const visitsA = a.totalvisits || 0;
          const visitsB = b.totalvisits || 0;
          return visitsB - visitsA; // Descending order
        })
    );
  }, [geofences, categoryFilter, searchQuery]);

  const visibleData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  // Check if horizontal scroll is needed
  useEffect(() => {
    const checkScrollNeed = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth } = tableContainerRef.current;
        setShowScrollHelper(scrollWidth > clientWidth);
      }
    };

    checkScrollNeed();
    window.addEventListener("resize", checkScrollNeed);

    return () => window.removeEventListener("resize", checkScrollNeed);
  }, [visibleData]);

  // Horizontal scroll handlers
  const handleMouseDown = (e) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setDragStart(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - dragStart) * 2;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;

      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (visibleCount < filteredData.length && !isLoadingMore) {
          setIsLoadingMore(true);

          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 50, filteredData.length));
            setIsLoadingMore(false);
          }, 300);
        }
      }
    },
    [visibleCount, filteredData.length, isLoadingMore]
  );

  useEffect(() => {
    setVisibleCount(50);
    setSelectedRows({});
  }, [categoryFilter, searchQuery]);

  // Optimized row selection handlers
  const handleRowSelect = useCallback((index, event) => {
    event?.stopPropagation();
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSelected = Object.keys(selectedRows).length === visibleData.length;
    if (allSelected) {
      setSelectedRows({});
    } else {
      const newSelection = {};
      visibleData.forEach((_, index) => {
        newSelection[index] = true;
      });
      setSelectedRows(newSelection);
    }
  }, [selectedRows, visibleData]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    const selectedItems = Object.keys(selectedRows)
      .filter((key) => selectedRows[key])
      .map((index) => visibleData[parseInt(index)]);

    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} geofence(s)?`
    );

    if (confirmDelete) {
      // TODO: Implement delete API call
      setSelectedRows({});
    }
  }, [selectedRows, visibleData]);

  const handleBulkAssignGroup = useCallback(() => {
    const selectedItems = Object.keys(selectedRows)
      .filter((key) => selectedRows[key])
      .map((index) => visibleData[parseInt(index)]);

    if (selectedItems.length === 0) return;

    const groupName = prompt("Enter group name to assign:");
    if (groupName) {
      setSelectedRows({});
    }
  }, [selectedRows, visibleData]);

  const handleBulkAssignCategory = useCallback(() => {
    const selectedItems = Object.keys(selectedRows)
      .filter((key) => selectedRows[key])
      .map((index) => visibleData[parseInt(index)]);

    if (selectedItems.length === 0) return;

    const categoryName = prompt("Enter category name to assign:");
    if (categoryName) {
      setSelectedRows({});
    }
  }, [selectedRows, visibleData]);

  const handleDeselectAll = useCallback(() => {
    setSelectedRows({});
  }, []);

  const selectedCount = Object.keys(selectedRows).filter(
    (key) => selectedRows[key]
  ).length;

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading geofences...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-500 text-sm font-medium mb-2">
              Error loading geofences
            </div>
            <div className="text-gray-600 text-xs">{error}</div>
            <button
              onClick={() => dispatch(fetchGeofences())}
              className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden relative">
      {/* Table Header with Actions - Compact */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-md font-semibold text-gray-900">
              Geofences ({filteredData.length})
            </h3>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedCount} selected
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleBulkDelete}
                    className="p-1 text-red-600 hover:bg-red-50 rounded text-lg"
                    title="Delete Selected"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={handleBulkAssignGroup}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded text-lg"
                    title="Assign Group"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={handleBulkAssignCategory}
                    className="p-1 text-green-600 hover:bg-green-50 rounded text-lg"
                    title="Assign Category"
                  >
                    <Tag size={16} />
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded text-lg"
                    title="Deselect All"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter - Compact */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs bg-white min-w-[100px]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scroll Helper */}
      {showScrollHelper && (
        <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <GripHorizontal size={12} />
            <span className="text-xs">
              Drag horizontally or use scroll to view all columns
            </span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div
        ref={tableContainerRef}
        className="overflow-auto max-h-[calc(100vh-300px)]"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header - Compact */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={
                    visibleData.length > 0 &&
                    Object.keys(selectedRows).length === visibleData.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 w-4 h-4"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Geofence Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Address
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                City
              </th>

              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body - Compact */}
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium">
                      No geofences found
                    </div>
                    <div className="text-xs mt-1">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "No geofences available"}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              visibleData.map((item, index) => (
                <tr
                  key={`${item.id}-${index}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows[index] ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows[index] || false}
                      onChange={(e) => handleRowSelect(index, e)}
                      className="rounded border-gray-300 w-4 h-4"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <VisitProgressBar visits={item.totalvisits} />
                  </td>
                  <td className="px-3 py-2">
                    <GeofenceNameDisplay name={item.geofenceName} />
                  </td>
                  <td className="px-3 py-2">
                    <CategoryBadge category={item.Categoryname} />
                  </td>
                  <td className="px-3 py-2">
                    <AddressDisplay address={item.address} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-600">
                      {item.city || "N/A"}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.chkShowOnMap
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.chkShowOnMap ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditGeofence(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Geofence"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleViewMatrix(item)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="View Matrix"
                      >
                        <BarChart2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading more...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
