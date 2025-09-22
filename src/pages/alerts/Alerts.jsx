import { useEffect, useState, useRef } from "react";
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
import {
  fetchAlertLogs,
  fetchAlertsPolicyList,
  fetchAlertSummary,
  setSelectedDateRange,
} from "../../features/alertSlice";
import { useLocation } from "react-router-dom";

export default function Alerts() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("Most Triggered");
  const [selectedLogDateRange, setSelectedLogDateRange] = useState("Today");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [alarmSound, setAlarmSound] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const policiesHeaderRef = useRef();

  const {
    policyList,
    loading,
    error,
    alertSummary,
    summaryLoading,
    summaryError,
    selectedDateRange,
    alertLogs,
    logLoading,
    logError,
  } = useSelector((state) => state.alert);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("query") === "policies") {
      setActiveTab("policies");
    }
  }, [location.search]);
  // Helper function to get date range for alert logs
  const getLogDateRange = (timeRange) => {
    const today = new Date();
    let fromDate, toDate;
    switch (timeRange) {
      case "Today": {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, "0");
        const day = String(yesterday.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      case "This Week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const year = startOfWeek.getFullYear();
        const month = String(startOfWeek.getMonth() + 1).padStart(2, "0");
        const day = String(startOfWeek.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        const endYear = today.getFullYear();
        const endMonth = String(today.getMonth() + 1).padStart(2, "0");
        const endDay = String(today.getDate()).padStart(2, "0");
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      case "Last Week": {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        const startYear = lastWeekStart.getFullYear();
        const startMonth = String(lastWeekStart.getMonth() + 1).padStart(
          2,
          "0"
        );
        const startDay = String(lastWeekStart.getDate()).padStart(2, "0");
        const endYear = lastWeekEnd.getFullYear();
        const endMonth = String(lastWeekEnd.getMonth() + 1).padStart(2, "0");
        const endDay = String(lastWeekEnd.getDate()).padStart(2, "0");
        fromDate = `${startYear}/${startMonth}/${startDay} 00:00:00`;
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      default: {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
      }
    }
    return { datefrom: fromDate, dateto: toDate };
  };
  // Fetch alert logs when date range or tab changes
  useEffect(() => {
    if (activeTab === "alert-log") {
      const dateRange = getLogDateRange(selectedLogDateRange);
      dispatch(fetchAlertLogs(dateRange));
    }
  }, [dispatch, selectedLogDateRange, activeTab]);

  // Auto Refresh logic for Alert Log tab
  useEffect(() => {
    if (activeTab !== "alert-log" || !autoRefresh) return;
    const dateRange = getLogDateRange(selectedLogDateRange);
    const interval = setInterval(() => {
      dispatch(fetchAlertLogs(dateRange));
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, selectedLogDateRange, dispatch]);
  const handleLogDateRangeChange = (newTimeframe) => {
    setSelectedLogDateRange(newTimeframe);
  };

  // Helper function to get date range based on selection
  const getDateRange = (timeRange) => {
    const today = new Date();
    let fromDate, toDate;

    switch (timeRange) {
      case "Today": {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      case "Yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, "0");
        const day = String(yesterday.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        toDate = `${year}/${month}/${day} 23:59:59`;
        break;
      }
      case "This Week": {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const year = startOfWeek.getFullYear();
        const month = String(startOfWeek.getMonth() + 1).padStart(2, "0");
        const day = String(startOfWeek.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        const endYear = today.getFullYear();
        const endMonth = String(today.getMonth() + 1).padStart(2, "0");
        const endDay = String(today.getDate()).padStart(2, "0");
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      case "This Month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const year = startOfMonth.getFullYear();
        const month = String(startOfMonth.getMonth() + 1).padStart(2, "0");
        const day = String(startOfMonth.getDate()).padStart(2, "0");
        fromDate = `${year}/${month}/${day} 00:00:00`;
        const endYear = today.getFullYear();
        const endMonth = String(today.getMonth() + 1).padStart(2, "0");
        const endDay = String(today.getDate()).padStart(2, "0");
        toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        break;
      }
      default: {
        // Handle month/year selections like "August 2025"
        if (timeRange.includes("2024") || timeRange.includes("2025")) {
          const [monthName, year] = timeRange.split(" ");
          const monthIndex = new Date(
            Date.parse(monthName + " 1, 2020")
          ).getMonth();
          const start = new Date(parseInt(year), monthIndex, 1);
          const end = new Date(parseInt(year), monthIndex + 1, 0);
          const startYear = start.getFullYear();
          const startMonth = String(start.getMonth() + 1).padStart(2, "0");
          const startDay = String(start.getDate()).padStart(2, "0");
          const endYear = end.getFullYear();
          const endMonth = String(end.getMonth() + 1).padStart(2, "0");
          const endDay = String(end.getDate()).padStart(2, "0");
          fromDate = `${startYear}/${startMonth}/${startDay} 00:00:00`;
          toDate = `${endYear}/${endMonth}/${endDay} 23:59:59`;
        } else {
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const day = String(today.getDate()).padStart(2, "0");
          fromDate = `${year}/${month}/${day} 00:00:00`;
          toDate = `${year}/${month}/${day} 23:59:59`;
        }
      }
    }

    return {
      datefrom: fromDate,
      dateto: toDate,
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
        return (
          <AlertOverview
            alertSummary={alertSummary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            selectedSort={selectedSort}
          />
        );
      case "alert-log":
        return (
          <div>
            <AlertLogHeader
              selectedTimeframe={selectedLogDateRange}
              setSelectedTimeframe={handleLogDateRangeChange}
              dateRange={getLogDateRange(selectedLogDateRange)}
              autoRefresh={autoRefresh}
              setAutoRefresh={setAutoRefresh}
            />
            <AlertLogTable
              alertLogs={alertLogs}
              logLoading={logLoading}
              logError={logError}
              alarmSound={autoRefresh ? false : autoRefresh} // default false, will update below
            />
          </div>
        );
      case "policies":
        return (
          <div>
            <PoliciesHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalRecords={policyList?.length || 0}
              onEditPolicyRef={policiesHeaderRef}
            />
            <PoliciesTable
              policyData={policyList || []}
              searchQuery={searchQuery}
              loading={loading}
              onEditPolicy={(policyData) => policiesHeaderRef.current?.editPolicy(policyData)}
              error={error}
            />
          </div>
        );
      default:
        return (
          <AlertOverview
            alertSummary={alertSummary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            selectedSort={selectedSort}
          />
        );
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
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
          />
        )}
        {/* Pass autoRefresh as alarmSound to AlertLogTable in Alert Log tab */}
        {activeTab === "alert-log" ? (
          <>
            <AlertLogHeader
              selectedTimeframe={selectedLogDateRange}
              setSelectedTimeframe={handleLogDateRangeChange}
              dateRange={getLogDateRange(selectedLogDateRange)}
              autoRefresh={autoRefresh}
              setAutoRefresh={setAutoRefresh}
              alarmSound={alarmSound}
              setAlarmSound={setAlarmSound}
            />
            <AlertLogTable
              alertLogs={alertLogs}
              logLoading={logLoading}
              logError={logError}
              alarmSound={alarmSound}
            />
          </>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}
