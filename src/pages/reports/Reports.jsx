import React, { useEffect, useState } from "react";
import Navbar from "../../components/navber/Navbar";
import ReportSelector from "../../components/reports/ReportSelector";
import ReportSetup from "../../components/reports/ReportSetup";
import ReportSidebar from "../../components/reports/ReportSidebar";
import { ArrowLeft } from "lucide-react";
import "../../styles/reportAnimations.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReportList } from "../../features/reportsSlice";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserReportList());
  }, [dispatch]);

  const reports = useSelector((state) => state.reports.reports);

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
    const categories = Object.entries(categoriesMap).map(([name, reports]) => ({ name, reports }));
    return { categories, customReports };
  }, [reports]);

  // Handler for report selection
  const handleSelectReport = (report, category) => {
    setSelectedReport(report);
    setSelectedCategory(category);
  };

  // Handler for going back to report selection
  const handleBackToSelection = () => {
    setSelectedReport(null);
    setSelectedCategory(null);
  };

  // Handler for report execution
  const handleRunReport = (config) => {
    alert(
      `Report "${selectedReport}" is being generated. You'll be notified when it's ready.`
    );
    handleBackToSelection();
  };

  // Handler for sidebar actions
  const handleSidebarAction = (actionId) => {
    console.log("Sidebar action:", actionId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <ReportSidebar onAction={handleSidebarAction} />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {selectedReport ? (
            <div className="relative mb-4 animate-fadeIn">
              <button
                onClick={handleBackToSelection}
                className="absolute top-0 left-0 mt-[-40px] flex items-center gap-1 text-[#25689f] hover:text-[#1F557F] transition-colors animate-slideInFromLeft"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Reports</span>
              </button>
              <ReportSetup
                selectedReport={selectedReport}
                selectedCategory={selectedCategory}
                onRun={handleRunReport}
                onCancel={handleBackToSelection}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-fadeIn">
              <ReportSelector
                reportCategories={groupedReports.categories}
                customReports={groupedReports.customReports}
                onSelectReport={handleSelectReport}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default Reports;
