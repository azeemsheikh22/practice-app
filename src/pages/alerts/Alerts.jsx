import React, { useState } from "react";
import Navbar from "../../components/navber/Navbar";
import AlertHeader from "./AlertHeader";
import AlertOverview from "./AlertOverview";
import AlertLogHeader from "./AlertLogHeader";
import AlertLogTable from "./AlertLogTable";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Shield } from "lucide-react";
import PoliciesHeader from "./PoliciesHeader";
import PoliciesTable from "./PoliciesTable";

export default function Alerts() {
  const [activeTab, setActiveTab] = useState("overview");

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      path: "#",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: <FileText size={16} />,
      path: "#",
      active: true,
    },
  ];

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
        return <AlertOverview />;
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
            <PoliciesHeader />
            <PoliciesTable />
          </div>
        );
      default:
        return <AlertOverview />;
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
              className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
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
        {activeTab === "overview" && <AlertHeader />}
        {renderTabContent()}
      </div>
    </div>
  );
}
