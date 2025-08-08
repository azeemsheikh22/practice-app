import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login/Login";
import LiveMap from "../pages/live map/LiveMap";
import StartingPage from "../pages/starting page/StartingPage";
import AlertOverview from "../pages/alerts/Alerts";
import GeoFence from "../pages/geoFence/GeoFence";
import LiveDashboard from "../pages/live dashboard/LiveDashboard";
import CreateGeofence from "../components/Geofence/create geofence/CreateGeofence";
import Replay from "../pages/replay/Replay";
import RoutesView from "../pages/routes view/RouteView";
import MatrixPage from "../components/Geofence/matrix/MatrixPage"; // ADD THIS IMPORT
import CreateRoute from "../pages/routes view/create route/CreateRoute";
import ChartDashboard from "../pages/chart dashboard/ChartDashboard";
import NotFound from "../pages/not found/NotFound";
import AdminNavigation from "../admin/AdminRoot";
import AddPolicy from "../pages/alerts/alert policy/AddPolicy";
import Reports from "../pages/reports/Reports";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AllRoute() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <StartingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-map"
        element={
          <ProtectedRoute>
            <LiveMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AlertOverview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-policy"
        element={
          <ProtectedRoute>
            <AddPolicy />
          </ProtectedRoute>
        }
      />

      <Route
        path="/geofence"
        element={
          <ProtectedRoute>
            <GeoFence />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/livedashboard"
        element={
          <ProtectedRoute>
            <LiveDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-geofence"
        element={
          <ProtectedRoute>
            <CreateGeofence />
          </ProtectedRoute>
        }
      />

      {/* ADD THIS NEW ROUTE FOR MATRIX PAGE */}
      <Route
        path="/geofence-matrix"
        element={
          <ProtectedRoute>
            <MatrixPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/replay"
        element={
          <ProtectedRoute>
            <Replay />
          </ProtectedRoute>
        }
      />

      <Route
        path="/routesview"
        element={
          <ProtectedRoute>
            <RoutesView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ChartDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/create-route" element={<CreateRoute />} />

      {/* Admin Routes with nested sub-routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminNavigation />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AllRoute;
