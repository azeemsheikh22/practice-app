import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Navbar from "../../components/navber/Navbar";
import LiveDashboardHeader from "../../components/live dashboard/LiveDashboardHeader";
import LiveDashboardTable from "../../components/live dashboard/LiveDashboardTable";
import { initializeDashboard } from "../../features/liveDashboardSlice"

const LiveDashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize dashboard with static data from slice
    dispatch(initializeDashboard());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <LiveDashboardHeader />
        <LiveDashboardTable />
      </div>
    </div>
  );
};

export default LiveDashboard;
