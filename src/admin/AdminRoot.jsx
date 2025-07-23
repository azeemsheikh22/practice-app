import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/navber/Navbar";
import NavigationMenu from "./pages/NavigationMenu";

// Simple admin page example
const VehiclesView = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Vehicles Management</h1>
    <p className="text-gray-600">Manage all vehicles from here</p>
  </div>
);

export default function AdminRoot() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <Routes>
          {/* Admin sub-routes */}
          <Route path="/menu" element={<NavigationMenu />} />
          
        </Routes>
      </div>
    </div>
  );
}
