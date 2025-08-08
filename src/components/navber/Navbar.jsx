import React, { useState, useRef, useEffect } from "react";
// import logo from "../../assets/logo.png";
import logo3 from "../../assets/LogoColor.png";
// import logo2 from "../../assets/logo2.png";
import menuIcon1 from "../../assets/menuICON1.png";
import menuIcon2 from "../../assets/menuICON2.png";
import menuIcon3 from "../../assets/menuICON3.png";
// import menuIcon4 from "../../assets/menuICON4.png";
import menuIcon5 from "../../assets/menuICON5.png";
// import menuIcon6 from "../../assets/menuICON6.png";
import menuIcon7 from "../../assets/menuICON7.png";
import menuIcon8 from "../../assets/menuICON8.png";
import menuIcon9 from "../../assets/menuICON9.png";
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
  Maximize,
  Minimize,
  Shield,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ChangePasswordModal from "../change password/ChangePasswordModal";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // const userName = localStorage.getItem("userName");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  // const userRole = localStorage.getItem("userRole"); // ✅ Added for role-based access
  // const groupLogo = localStorage.getItem("groupLogo");

  // const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  // const logoUrl = groupLogo
  //   ? `${apiBaseUrl}${groupLogo}`.replace(/\/+$/, "") // Remove trailing slash
  //   : logo;

  // ✅ Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  // ✅ Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.log(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Check if the current path matches the menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bg-white relative h-[9vh] z-[800]">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between h-[8vh]">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <img
                  // src={logoUrl}
                  src={logo3}
                  alt="Telogix"
                  className="h-10 w-auto rounded cursor-pointer"
                  onClick={() => navigate("/")}
                />

                <div className="hidden xl:flex flex-col ml-2">
                  <span className="text-base lg:text-sm font-semibold text-gray-800">
                    {firstName} {lastName}
                  </span>
                  <span className="text-sm lg:text-xs text-gray-500">Welcome back</span>
                </div>
              </div>

              <div className="hidden xl:flex items-center ml-3">
                <NavItem
                  icon={<img src={menuIcon1} className="w-[18px] h-[18px]" />}
                  label="Live Map"
                  to="/live-map"
                  active={isActive("/live-map")}
                  openInNewTab={true}
                />
                <NavItem
                  icon={<img src={menuIcon9} className="w-[18px] h-[18px]" />}
                  label="Dashboard"
                  to="/dashboard"
                  active={isActive("/dashboard")}
                  openInNewTab={true}
                />

                <NavItem
                  icon={<img src={menuIcon7} className="w-[18px] h-[18px]" />}
                  label="Geofence"
                  to="/geofence"
                  active={isActive("/geofence")}
                  openInNewTab={true}
                />
                <NavItem
                  icon={<img src={menuIcon3} className="w-[18px] h-[18px]" />}
                  label="Replay"
                  to="/replay"
                  active={isActive("/replay")}
                  openInNewTab={true}
                />
                <NavItem
                  icon={<img src={menuIcon5} className="w-[18px] h-[18px]" />}
                  label="Alerts"
                  to="/alerts"
                  active={isActive("/alerts")}
                  openInNewTab={true}
                />
                <NavItem
                  icon={<img src={menuIcon2} className="w-[18px] h-[18px]" />}
                  label="Reports"
                  to="/reports"
                  active={isActive("/reports")}
                  openInNewTab={true}
                />

                <NavItem
                  icon={<img src={menuIcon8} className="w-[18px] h-[18px]" />}
                  label="Routes"
                  to="/routesview"
                  active={isActive("/routesview")}
                  openInNewTab={true}
                />

                {/* <NavItem
                  icon={<img src={menuIcon6} className="w-[18px] h-[18px]" />}
                  label="Scheduler"
                  to="#"
                  active={isActive("/scheduler")}
                  openInNewTab={true}
                /> */}
              </div>
            </div>

            <div className="flex items-center">
              {/* ✅ Fullscreen Toggle Button - Desktop Only */}
              <div className="hidden xl:block mr-3">
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>

              <button className="p-2.5 rounded-full text-white bg-black cursor-pointer relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 bg-red-500 rounded-full w-2.5 h-2.5 border-2 border-white"></span>
              </button>

              <div className="ml-4 relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-center md:h-11 md:w-11 h-9 w-9 rounded-full bg-black cursor-pointer text-white"
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
                      className=" fixed right-0 mt-2 w-64 rounded-md shadow-lg bg-white z-[99999] overflow-hidden"
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
                          icon={<Shield size={18} />}
                          label="Admin"
                          to="/admin/menu"
                        />


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
                            className="flex items-center cursor-pointer w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
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

              {/* ✅ Mobile Menu Button - Enhanced */}
              <div className="ml-3 xl:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md bg-black text-white"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Enhanced Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[9998] xl:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Mobile Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-[9999] xl:hidden overflow-y-auto"
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <img src={logo3} alt="Telogix" className="h-8 w-auto" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {firstName} {lastName}
                      </h3>
                      <p className="text-xs text-gray-500">Navigation Menu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="py-4">
                  <MobileNavItem
                    icon={<img src={menuIcon1} className="w-5 h-5" />}
                    label="Live Map"
                    to="/live-map"
                    active={isActive("/live-map")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  <MobileNavItem
                    icon={<img src={menuIcon9} className="w-5 h-5" />}
                    label="Dashboard"
                    to="/dashboard"
                    active={isActive("/dashboard")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  <MobileNavItem
                    icon={<img src={menuIcon7} className="w-5 h-5" />}
                    label="Geofence"
                    to="/geofence"
                    active={isActive("/geofence")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  <MobileNavItem
                    icon={<img src={menuIcon3} className="w-5 h-5" />}
                    label="Replay"
                    to="/replay"
                    active={isActive("/replay")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  <MobileNavItem
                    icon={<img src={menuIcon5} className="w-5 h-5" />}
                    label="Alerts"
                    to="/alerts"
                    active={isActive("/alerts")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  <MobileNavItem
                    icon={<img src={menuIcon2} className="w-5 h-5" />}
                    label="Reports"
                    to="/reports"
                    active={isActive("/reports")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />

                  <MobileNavItem
                    icon={<img src={menuIcon8} className="w-5 h-5" />}
                    label="Routes"
                    to="/routesview"
                    active={isActive("/routesview")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />
                  {/* <MobileNavItem
                    icon={<img src={menuIcon6} className="w-5 h-5" />}
                    label="Scheduler"
                    to="#"
                    active={isActive("/scheduler")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  /> */}


                  <MobileNavItem
                    icon={<Shield className="w-5 h-5" />}
                    label="Admin"
                    to="/admin/menu"
                    active={isActive("/admin/menu")}
                    onClick={() => setMobileMenuOpen(false)}
                    openInNewTab={true}
                  />

                </div>

                {/* Mobile Menu Footer */}
                <div className="border-t border-gray-200 p-4 mt-auto">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(firstName?.[0] || "") + (lastName?.[0] || "")}
                    </div>
                    <div>
                      <p className="text-sm lg:text-xs font-medium text-gray-900">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs lg:text-[10px] text-gray-500">Logged in user</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={handleChangePasswordClick}
                    className="flex items-center w-full px-3 py-2 text-sm lg:text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Lock size={16} className="mr-3" />
                      Change Password
                    </button>
                    <button
                      onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm lg:text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
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

// ✅ Desktop NavItem - Original UI maintained
const NavItem = ({ icon, label, to, active = false, openInNewTab = false }) => (
  <Link
    to={to}
    target={openInNewTab ? "_blank" : "_self"}
    rel={openInNewTab ? "noopener noreferrer" : undefined}
    className={`flex flex-col items-center px-4 py-2 text-[13px] lg:text-[11px] font-medium mx-0.5 text-dark ${active
      ? "border-b-3 border-primary"
      : "border-b-3 border-transparent hover:bg-gray-50"
      } transition-colors duration-200`}
  >
    <div className="mb-1">{icon}</div>
    <span>{label}</span>
  </Link>
);

// ✅ Enhanced Mobile NavItem
const MobileNavItem = ({
  icon,
  label,
  to,
  active = false,
  onClick,
  openInNewTab = false,
}) => {
  const handleClick = (e) => {
    if (to === "#") {
      e.preventDefault();
      onClick();
      return;
    }

    if (openInNewTab) {
      e.preventDefault();
      window.open(to, '_blank');
      onClick();
    } else {
      onClick();
    }
  };

  const baseClasses = "flex items-center px-4 py-3 text-sm font-medium transition-colors cursor-pointer border-l-4";
  const activeClasses = active
    ? "bg-primary/10 text-primary border-primary"
    : "text-gray-700 hover:bg-gray-50 hover:text-primary border-transparent hover:border-primary/30";

  if (openInNewTab || to === "#") {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses} w-full text-left`}
        disabled={to === "#"}
      >
        <span className="mr-3">{icon}</span>
        {label}
        {openInNewTab && (
          <span className="ml-auto text-xs text-gray-400">↗</span>
        )}
      </button>
    );
  }

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

// ✅ Updated DropdownItem with routing support
const DropdownItem = ({ icon, label, onClick, to }) => {
  if (to) {
    return (
      <Link
        to={to}
        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <div className="mr-3 text-gray-500">{icon}</div>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to="#"
      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      <div className="mr-3 text-gray-500">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;

