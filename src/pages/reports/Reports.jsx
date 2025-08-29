import React, { useState } from 'react';
import Navbar from '../../components/navber/Navbar';
import ReportSelector from '../../components/reports/ReportSelector';
import ReportSetup from '../../components/reports/ReportSetup';
import ReportSidebar from '../../components/reports/ReportSidebar';
import { ArrowLeft } from 'lucide-react';
import '../../styles/reportAnimations.css';

const reportCategories = [
  {
    name: 'Activity',
    reports: [
      'Alert Log Report',
      'Alert Log Report (PGL)',
      'Detail Movement Report',
      'Geofence Report (New)',
      'Idling Report',
      'Last Update Report',
      'Movement Report',
      'Parking Report',
      'Seatbelt Unfasten Report',
      'Travel and Stops Report',
    ],
  },
  {
    name: 'Summary',
    reports: ['Distance Travelled Report'],
  },
  {
    name: 'Driving Style',
    reports: [],
  },
  {
    name: 'Fuel',
    reports: [],
  },
  {
    name: 'Fuel Level Sensor',
    reports: [],
  },
  {
    name: 'Timecard',
    reports: [],
  },
  {
    name: 'Management Summary',
    reports: [],
  },
];

const customReports = [
  'Area Speeding Report',
  'Area Speeding Report - PGL',
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    console.log('Running report with config:', config);
    // Here you would typically make an API call to generate the report
    // For now, we'll just show a message
    alert(`Report "${selectedReport}" is being generated. You'll be notified when it's ready.`);
    handleBackToSelection();
  };

  // Handler for sidebar actions
  const handleSidebarAction = (actionId) => {
    console.log('Sidebar action:', actionId);
    // Implement sidebar actions here
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
                reportCategories={reportCategories}
                customReports={customReports}
                onSelectReport={handleSelectReport}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};export default Reports;