import {useState } from "react";
import Navbar from "../../components/navber/Navbar";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Shield, Car, History } from "lucide-react";
import Reminders from "./pages/Reminders";

export default function FleetService() {
  const [activeTab, setActiveTab] = useState("reminders");

  const alertTabs = [
    {
      id: "reminders",
      label: "Reminders",
      icon: <FileText size={16} />,
    },
    {
      id: "history",
      label: "History",
      icon: <History size={16} />,
    },
    {
      id: "service-plans",
      label: "Manage Service Plans",
      icon: <LayoutDashboard size={16} />,
    },
    {
      id: "fuel-purchase",
      label: "Fuel Purchase",
      icon: <Car size={16} />,
    },
    {
      id: "upload-fuel",
      label: "Upload Fuel Purchases",
      icon: <Shield size={16} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "reminders":
        return <Reminders />;
      case "history":
        return (
          <div>
            <h1>Service History Content</h1>
          </div>
        );
      case "service-plans":
        return (
          <div>
            <h1>Manage Service Plans Content</h1>
          </div>
        );
      case "fuel-purchase":
        return (
          <div>
            <h1>Fuel Purchase Content</h1>
          </div>
        );
      case "upload-fuel":
        return (
          <div>
            <h1>Upload Fuel Purchases Content</h1>
          </div>
        );
      default:
        return (
          <div>
            <h1>Select a tab</h1>
          </div>
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
        {renderTabContent()}
      </div>
    </div>
  );
}
