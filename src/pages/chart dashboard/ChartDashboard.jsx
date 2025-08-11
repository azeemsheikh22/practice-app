import React, { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { motion } from "framer-motion";
import { Eye, EyeOff, RotateCcw, Settings } from "lucide-react";
import Navbar from "../../components/navber/Navbar";
import DashboardHeader from "./DashboardHeader";

// Chart Components
import SpeedingViolationsGauge from "../../components/charts/SpeedingViolationsGauge";
import DistanceTraveledChart from "../../components/charts/DistanceTraveledChart";
import SpeedingTrendChart from "../../components/charts/SpeedingTrendChart";
import SpeedingSeverityChart from "../../components/charts/SpeedingSeverityChart";
import SafetyScoreChart from "../../components/charts/SafetyScoreChart";
import TotalDistanceGauge from "../../components/charts/TotalDistanceGauge";

// Chart Settings Component
import ChartSettings from "../../components/charts/ChartSettings";

// CSS imports
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../../styles/ChartDashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { initializeConnection, selectConnectionStatus } from "../../features/gpsTrackingSlice";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ChartDashboard() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const dispatch = useDispatch();
  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  // Chart visibility state
  const [chartVisibility, setChartVisibility] = useState({
    speedingGauge: true,
    distanceChart: true,
    trendChart: true,
    severityChart: true,
    safetyChart: true,
    totalDistanceGauge: true,
  });

  // Chart settings state
  const [chartSettings, setChartSettings] = useState({
    speedingGauge: false,
    distanceChart: false,
    trendChart: false,
    severityChart: false,
    safetyChart: false,
    totalDistanceGauge: false,
  });

  // Layout configuration
  const [layouts, setLayouts] = useState({
    lg: [
      { i: "speedingGauge", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      { i: "distanceChart", x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      { i: "trendChart", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      { i: "severityChart", x: 0, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
      { i: "safetyChart", x: 4, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
      { i: "totalDistanceGauge", x: 8, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
    ],
    md: [
      { i: "speedingGauge", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: "distanceChart", x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: "trendChart", x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
      { i: "severityChart", x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
      { i: "safetyChart", x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
      { i: "totalDistanceGauge", x: 6, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
    ],
    sm: [
      { i: "speedingGauge", x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
      { i: "distanceChart", x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
      { i: "trendChart", x: 0, y: 8, w: 12, h: 4, minW: 6, minH: 3 },
      { i: "severityChart", x: 0, y: 12, w: 12, h: 4, minW: 6, minH: 3 },
      { i: "safetyChart", x: 0, y: 16, w: 12, h: 4, minW: 6, minH: 3 },
      { i: "totalDistanceGauge", x: 0, y: 20, w: 12, h: 4, minW: 6, minH: 3 },
    ],
  });

  // Chart definitions
  const chartDefinitions = {
    speedingGauge: {
      title: "Speeding Violations",
      component: SpeedingViolationsGauge,
      icon: "🚨",
    },
    distanceChart: {
      title: "Distance Traveled",
      component: DistanceTraveledChart,
      icon: "📊",
    },
    trendChart: {
      title: "Speeding Trend",
      component: SpeedingTrendChart,
      icon: "📈",
    },
    severityChart: {
      title: "Speeding Severity",
      component: SpeedingSeverityChart,
      icon: "⚠️",
    },
    safetyChart: {
      title: "Safety Score",
      component: SafetyScoreChart,
      icon: "🛡️",
    },
    totalDistanceGauge: {
      title: "Total Distance",
      component: TotalDistanceGauge,
      icon: "🎯",
    },
  };

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

  // Layout change handler
  const handleLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
  };

  // Toggle chart visibility with debounce protection
  const toggleChartVisibility = (chartId) => {
    setChartVisibility((prev) => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  // Toggle chart settings
  const toggleChartSettings = (chartId) => {
    setChartSettings((prev) => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  // Handle settings save
  const handleSettingsSave = (chartId, settings) => {
    console.log(`Settings saved for ${chartId}:`, settings);
    // Here you would typically save the settings to your backend or state
    setChartSettings((prev) => ({
      ...prev,
      [chartId]: false,
    }));
  };

  // Handle settings cancel
  const handleSettingsCancel = (chartId) => {
    setChartSettings((prev) => ({
      ...prev,
      [chartId]: false,
    }));
  };

  // Handle settings delete
  const handleSettingsDelete = (chartId) => {
    console.log(`Settings deleted for ${chartId}`);
    // Here you would typically delete the chart or reset its settings
    setChartSettings((prev) => ({
      ...prev,
      [chartId]: false,
    }));
  };

  // Reset layout and visibility
  const resetLayout = () => {
    // Reset layouts
    setLayouts({
      lg: [
        { i: "speedingGauge", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "distanceChart", x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "trendChart", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "severityChart", x: 0, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "safetyChart", x: 4, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
        { i: "totalDistanceGauge", x: 8, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
      ],
      md: [
        { i: "speedingGauge", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "distanceChart", x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "trendChart", x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "severityChart", x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "safetyChart", x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "totalDistanceGauge", x: 6, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
      ],
      sm: [
        { i: "speedingGauge", x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
        { i: "distanceChart", x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
        { i: "trendChart", x: 0, y: 8, w: 12, h: 4, minW: 6, minH: 3 },
        { i: "severityChart", x: 0, y: 12, w: 12, h: 4, minW: 6, minH: 3 },
        { i: "safetyChart", x: 0, y: 16, w: 12, h: 4, minW: 6, minH: 3 },
        { i: "totalDistanceGauge", x: 0, y: 20, w: 12, h: 4, minW: 6, minH: 3 },
      ],
    });

    // Reset all charts visibility to true
    setChartVisibility({
      speedingGauge: true,
      distanceChart: true,
      trendChart: true,
      severityChart: true,
      safetyChart: true,
      totalDistanceGauge: true,
    });

    // Reset all settings to false
    setChartSettings({
      speedingGauge: false,
      distanceChart: false,
      trendChart: false,
      severityChart: false,
      safetyChart: false,
      totalDistanceGauge: false,
    });
  };

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
      />

      {/* Dashboard Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Chart Visibility Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Charts:
            </span>
            {Object.entries(chartDefinitions).map(([chartId, chart]) => (
              <button
                key={chartId}
                onClick={() => toggleChartVisibility(chartId)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  chartVisibility[chartId]
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {chartVisibility[chartId] ? (
                  <Eye size={12} className="mr-1" />
                ) : (
                  <EyeOff size={12} className="mr-1" />
                )}
                <span className="mr-1">{chart.icon}</span>
                {chart.title}
              </button>
            ))}
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetLayout}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
            >
              <RotateCcw size={14} className="mr-1" />
              Reset Layout
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4">
        {selectedReport && selectedGroup ? (
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    {selectedReport.label} Dashboard
                  </h2>
                  <p className="text-sm text-blue-700">
                    Showing data for:{" "}
                    <span className="font-medium">{selectedGroup.text}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">
                    Active Charts:{" "}
                    {Object.values(chartVisibility).filter(Boolean).length} /{" "}
                    {Object.keys(chartDefinitions).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}

        {/* Responsive Grid Layout */}
        <div className="overflow-hidden">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 6, xxs: 2 }}
            rowHeight={80}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
            preventCollision={false}
            compactType="vertical"
            isBounded={true}
            onDrag={(layout, oldItem, newItem, placeholder, e, element) => {
              if (newItem.x < 0) newItem.x = 0;
              if (newItem.y < 0) newItem.y = 0;
            }}
          >
            {/* Render ALL charts but hide invisible ones */}
            {Object.keys(chartDefinitions).map((chartId) => {
              const ChartComponent = chartDefinitions[chartId].component;
              const isVisible = chartVisibility[chartId];
              const isInSettings = chartSettings[chartId];

              return (
                <div
                  key={chartId}
                  className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                    !isVisible ? "opacity-30" : ""
                  }`}
                  style={{
                    visibility: isVisible ? "visible" : "hidden",
                    cursor: isVisible ? "move" : "default",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: isVisible ? 1 : 0.3,
                      scale: isVisible ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.2 }}
                    className="h-full p-4"
                  >
                    {/* Chart Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {chartDefinitions[chartId].icon}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {chartDefinitions[chartId].title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleChartSettings(chartId)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer z-20 relative bg-white"
                          title="Chart Settings"
                        >
                          <Settings
                            size={14}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </button>
                        <button
                          onClick={() => toggleChartVisibility(chartId)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer z-20 relative bg-white"
                          title={isVisible ? "Hide Chart" : "Show Chart"}
                        >
                          {isVisible ? (
                            <EyeOff
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          ) : (
                            <Eye
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chart Content or Settings */}
                    <div
                      className="h-[calc(100%-40px)]"
                      style={{
                        pointerEvents: isVisible ? "auto" : "none",
                        userSelect: "none",
                      }}
                    >
                      {isVisible &&
                        (isInSettings ? (
                          <ChartSettings
                            chartId={chartId}
                            chartTitle={chartDefinitions[chartId].title}
                            onSave={(settings) =>
                              handleSettingsSave(chartId, settings)
                            }
                            onCancel={() => handleSettingsCancel(chartId)}
                            onDelete={() => handleSettingsDelete(chartId)}
                          />
                        ) : (
                          <ChartComponent />
                        ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </div>
    </div>
  );
}
