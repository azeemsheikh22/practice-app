import { useState, useEffect } from "react";

export default function InlineChartSettings({ chartData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    metric: "",
    chartType: "Guage",
    topLimit: "Top 10",
    show: "Vehicles",
    totalType: "Total",
    time: "Previous seven days"
  });

  const metricOptions = [
    { value: "Stops Count", label: "Stops Count" },
    { value: "Idling Duration", label: "Idling Duration" },
    { value: "Distance Travelled", label: "Distance Travelled" },
    { value: "Safety Scores", label: "Safety Scores" },
    { value: "Average Speed", label: "Average Speed" },
    { value: "High Speed", label: "High Speed" },
    { value: "Harsh Driving", label: "Harsh Driving" },
    { value: "Vehicle Activity", label: "Vehicle Activity" },
    { value: "Engine ON/OFF", label: "Engine ON/OFF" },
    { value: "Stop Duration", label: "Stop Duration" },
    { value: "Sensor On Duration", label: "Sensor On Duration" },
    { value: "Speeding Severity", label: "Speeding Severity" },
    { value: "Speeding Violations", label: "Speeding Violations" },
    { value: "Start Time", label: "Start Time" },
    { value: "Vehicle Maintenance Expense", label: "Vehicle Maintenance Expense" },
    { value: "Wasted Fuel", label: "Wasted Fuel" },
    { value: "Payroll Expense Modeled", label: "Payroll Expense Modeled" },
    { value: "Fuel Purchased", label: "Fuel Purchased" },
    { value: "Ontime Arrivals", label: "Ontime Arrivals" },
    { value: "Fuel Efficiency", label: "Fuel Efficiency" }
  ];

  const chartTypeOptions = [
    { value: "bar", label: "Rank" },
    { value: "trend", label: "Trend" },
    { value: "guage", label: "Guage" },
    { value: "pie", label: "Pie" },
    { value: "doughnut", label: "Doughnut" },
    { value: "stack", label: "Stack Bar" }
  ];

  const topLimitOptions = [
    { value: "Top 10", label: "Top 10" },
    { value: "Top 50", label: "Top 50" },
    { value: "Bottom 10", label: "Bottom 10" },
    { value: "Bottom 50", label: "Bottom 50" }
  ];

  const showOptions = [
    { value: "Vehicles", label: "Vehicles" },
    { value: "Drivers", label: "Drivers" },
    { value: "Groups", label: "Groups" }
  ];

  const totalTypeOptions = [
    { value: "Average per day", label: "Average per day" },
    { value: "Average per vehicle", label: "Average per vehicle" },
    { value: "Total", label: "Total" }
  ];

  const timeOptions = [
    { value: "1", label: "Today" },
    { value: "2", label: "Yesterday" },
    { value: "3", label: "Previous seven days" },
    { value: "4", label: "Previous week" },
    { value: "5", label: "This week" },
    { value: "6", label: "Two weeks ago" },
    { value: "7", label: "Three weeks ago" },
    { value: "8", label: "Four weeks ago" },
    { value: "9", label: "This month" },
    { value: "10", label: "Previous 30 days" },
    { value: "11", label: "Previous month" },
    { value: "12", label: "Previous 90 days" },
    { value: "13", label: "Previous three months" }
  ];

  useEffect(() => {
    if (chartData) {
      setFormData({
        metric: chartData.chartTitle || "",
        chartType: chartData.chartType || "Guage",
        topLimit: chartData.DPsLimit ? (chartData.DPsLimit === "10" ? "Top 10" : chartData.DPsLimit === "50" ? "Top 50" : chartData.DPsLimit === "Bottom 10" ? "Bottom 10" : chartData.DPsLimit === "Bottom 50" ? "Bottom 50" : "Top 10") : "Top 10",
        show: chartData.showBy || "Vehicles",
        totalType: chartData.totalType || "Total",
        time: chartData.TimeSelectionVal || "1"
      });
    }
  }, [chartData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    // Add delete functionality here
    onCancel();
  };

  return (
    <div className="p-3 space-y-3">
      {/* Metric Field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Metric:
        </label>
        <select
          value={formData.metric}
          onChange={(e) => handleInputChange('metric', e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select Metric</option>
          {metricOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Chart Type and Top Limit - Same Row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chart Type:
          </label>
          <select
            value={formData.chartType}
            onChange={(e) => handleInputChange('chartType', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {chartTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Limit:
          </label>
          <select
            value={formData.topLimit}
            onChange={(e) => handleInputChange('topLimit', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {topLimitOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show and Total Type - Same Row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Show:
          </label>
          <select
            value={formData.show}
            onChange={(e) => handleInputChange('show', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {showOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type:
          </label>
          <select
            value={formData.totalType}
            onChange={(e) => handleInputChange('totalType', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {totalTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Field with Hide days link */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Time:
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {timeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            type="button"
            className="text-blue-500 hover:text-blue-700 text-xs underline cursor-pointer"
          >
            Hide days
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-3">
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs cursor-pointer"
        >
          Delete
        </button>
        <div className="space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
