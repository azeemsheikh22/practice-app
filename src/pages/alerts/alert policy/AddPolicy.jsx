import React from "react";
import Navbar from "../../../components/navber/Navbar";
import PolicySetupForm from "./PolicySetupForm";

export default function AddPolicy() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 pt-3">
        <PolicySetupForm />
      </div>
    </div>
  );
}