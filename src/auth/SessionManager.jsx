import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const SessionManager = ({
  sessionTimeout = 30 * 60 * 1000, // 30 minutes (changed from 2 minutes)
  checkInterval = 30 * 1000, // Check every 30 seconds
  warningTime = 2 * 60 * 1000, // Warning 2 minutes before (changed from 30 seconds)
  children,
}) => {
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const logoutTimeoutRef = useRef(null);

  const updateLastActivity = () => {
    const currentTime = new Date().getTime();
    localStorage.setItem("lastActivityTime", currentTime.toString());
    warningShownRef.current = false;

    // Clear any pending logout
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  };

  // Function to check session validity
  const checkSession = () => {
    const token = localStorage.getItem("token");
    const loginTime = localStorage.getItem("loginTime");
    const lastActivityTime = localStorage.getItem("lastActivityTime");

    // If user is logged in but no time data exists, logout immediately
    if (token && (!loginTime || !lastActivityTime)) {
      handleLogout("Session data corrupted. Please login again.");
      return;
    }

    // If no token or login time, user is not logged in
    if (!token || !loginTime) {
      return;
    }

    // Validate time data format
    const parsedLoginTime = parseInt(loginTime);
    const parsedLastActivity = parseInt(lastActivityTime || loginTime);

    if (isNaN(parsedLoginTime) || isNaN(parsedLastActivity)) {
      handleLogout("Invalid session data. Please login again.");
      return;
    }

    const currentTime = new Date().getTime();
    const timeSinceLastActivity = currentTime - parsedLastActivity;

    // Check if time data is from future (system clock manipulation)
    if (parsedLastActivity > currentTime + 60000) {
      // 1 minute tolerance
      handleLogout("Time manipulation detected. Please login again.");
      return;
    }

    

    // Check if login time is too old (more than 24 hours)
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    if (currentTime - parsedLoginTime > maxSessionAge) {
      handleLogout("Session expired. Please login again.");
      return;
    }

    // MAIN LOGOUT LOGIC: Check if session has expired
    if (timeSinceLastActivity >= sessionTimeout) {
      handleLogout("Session expired due to inactivity");
      return;
    }

    // Show warning if close to expiry
    const timeUntilExpiry = sessionTimeout - timeSinceLastActivity;
    if (timeUntilExpiry <= warningTime && !warningShownRef.current) {
      // showSessionWarning(Math.ceil(timeUntilExpiry / 1000));
      warningShownRef.current = true;

      // Set timeout for automatic logout (FORCE LOGOUT)
      logoutTimeoutRef.current = setTimeout(() => {
        handleLogout("Session expired due to inactivity");
      }, timeUntilExpiry);
    }
  };

  // Function to show session warning
  // const showSessionWarning = (secondsLeft) => {
  //   toast.error(
  //     `Your session will expire in ${secondsLeft} seconds due to inactivity. Click anywhere to extend your session.`,
  //     {
  //       duration: warningTime,
  //       position: "top-center",
  //       style: {
  //         background: "#FEE2E2",
  //         color: "#B91C1C",
  //         fontWeight: "bold",
  //         maxWidth: "500px",
  //         padding: "16px",
  //         borderRadius: "8px",
  //       },
  //       icon: "⚠️",
  //     }
  //   );
  // };

  // Function to handle logout
  const handleLogout = (reason = "Session expired") => {
    // Clear all session data
    localStorage.clear();

    // Clear intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }

    // Show logout message
    toast.error(reason, {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#FEE2E2",
        color: "#B91C1C",
        fontWeight: "bold",
      },
    });

    // Redirect to login
    setTimeout(() => {
      window.location.href = "/#/login";
    }, 1000);
  };

  // Function to extend session
  const extendSession = () => {
    updateLastActivity();
    toast.success("Session extended successfully!", {
      duration: 2000,
      position: "top-center",
      style: {
        background: "#ECFDF5",
        color: "#065F46",
        fontWeight: "bold",
      },
    });
  };

  // Function to validate session on component mount
  const validateSessionOnMount = () => {
    const token = localStorage.getItem("token");

    if (token) {
      const loginTime = localStorage.getItem("loginTime");
      const lastActivityTime = localStorage.getItem("lastActivityTime");

      // If token exists but time data is missing, logout immediately
      if (!loginTime || !lastActivityTime) {
        handleLogout("Session data missing. Please login again.");
        return false;
      }

      // Validate time format
      if (isNaN(parseInt(loginTime)) || isNaN(parseInt(lastActivityTime))) {
        handleLogout("Invalid session data. Please login again.");
        return false;
      }

      return true;
    }

    return false;
  };

  // Activity event listeners
  useEffect(() => {
    // Validate session on component mount
    const isValidSession = validateSessionOnMount();

    // Only run if user is logged in and session is valid
    if (!isValidSession) {
      return;
    }

    // Activity events to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners for user activity
    const handleActivity = () => {
      updateLastActivity();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start session checking interval
    intervalRef.current = setInterval(checkSession, checkInterval);

    // Initial session check
    checkSession();

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [sessionTimeout, checkInterval, warningTime]);

  // Extend session button (optional - can be used in UI)
  const SessionExtendButton = () => (
    <button
      onClick={extendSession}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 z-50"
      style={{ display: warningShownRef.current ? "block" : "none" }}
    >
      Extend Session
    </button>
  );

  return (
    <>
      {children}
      <SessionExtendButton />
    </>
  );
};

export default SessionManager;
