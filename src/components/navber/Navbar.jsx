import React, { useState, useRef, useEffect } from "react";
// import logo from "../../assets/logo.png";
import logo3 from "../../assets/LogoColor.png";
// import logo2 from "../../assets/logo2.png";
import menuIcon1 from "../../assets/menuICON1.png";
import menuIcon2 from "../../assets/menuICON2.png";
import menuIcon3 from "../../assets/menuICON3.png";
import menuIcon4 from "../../assets/menuICON4.png";
import menuIcon5 from "../../assets/menuICON5.png";
import menuIcon6 from "../../assets/menuICON6.png";
import menuIcon7 from "../../assets/menuICON7.png";
import { useDispatch } from "react-redux";
import { clearConnection } from "../../features/gpsTrackingSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Lock,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ChangePasswordModal from "../change password/ChangePasswordModal";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const dropdownRef = useRef(null);

  // const userName = localStorage.getItem("userName");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  // const groupLogo = localStorage.getItem("groupLogo");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // const logoUrl = groupLogo
  //   ? `${apiBaseUrl}${groupLogo}`.replace(/\/+$/, "") // Remove trailing slash
  //   : logo;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    dispatch(clearConnection());
    localStorage.clear();
    localStorage.clear();
    window.location.href = "/#/login";
  };

  const handleChangePasswordClick = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    setIsChangePasswordModalOpen(true);
  };

  // Check if the current path matches the menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bg-white relative z-40">
        <div className="w-full  px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between h-[60px]">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <img
                  // src={logoUrl}
                  src={logo3}
                  alt="Telogix"
                  className="h-10 w-auto rounded"
                />

                <div className="hidden xl:flex flex-col ml-2">
                  <span className="text-md font-semibold text-gray-800">
                    {firstName} {lastName}
                  </span>
                  <span className="text-sm text-gray-500">Welcome back</span>
                </div>
              </div>

              <div className="hidden xl:flex items-center ml-3">
                <NavItem
                  icon={<img src={menuIcon1} className="w-5 h-5" />}
                  label="Live Map"
                  to="/live-map"
                  active={isActive("/live-map")}
                  openInNewTab={false} // Same tab mein rahega
                />
                <NavItem
                  icon={<img src={menuIcon7} className="w-5 h-5" />}
                  label="Geofence"
                  to="/geofence"
                  active={isActive("/geofence")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <NavItem
                  icon={<img src={menuIcon3} className="w-5 h-5" />}
                  label="Replay"
                  to="/replay"
                  active={isActive("/replay")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <NavItem
                  icon={<img src={menuIcon5} className="w-5 h-5" />}
                  label="Alerts"
                  to="/alerts"
                  active={isActive("/alerts")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <NavItem
                  icon={<img src={menuIcon2} className="w-5 h-5" />}
                  label="Reports"
                  to="#"
                  active={isActive("/reports")}
                  openInNewTab={true} // New tab mein open hoga
                />

                <NavItem
                  icon={<img src={menuIcon4} className="w-5 h-5" />}
                  label="Places"
                  to="#"
                  active={isActive("/places")}
                  openInNewTab={true} // New tab mein open hoga
                />

                <NavItem
                  icon={<img src={menuIcon6} className="w-5 h-5" />}
                  label="Scheduler"
                  to="#"
                  active={isActive("/scheduler")}
                  openInNewTab={true} // New tab mein open hoga
                />
              </div>
            </div>

            <div className="flex items-center">
              <button className="p-2.5 rounded-full text-white bg-dark cursor-pointer relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 bg-red-500 rounded-full w-2.5 h-2.5 border-2 border-white"></span>
              </button>

              <div className="ml-4 relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center md:h-11 md:w-11 h-9 w-9 rounded-full bg-dark cursor-pointer text-white"
                >
                  <User size={20} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white z-50 overflow-hidden"
                    >
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
                            {(firstName?.[0] || "") + (lastName?.[0] || "")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">
                              {firstName} {lastName ? lastName : ""}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Logged in user
                            </p>
                          </div>
                        </div>

                        <DropdownItem
                          icon={<User size={18} />}
                          label="User Preferences"
                        />
                        <DropdownItem
                          icon={<Settings size={18} />}
                          label="Account Preferences"
                        />
                        <DropdownItem
                          icon={<Lock size={18} />}
                          label="Change Password"
                          onClick={handleChangePasswordClick}
                        />
                        <DropdownItem
                          icon={<FileText size={18} />}
                          label="Vehicle Validity List"
                        />

                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut size={18} className="mr-3 text-gray-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-3 xl:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md bg-dark text-white"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
              className="xl:hidden bg-white border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <MobileNavItem
                  icon={<img src={menuIcon1} className="w-6 h-6" />}
                  label="Live Map"
                  to="/live-map"
                  active={isActive("/live-map")}
                  openInNewTab={false} // Same tab mein rahega
                />
                <MobileNavItem
                  icon={<img src={menuIcon7} className="w-6 h-6" />}
                  label="Geofence"
                  to="/geofence"
                  active={isActive("/geofence")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <MobileNavItem
                  icon={<img src={menuIcon2} className="w-6 h-6" />}
                  label="Reports"
                  to="/reports"
                  active={isActive("/reports")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <MobileNavItem
                  icon={<img src={menuIcon3} className="w-6 h-6" />}
                  label="Replay"
                  to="/replay"
                  active={isActive("/replay")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <MobileNavItem
                  icon={<img src={menuIcon4} className="w-6 h-6" />}
                  label="Places"
                  to="/places"
                  active={isActive("/places")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <MobileNavItem
                  icon={<img src={menuIcon5} className="w-6 h-6" />}
                  label="Alerts"
                  to="/alerts"
                  active={isActive("/alerts")}
                  openInNewTab={true} // New tab mein open hoga
                />
                <MobileNavItem
                  icon={<img src={menuIcon6} className="w-6 h-6" />}
                  label="Scheduler"
                  to="/scheduler"
                  active={isActive("/scheduler")}
                  openInNewTab={true} // New tab mein open hoga
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="z-50">
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </>
  );
};

// Updated NavItem component with openInNewTab prop
const NavItem = ({ icon, label, to, active = false, openInNewTab = false }) => (
  <Link
    to={to}
    target={openInNewTab ? "_blank" : "_self"} // ✅ Conditional new tab
    rel={openInNewTab ? "noopener noreferrer" : undefined} // ✅ Security
    className={`flex flex-col items-center px-4 py-2 text-[13px] font-medium mx-0.5 text-dark ${
      active
        ? "border-b-3 border-primary"
        : "border-b-3 border-transparent hover:bg-gray-50"
    } transition-colors duration-200`}
  >
    <div className="mb-1">{icon}</div>
    <span>{label}</span>
  </Link>
);

// Updated MobileNavItem component with openInNewTab prop
const MobileNavItem = ({
  icon,
  label,
  to,
  active = false,
  openInNewTab = false,
}) => (
  <Link
    to={to}
    target={openInNewTab ? "_blank" : "_self"} // ✅ Conditional new tab
    rel={openInNewTab ? "noopener noreferrer" : undefined} // ✅ Security
    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-dark ${
      active
        ? "bg-gray-100 border-l-4 border-primary"
        : "hover:bg-gray-100 border-l-4 border-transparent"
    }`}
  >
    <div className="mr-3">{icon}</div>
    <span>{label}</span>
  </Link>
);

const DropdownItem = ({ icon, label, onClick }) => (
  <Link
    to="#"
    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
    onClick={onClick}
  >
    <span className="mr-3 text-gray-500">{icon}</span>
    <span className="truncate">{label}</span>
  </Link>
);

export default Navbar;
