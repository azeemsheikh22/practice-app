import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import InlineChartSettings from "./InlineChartSettings";
import ChartRenderer from "./ChartRenderer";
import { fetchChartData, selectChartData, selectChartDataLoading, selectChartDataError } from "../../features/chartApiSlice";

export default function ChartCard({ chartData, selectedGroup, onSettingsUpdate }) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentChartConfig, setCurrentChartConfig] = useState(chartData);
  const dispatch = useDispatch();
  
  // Redux selectors
  const allChartData = useSelector(selectChartData);
  const allChartDataLoading = useSelector(selectChartDataLoading);
  const allChartDataError = useSelector(selectChartDataError);
  
  // Create unique chart key
  const uniqueChartKey = `${chartData.GroupID}-${chartData.ChartProcedure}`;
  
  // Get chart specific data using unique key
  const chartApiData = allChartData[uniqueChartKey];
  const isChartLoading = allChartDataLoading[uniqueChartKey];
  const chartError = allChartDataError[uniqueChartKey];

  // Function to calculate dates based on TimeSelectionVal
  const getDateRange = (timeSelectionVal) => {
    const today = new Date();
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    switch (timeSelectionVal) {
      case "1": // Today
        return {
          fromDate: formatDate(today),
          toDate: formatDate(today)
        };
      case "2": // Yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return {
          fromDate: formatDate(yesterday),
          toDate: formatDate(yesterday)
        };
      case "3": // Last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          fromDate: formatDate(sevenDaysAgo),
          toDate: formatDate(today)
        };
      case "4": // Last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          fromDate: formatDate(thirtyDaysAgo),
          toDate: formatDate(today)
        };
      case "5": // This month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          fromDate: formatDate(firstDayOfMonth),
          toDate: formatDate(today)
        };
      default:
        return {
          fromDate: formatDate(today),
          toDate: formatDate(today)
        };
    }
  };

  // Update current chart config when chartData changes
  useEffect(() => {
    setCurrentChartConfig(chartData);
  }, [chartData]);

  // Fetch chart data on component mount or when settings change
  useEffect(() => {
    if (chartData && selectedGroup?.valueId) {      
      // Get date range based on TimeSelectionVal
      const dateRange = getDateRange(chartData.TimeSelectionVal || "3");
      
      // Create complete chart config with dates
      const completeChartConfig = {
        ...chartData,
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        vehicleGroup: selectedGroup.valueId, // Use selectedGroup.valueId for API call
      };
      
      dispatch(fetchChartData(completeChartConfig));
    }
  }, [dispatch, selectedGroup?.valueId, chartData.TimeSelectionVal, chartData.ChartProcedure]);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleSettingsSave = (updatedSettings) => {
    // Create updated chart config with proper mapping
    const mappedSettings = {
      chartType: updatedSettings.chartType,
      TimeSelectionVal: updatedSettings.time,
      showBy: updatedSettings.show,
      DPsLimit: updatedSettings.topLimit,
      chartTitle: updatedSettings.metric
    };
    
    // Update the settings first
    onSettingsUpdate(chartData.GroupID, mappedSettings);
    
    // Create updated chart config with proper dates
    const updatedChartConfig = { ...chartData, ...mappedSettings };
    
    // Get date range based on updated time selection
    const dateRange = getDateRange(updatedSettings.TimeSelectionVal || updatedChartConfig.TimeSelectionVal || "3");
    
    // Add dates to config
    const completeConfig = {
      ...updatedChartConfig,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      vehicleGroup: selectedGroup?.valueId || updatedChartConfig.GroupID, // Use selectedGroup.valueId for API call
    };
    
    // Update local chart config state for immediate UI update
    setCurrentChartConfig(updatedChartConfig);
    
    dispatch(fetchChartData(completeConfig));
    
    setShowSettings(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-gray-800">
          {currentChartConfig.chartTitle}
        </h3>
        <div className="flex items-center space-x-2">


          {/* Conditional Icon - Settings or Chart */}
          {showSettings ? (
            /* Chart Icon - Click to go back to chart view */
            <button 
              onClick={handleSettingsClose}
              className="text-green-600 hover:text-green-800 cursor-pointer"
              title="Back to Chart"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </button>
          ) : (
            /* Settings Icon - Click to go to settings */
            <button 
              onClick={handleSettingsClick}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chart Content Area or Settings Form - Fixed Height */}
      <div className="h-[320px]">
        {showSettings ? (
          <div className="h-full overflow-y-auto bg-gray-50 rounded-lg">
            <InlineChartSettings
              chartData={currentChartConfig}
              onSave={handleSettingsSave}
              onCancel={handleSettingsClose}
            />
          </div>
        ) : (
          <div className="h-full rounded-lg">
            {isChartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm">Loading chart data...</p>
                </div>
              </div>
            ) : chartError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <div className="mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-sm">Error loading chart</p>
                  <p className="text-xs mt-1">{chartError}</p>
                </div>
              </div>
            ) : chartApiData ? (
              <ChartRenderer 
                chartType={currentChartConfig.chartType} 
                chartTitle={currentChartConfig.chartTitle}
                chartData={chartApiData.data}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <p className="text-sm">Chart will be rendered here</p>
                  <p className="text-xs mt-1">Type: {currentChartConfig.chartType}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
