import React from "react";

const AlertDetailModal = ({ alert, open, onClose }) => {
  if (!open || !alert) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-[600px] p-0 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#0d3552] leading-tight">
            VTS-Cessation of transmission-all Area-Recording-20min
          </h2>
          <button
            className="text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div className="px-6 py-3 flex flex-col gap-2">
          {/* First row: Map and main info */}
          <div className="flex flex-row gap-3 items-start">
            <div className="flex-shrink-0 w-[160px] h-[120px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
              <iframe
                title="alert-location-map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${alert.latitude},${alert.longitude}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1 text-[15px]">
              <div className="text-gray-500">Vehicle Name</div>
              <div className="font-semibold text-gray-800">-</div>
              <div className="text-gray-500">Vehicle Number</div>
              <div className="font-bold text-[#0d3552]">{alert.carname}</div>
              <div className="text-gray-500">Alarm Type</div>
              <div className="font-semibold text-black">Interruption of Transmission</div>
              <div className="text-gray-500">Threshold</div>
              <div className="font-bold text-black">20 min</div>
              <div className="text-gray-500">Trigger Time</div>
              <div className="font-semibold text-black">{new Date(alert.alarm_time).toLocaleString()}</div>
            </div>
          </div>
          {/* Second row: Location, Alarm Trigger, Comment, Password, Contacts */}
          <div className="grid grid-cols-2 gap-3 mt-2 text-[15px]">
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-gray-500">Location</div>
                <div className="font-bold text-[#0d3552] whitespace-pre-line break-words">
                  {alert.location}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Alarm Trigger</div>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-1 mt-1 text-[15px]"
                  value={alert.alarm_trigger || ""}
                  placeholder=""
                  readOnly
                />
              </div>
              <button className="bg-[#0d3552] text-white px-4 py-1.5 rounded font-semibold text-[15px] cursor-pointer">
                Comment
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input
                className="w-full border border-gray-300 rounded px-2 py-1 mt-1 text-[15px]"
                type="password"
                placeholder="Password"
                readOnly
              />
              <div className="flex items-center gap-2 mt-1">
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                  <svg width="24" height="24" fill="gray"><rect width="100%" height="100%" rx="6"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-gray-700 font-semibold">-</div>
                  <div className="flex gap-2 mt-1">
                    <a href="#" className="text-blue-700 underline text-[13px]">Primary Contact</a>
                    <a href="#" className="text-blue-700 underline text-[13px]">Secondary Contact</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end px-6 pb-4">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-1.5 rounded font-semibold text-[15px] cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
