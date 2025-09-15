import { useState } from "react";
import { Save, X, Trash2 } from "lucide-react";

const ChartSettings = ({  onSave, onCancel, onDelete }) => {
  const [settings, setSettings] = useState({
    dataType: "Distance Traveled",
    chartType: "DistanceTraveledChart",
    showName: "Groups",
    aggregation: "Average per day",
    timeRange: "Today and yesterday",
  });

  const dataTypeOptions = [
    "Distance Traveled",
    "Speeding Violations",
    "Speeding Trend",
    "Speeding Severity",
    "Safety Score",
    "Total Distance",
  ];

  const chartTypeOptions = [
    "DistanceTraveledChart",
    "SpeedingViolationsGauge",
    "SpeedingTrendChart",
    "SpeedingSeverityChart",
    "SafetyScoreChart",
    "TotalDistanceGauge",
  ];

  const showNameOptions = ["Groups", "Vehicles", "Drivers"];

  const aggregationOptions = [
    "Average per day",
    "Average per vehicle",
    "Total",
  ];

  const timeRangeOptions = [
    "Today and yesterday",
    "Previous seven days",
    "Previous work week",
    "This week",
  ];

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Settings Form */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {/* Data Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Data Type
          </label>
          <select
            value={settings.dataType}
            onChange={(e) => handleInputChange("dataType", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {dataTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Chart Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chart Type
          </label>
          <select
            value={settings.chartType}
            onChange={(e) => handleInputChange("chartType", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {chartTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Show Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Show Name
          </label>
          <select
            value={settings.showName}
            onChange={(e) => handleInputChange("showName", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {showNameOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Aggregation */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Aggregation
          </label>
          <select
            value={settings.aggregation}
            onChange={(e) => handleInputChange("aggregation", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {aggregationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            value={settings.timeRange}
            onChange={(e) => handleInputChange("timeRange", e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-200">
        <button
          onClick={onDelete}
          className="flex items-center cursor-pointer px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          <Trash2 size={12} className="mr-1" />
          Delete
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onCancel}
            className="flex items-center cursor-pointer px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X size={12} className="mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center cursor-pointer px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={12} className="mr-1" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartSettings;
