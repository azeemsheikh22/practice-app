import { useEffect } from "react";
import Navbar from "../../../components/navber/Navbar";
import EditPolicySetupForm from "./EditPolicySetupForm";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeConnection,
  selectConnectionStatus,
} from "../../../features/gpsTrackingSlice";
import { fetchPolicyDetails } from "../../../features/alertpolicySlice";

export default function EditPolicy() {
  const location = useLocation();
  // Get id from query param
  const searchParams = new URLSearchParams(location.search);
  const policyId = searchParams.get("id");
  const policyData = location.state || {};
  const dispatch = useDispatch();
  const connectionStatus = useSelector(selectConnectionStatus);
  const policyDetails = useSelector((state) => state.alertpolicy.policyDetails);

  console.log(policyDetails);

  useEffect(() => {
    // Only initialize if not already connected
    if (connectionStatus === "disconnected") {
      dispatch(initializeConnection(3));
    }
  }, []);

  useEffect(() => {
    // Dispatch fetchPolicyDetails if policyId is present
    if (policyId) {
      dispatch(fetchPolicyDetails(policyId));
    }
  }, [policyId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-3">
        <EditPolicySetupForm routePolicyData={policyData} />
      </div>
    </div>
  );
}
