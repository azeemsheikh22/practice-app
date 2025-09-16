import React, { useEffect } from "react";
import Navbar from "../../../components/navber/Navbar";
import PolicySetupForm from "./PolicySetupForm";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initializeConnection, selectConnectionStatus } from "../../../features/gpsTrackingSlice";

export default function AddPolicy() {
  // Get route state
  const location = useLocation();
  const policyData = location.state || {};
  const dispatch = useDispatch();
  const connectionStatus = useSelector(selectConnectionStatus);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 pt-3">
        <PolicySetupForm routePolicyData={policyData} />
      </div>
    </div>
  );
}
