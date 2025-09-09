import React, { useEffect, useState } from "react";
import Navbar from "../../components/navber/Navbar";
import ReportSelector from "../../components/reports/ReportSelector";
import ReportSetup from "../../components/reports/ReportSetup";
import ReportResults from "../../components/reports/ReportResults";
import ReportSidebar from "../../components/reports/ReportSidebar";
import { ArrowLeft } from "lucide-react";
import "../../styles/reportAnimations.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReportList, generateReport } from "../../features/reportsSlice";
import {
  initializeConnection,
  selectConnectionStatus,
} from "../../features/gpsTrackingSlice";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentView, setCurrentView] = useState("selector"); // "selector", "setup", "results"
  const [reportConfig, setReportConfig] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserReportList());
  }, [dispatch]);

  // Get data from reports slice using useSelector
  const reports = useSelector((state) => state.reports.reports);
  const reportData = useSelector((state) => state.reports.reportData);
  const loading = useSelector((state) => state.reports.loading);
  const generateLoading = useSelector((state) => state.reports.generateLoading);
  const error = useSelector((state) => state.reports.error);

  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  // Transform API data into categories and custom reports
  const groupedReports = React.useMemo(() => {
    if (!Array.isArray(reports)) return { categories: [], customReports: [] };
    const categoriesMap = {};
    const customReports = [];
    reports.forEach((r) => {
      if (r.catname === "My Customize Reports") {
        customReports.push(r.RptName);
      } else {
        if (!categoriesMap[r.catname]) {
          categoriesMap[r.catname] = [];
        }
        categoriesMap[r.catname].push(r.RptName);
      }
    });
    const categories = Object.entries(categoriesMap).map(([name, reports]) => ({
      name,
      reports,
    }));
    return { categories, customReports };
  }, [reports]);

  // Handler for report selection
  const handleSelectReport = (report, category) => {
    setSelectedReport(report);
    setSelectedCategory(category);
    setCurrentView("setup");
  };

  // Handler for going back to report selection
  const handleBackToSelection = () => {
    setSelectedReport(null);
    setSelectedCategory(null);
    setCurrentView("selector");
    setReportConfig(null);
  };

  // Handler for going back from results to setup
  const handleBackToSetup = () => {
    setCurrentView("setup");
  };

  // Handler for report execution
  const handleRunReport = (config) => {
    setReportConfig(config);
    
    // Find the report ID from the reports list
    const reportInfo = reports.find(r => r.RptName === selectedReport);
    
    if (!reportInfo) {
      alert("Report not found. Please try again.");
      return;
    }
  
    
    const reportParams = {
      reportId: reportInfo.ID,
      selectedValueIds: config.selectedValueIds,
      fromDateTime: config.fromDateTime,
      toDateTime: config.toDateTime,
      target: config.target
    };
    
    setCurrentView("results");
    dispatch(generateReport(reportParams))
  };

  // Handler for sidebar actions
  const handleSidebarAction = (actionId) => {
    // console.log("Sidebar action:", actionId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Render different views based on currentView state */}
      {currentView === "results" ? (
        <ReportResults
          reportName={selectedReport}
          reportCategory={selectedCategory}
          reportConfig={reportConfig}
          reportData={reportData}
          isLoading={generateLoading}
          onBack={handleBackToSetup}
          onEdit={() => {
            setCurrentView("setup");
          }}
        />
      ) : (
        <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <ReportSidebar onAction={handleSidebarAction} />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentView === "setup" ? (
              <div className="relative mb-4 animate-fadeIn">
                <button
                  onClick={handleBackToSelection}
                  className="absolute top-0 left-0 mt-[-40px] flex items-center gap-1 text-[#25689f] hover:text-[#1F557F] transition-colors animate-slideInFromLeft"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-medium">Back to Reports</span>
                </button>
                <ReportSetup
                  key={`${selectedReport}-${currentView}-${reportConfig ? JSON.stringify(reportConfig.selectedValueIds) : 'new'}`}
                  selectedReport={selectedReport}
                  selectedCategory={selectedCategory}
                  onRun={handleRunReport}
                  onCancel={handleBackToSelection}
                  initialConfig={reportConfig}
                />
              </div>
            ) : (
              <>
                {/* Loading Indicator */}
                {loading && (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-4">
                    <div className="flex items-center justify-center gap-2 text-[#25689f]">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#25689f]"></div>
                      <span>Loading reports...</span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="text-red-700">
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                )}

    

     

                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-fadeIn">
                  <ReportSelector
                    reportCategories={groupedReports.categories}
                    customReports={groupedReports.customReports}
                    onSelectReport={handleSelectReport}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
export default Reports;
