import Navbar from "../../components/navber/Navbar";
import RouteHeader from "./RouteHeader";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Route, 
  MapPin,
  Upload, 
  ChevronRight 
} from "lucide-react";
import RouteTable from "./RouteTable";

const RoutesView = () => {
  const [activeTab, setActiveTab] = useState("routes");

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
      path: "#"
    },
    {
      id: "routes", 
      label: "Routes",
      icon: <Route size={16} />,
      path: "#",
      active: true
    },
    {
      id: "planning",
      label: "Planning", 
      icon: <MapPin size={16} />,
      path: "#"
    },
    {
      id: "upload-kml",
      label: "Upload KML File", 
      icon: <Upload size={16} />,
      path: "#"
    }
  ];

  const handleNavigation = (item) => {
    if (!item.active) {
      // Navigate to other pages
      window.location.href = item.path;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Navigation Bar */}
      <div>
        <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 pt-3">
            {navigationItems.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  // onClick={() => handleNavigation(item)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? "bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className={item.active ? "text-white" : "text-gray-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </motion.button>
                
                {index < navigationItems.length - 1 && (
                  <ChevronRight size={16} className="text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Route size={20} className="text-[#25689f]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Routes
                </h2>
              </div>
              
              {/* Mobile Menu Button */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    const selectedItem = navigationItems.find(item => item.id === e.target.value);
                    if (selectedItem && !selectedItem.active) {
                      handleNavigation(selectedItem);
                    }
                  }}
                  value="routes"
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#25689f] focus:border-[#25689f]"
                >
                  {navigationItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronRight size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <RouteHeader />
        <RouteTable />
      </div>
    </div>
  );
};

export default RoutesView;
