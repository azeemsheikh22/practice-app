import React, { useEffect, useState } from "react";
import Navbar from "../../components/navber/Navbar";
import AlertHeader from "./AlertHeader";
import AlertOverview from "./AlertOverview";
import AlertLogHeader from "./AlertLogHeader";
import AlertLogTable from "./AlertLogTable";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Shield } from "lucide-react";
import PoliciesHeader from "./PoliciesHeader";
import PoliciesTable from "./PoliciesTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlertsPolicyList, fetchAlertSummary, setSelectedDateRange } from "../../features/alertSlice";

export default function Alerts() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { 
    policyList, 
    loading, 
    error, 
    alertSummary, 
    summaryLoading, 
    summaryError, 
    selectedDateRange 
  } = useSelector((state) => state.alert);

  // Helper function to get date range based on selection
  const getDateRange = (timeRange) => {
    const today = new Date();
    let fromDate, toDate;

    switch (timeRange) {
      case "Today":
        fromDate = new Date(today);
        toDate = new Date(today);
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        fromDate = new Date(yesterday);
        toDate = new Date(yesterday);
        break;
      case "This Week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = new Date(startOfWeek);
        toDate = new Date(today);
        break;
      case "This Month":
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date(today);
        break;
      default:
        // Handle month/year selections like "August 2025"
        if (timeRange.includes("2024") || timeRange.includes("2025")) {
          const [month, year] = timeRange.split(" ");
          const monthIndex = new Date(Date.parse(month + " 1, 2020")).getMonth();
          fromDate = new Date(parseInt(year), monthIndex, 1);
          toDate = new Date(parseInt(year), monthIndex + 1, 0);
        } else {
          fromDate = new Date(today);
          toDate = new Date(today);
        }
    }

    // Format dates to match API format: YYYY/MM/DD HH:MM:SS
    const formatDate = (date, isEndOfDay = false) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const time = isEndOfDay ? '23:59:59' : '00:00:00';
      return `${year}/${month}/${day} ${time}`;
    };

    return {
      datefrom: formatDate(fromDate, false),
      dateto: formatDate(toDate, true)
    };
  };

  useEffect(() => {
    dispatch(fetchAlertsPolicyList());
  }, [dispatch]);

  // Fetch alert summary when date range changes
  useEffect(() => {
    if (activeTab === "overview") {
      const dateRange = getDateRange(selectedDateRange);
      dispatch(fetchAlertSummary(dateRange));
    }
  }, [dispatch, selectedDateRange, activeTab]);

  const handleDateRangeChange = (newTimeframe) => {
    dispatch(setSelectedDateRange(newTimeframe));
  };

  const alertTabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard size={16} />,
    },
    {
      id: "alert-log",
      label: "Alert Log",
      icon: <FileText size={16} />,
    },
    {
      id: "policies",
      label: "Policies",
      icon: <Shield size={16} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AlertOverview alertSummary={alertSummary} summaryLoading={summaryLoading} summaryError={summaryError} />;
      case "alert-log":
        return (
          <div>
            <AlertLogHeader />
            <AlertLogTable />
          </div>
        );
      case "policies":
        return (
          <div>
            <PoliciesHeader 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalRecords={policyList?.length || 0}
            />
            <PoliciesTable 
              policyData={policyList || []}
              searchQuery={searchQuery}
              loading={loading}
              error={error}
            />
          </div>
        );
      default:
        return <AlertOverview alertSummary={alertSummary} summaryLoading={summaryLoading} summaryError={summaryError} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* Alert Tabs Navigation */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center space-x-1">
          {alertTabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-[#25689f] shadow-sm border-b-2 border-[#25689f]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span
                className={
                  activeTab === tab.id ? "text-[#25689f]" : "text-gray-500"
                }
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 pt-3">
        {activeTab === "overview" && (
          <AlertHeader 
            selectedTimeframe={selectedDateRange}
            setSelectedTimeframe={handleDateRangeChange}
          />
        )}
        {renderTabContent()}
      </div>
    </div>
  );
}
