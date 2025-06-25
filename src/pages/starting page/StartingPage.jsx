import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, HelpCircle, Phone, LogOut, ChevronDown } from "lucide-react";
import logo from "../../assets/logo.png";
import logo3 from "../../assets/LogoColor.png";

import menuIcon1 from "../../assets/menuICON1.png";
import menuIcon2 from "../../assets/menuICON2.png";
import menuIcon3 from "../../assets/menuICON3.png";
import menuIcon4 from "../../assets/menuICON4.png";
import menuIcon5 from "../../assets/menuICON5.png";
import menuIcon6 from "../../assets/menuICON6.png";
import menuIcon7 from "../../assets/menuICON7.png";
import menuIcon8 from "../../assets/menuICON8.png";

const StartingPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [groupLogo, setGroupLogo] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    // Get user info from localStorage
    setFirstName(localStorage.getItem("firstName") || "");
    setLastName(localStorage.getItem("lastName") || "");
    setGroupLogo(localStorage.getItem("groupLogo") || "");

    // Add event listener for clicks outside dropdown
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear session storage
    localStorage.clear();
    localStorage.clear();
    // Redirect to login page
    navigate("/login");
  };

  // Updated menu options with Routes card added and descriptions removed
  const options = [
    {
      label: "Live Map",
      icon: <img src={menuIcon1} className="w-8 h-8" alt="Live Map" />,
      color: "bg-blue-50 hover:bg-blue-100",
      link: "/live-map",
    },
    {
      label: "Geofence",
      icon: <img src={menuIcon7} className="w-8 h-8" alt="Geofence" />,
      color: "bg-indigo-50 hover:bg-indigo-100",
      link: "/geofence",
    },
    {
      label: "Reports",
      icon: <img src={menuIcon2} className="w-8 h-8" alt="Reports" />,
      color: "bg-green-50 hover:bg-green-100",
      link: "/reports",
    },
    {
      label: "Replay",
      icon: <img src={menuIcon3} className="w-8 h-8" alt="Replay" />,
      color: "bg-yellow-50 hover:bg-yellow-100",
      link: "/replay",
    },
    {
      label: "Places",
      icon: <img src={menuIcon4} className="w-8 h-8" alt="Places" />,
      color: "bg-purple-50 hover:bg-purple-100",
      link: "/places",
    },
    {
      label: "Alerts",
      icon: <img src={menuIcon5} className="w-8 h-8" alt="Alerts" />,
      color: "bg-red-50 hover:bg-red-100",
      link: "/alerts",
    },
    {
      label: "Scheduler",
      icon: <img src={menuIcon6} className="w-8 h-8" alt="Scheduler" />,
      color: "bg-orange-50 hover:bg-orange-100",
      link: "/scheduler",
    },
    {
      label: "Routes",
      icon: <img src={menuIcon8} className="w-8 h-8" alt="Routes" />,
      color: "bg-teal-50 hover:bg-teal-100",
      link: "/routesview",
    },
  ];

  // Get logo URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const logoUrl = groupLogo
    ? `${apiBaseUrl}${groupLogo}`.replace(/\/+$/, "") // Remove trailing slash
    : logo;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Profile Dropdown */}
      <div className="bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                // src={logoUrl}
                src={logo3}
                alt="Company Logo"
                className="h-10 mr-3 rounded"
              />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:inline-block font-medium">
                  {firstName} {lastName}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HelpCircle size={16} className="mr-2" />
                      Help
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Phone size={16} className="mr-2" />
                      Contact
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {firstName} {lastName}
          </h2>
          <p className="text-gray-600 mt-1">
            Select an option below to get started
          </p>
        </div>
      </div>

      {/* Main Content - Now shows 8 items with smaller cards */}
      <div className="flex-grow flex items-center justify-center py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-7 max-w-6xl mx-auto">
            {options.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="relative"
              >
                <Link
                  to={item.link}
                  className={`block p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${item.color} h-full`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 rounded-full bg-white shadow-sm mb-2">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.label}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} Telogix. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default StartingPage;
