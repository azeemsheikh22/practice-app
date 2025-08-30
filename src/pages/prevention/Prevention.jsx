import React from "react";
import PreventionMap from "./PreventionMap";
import Navbar from "../../components/navber/Navbar";
import { Car, User, Navigation, ParkingCircle, Clock, MapPin, Settings } from "lucide-react";

export default function Prevention() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Navbar />
      {/* Map as full background */}
      <div className="absolute inset-0 z-0" >
        <PreventionMap />
      </div>
      <div className="absolute left-0 z-10 flex justify-center">
        <div className="flex flex-row gap-6 bg-[#2d3748]/80 px-8 py-2 mx-auto max-w-5xl w-full justify-between">
          <div className="flex items-center gap-2 text-[#22d3ee] font-semibold text-base">
            <Car size={20} className="text-[#22d3ee]" />
            <span className="text-sm text-white">Vehicle</span>
            <span className="ml-2 text-lg font-bold">99</span>
          </div>
          <div className="flex items-center gap-2 text-[#22c55e] font-semibold text-base">
            <User size={20} className="text-[#22c55e]" />
            <span className="text-sm text-white">Driver</span>
            <span className="ml-2 text-lg font-bold">0</span>
          </div>
          <div className="flex items-center gap-2 text-[#22d3ee] font-semibold text-base">
            <Navigation size={20} className="text-[#22d3ee]" />
            <span className="text-sm text-white">Driving</span>
            <span className="ml-2 text-lg font-bold">20</span>
          </div>
          <div className="flex items-center gap-2 text-[#fbbf24] font-semibold text-base">
            <ParkingCircle size={20} className="text-[#fbbf24]" />
            <span className="text-sm text-white">Parking</span>
            <span className="ml-2 text-lg font-bold">0</span>
          </div>
          <div className="flex items-center gap-2 text-[#0ea5e9] font-semibold text-base">
            <Clock size={20} className="text-[#0ea5e9]" />
            <span className="text-sm text-white">Idle</span>
            <span className="ml-2 text-lg font-bold">26</span>
          </div>
          <div className="flex items-center gap-2 text-[#a855f7] font-semibold text-base">
            <MapPin size={20} className="text-[#a855f7]" />
            <span className="text-sm text-white">Not Located</span>
            <span className="ml-2 text-lg font-bold">5</span>
          </div>
        </div>
      </div>

      {/* Special Attention - left, full height */}
      <div className="absolute top-26 left-0 bottom-6 h-full z-10 bg-[#2d3748]/80 p-4 min-w-[300px] max-w-xs w-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Special Attention</h2>
          <button className="text-gray-300 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">TMQ-832</span>
              <button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-3 py-1 rounded text-xs font-semibold">
                Evidence
              </button>
            </div>
            <div className="text-xs text-gray-300 flex items-center gap-2">
              <span className="text-yellow-400">⚠</span>
              <span>Distracted Driving | 2025-08-12 10:51:39</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">TMH-504</span>
              <button className="bg-[#06b6d4] hover:bg-[#0891b2] text-white px-3 py-1 rounded text-xs font-semibold">
                Evidence
              </button>
            </div>
            <div className="text-xs text-gray-300 flex items-center gap-2">
              <span className="text-yellow-400">⚠</span>
              <span>Distracted Driving | 2025-08-12 10:51:32</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Risk panel - top right */}
      <div className="absolute h-full top-14 right-0 z-10 bg-[#2d3748]/70 p-4 min-w-[300px] text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Vehicle Risk / Driver Risk</h2>
          <button className="text-gray-300 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-red-400 text-sm">No.1 C-3044</span>
              <span className="font-bold text-red-400 text-sm">461</span>
            </div>
            <div className="w-full h-2 bg-gray-600 rounded">
              <div className="h-2 bg-red-500 rounded" style={{ width: "95%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-yellow-400 text-sm">No.2 TMQ-981</span>
              <span className="font-bold text-yellow-400 text-sm">254</span>
            </div>
            <div className="w-full h-2 bg-gray-600 rounded">
              <div className="h-2 bg-yellow-500 rounded" style={{ width: "60%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-blue-400 text-sm">No.3 TMG-171</span>
              <span className="font-bold text-blue-400 text-sm">210</span>
            </div>
            <div className="w-full h-2 bg-gray-600 rounded">
              <div className="h-2 bg-blue-500 rounded" style={{ width: "45%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-300 text-sm">No.4 E-2932</span>
              <span className="font-bold text-gray-300 text-sm">120</span>
            </div>
            <div className="w-full h-2 bg-gray-600 rounded">
              <div className="h-2 bg-gray-400 rounded" style={{ width: "25%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alarm notification bar - bottom left (half width, transparent) */}
      <div className="absolute bottom-4 left-100 z-20 bg-[#2d3748]/70 backdrop-blur-sm border border-gray-600 rounded-lg text-white px-4 py-2 flex items-center gap-3 shadow-lg max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-md">🔔</span>
          <span className="font-bold">C-3044</span>
          <span className="text-xs text-gray-300">2025-08-12 10:56:00</span>
          <span className="font-semibold text-sm">Distracted Driving</span>
        </div>
      </div>
    </div>
  );
}

