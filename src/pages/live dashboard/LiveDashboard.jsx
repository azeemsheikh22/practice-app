import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Navbar from "../../components/navber/Navbar";
import LiveDashboardHeader from "../../components/live dashboard/LiveDashboardHeader";
import LiveDashboardTable from "../../components/live dashboard/LiveDashboardTable";
import { initializeDashboard } from "../../features/liveDashboardSlice"

const LiveDashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeDashboard());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full  mx-auto px-2 sm:px-4 lg:px-6 py-2">
        <div className="space-y-2">
          <LiveDashboardHeader />
          <LiveDashboardTable />
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
