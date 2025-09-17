import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/navber/Navbar";
import DashboardHeader from "./DashboardHeader";
import ChartCard from "../../components/charts/ChartCard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../../styles/ChartDashboard.css";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeConnection,
  selectConnectionStatus,
  selectRawVehicleList,
} from "../../features/gpsTrackingSlice";
import {
  fetchDashboardCategoriesForUser,
  selectDashboardCategories,
  selectUserDashboardData,
  // selectUserDashboardLoading,
} from "../../features/chartApiSlice";

export default function ChartDashboard() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chartConfigs, setChartConfigs] = useState({});
  const dispatch = useDispatch();
  const connectionStatus = useSelector(selectConnectionStatus);
  const dashboardCategories = useSelector(selectDashboardCategories);
  const userDashboardData = useSelector(selectUserDashboardData);
  // const userDashboardLoading = useSelector(selectUserDashboardLoading);
  const rawVehicles = useSelector(selectRawVehicleList);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, [connectionStatus, dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardCategoriesForUser());
  }, [dispatch]);

  // Auto-select group based on userDashboardData GroupID when component mounts
  useEffect(() => {
    // Only auto-select if no group is currently selected and we have data
    if (
      !selectedGroup &&
      userDashboardData &&
      userDashboardData.length > 0 &&
      rawVehicles &&
      rawVehicles.length > 0
    ) {
      // Get GroupID from first dashboard item
      const firstDashboardItem = userDashboardData[0];
      const targetGroupId = firstDashboardItem.GroupID;

      // Find matching group in rawVehicles by valueId
      const matchingGroup = rawVehicles.find(
        (vehicle) =>
          vehicle.Type === "Group" && vehicle.valueId === targetGroupId
      );

      if (matchingGroup) {
        setSelectedGroup(matchingGroup);
      } else {
        console.warn("No matching group found for GroupID:", targetGroupId);
      }
    }
  }, [selectedGroup, userDashboardData, rawVehicles]);

  // Handler functions
  const handleReportChange = (report) => {
    setSelectedReport(report);
  };

  const handleGroupChange = (group) => {
    setSelectedGroup(group);
  };

  const handleSave = () => {
    // Save functionality
  };

  const handleEditDashboard = () => {
    // Edit functionality
  };

  const handleAddMetric = () => {
    // Add metric functionality
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Export Excel functionality
  };

  const handleExportCSV = () => {
    // Export CSV functionality
  };

  const handleSettingsUpdate = (groupId, updatedSettings) => {
    setChartConfigs((prev) => ({
      ...prev,
      [groupId]: updatedSettings,
    }));
  };

  // Memoize dashboard data to prevent unnecessary re-renders
  const dashboardData = useMemo(() => {
    return userDashboardData;
  }, [userDashboardData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Dashboard Header */}
      <DashboardHeader
        selectedReport={selectedReport}
        onReportChange={handleReportChange}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupChange}
        onSave={handleSave}
        onEditDashboard={handleEditDashboard}
        onAddMetric={handleAddMetric}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        dashboardCategories={dashboardCategories}
      />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {dashboardData === null ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-blue-500 animate-pulse"></div>
              <div className="absolute inset-6 rounded-full border-4 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Loading Dashboard...</h2>
            <p className="text-gray-500 text-sm">Charts and metrics are being loaded, please wait.</p>
          </div>
        ) : dashboardData && dashboardData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...dashboardData]
              .sort(
                (a, b) => parseInt(a.ChartPriority) - parseInt(b.ChartPriority)
              )
              .map((chartData, index) => (
                <ChartCard
                  key={`chart-${chartData.GroupID}-${index}`}
                  chartData={chartData}
                  selectedGroup={selectedGroup}
                  onSettingsUpdate={handleSettingsUpdate}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <p className="text-lg">No dashboard data available</p>
              <p className="text-sm mt-1">
                Please select a category to view charts
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
