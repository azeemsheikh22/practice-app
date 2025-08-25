import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

const alertTypeIcons = {
  "Long Stop": <AlertCircle className="text-yellow-400" size={28} />, // Example, add more types as needed
  "Ignition": <AlertCircle className="text-red-500" size={28} />,
  // ...add more types and icons/colors
};

const AlertPopup = ({ alerts, onClose, zIndex = 9999, onAlertHover, onViewAlert }) => {
  return (
    <div
      className="fixed top-4 right-4 flex flex-col gap-3 items-end"
      style={{ zIndex }}
    >
      <AnimatePresence>
        {alerts.slice(-4).map((alert) => (
          <motion.div
            key={alert.alm_id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-[#0d3552] text-white shadow-2xl rounded-lg px-4 py-3 min-w-[240px] max-w-[320px] relative border-l-4 border-blue-400"
            onMouseEnter={() => onAlertHover && onAlertHover(alert.alm_id)}
            onMouseLeave={() => onAlertHover && onAlertHover(null)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div>{alertTypeIcons[alert.alm_type] || <AlertCircle size={20} />}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight break-words">
                  {alert.alm_type}
                </div>
                <div className="text-[11px] text-gray-200 max-w-[180px] overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal' }}>
                  {alert.carname} @ {alert.location}
                </div>
              </div>
              <button
                className="ml-1 text-white/80 hover:text-red-400 text-base font-bold cursor-pointer"
                onClick={() => onClose(alert.alm_id)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <button
                className="text-blue-300 hover:underline text-[11px] font-medium cursor-pointer"
                onClick={() => onViewAlert && onViewAlert(alert)}
              >
                View Alert
              </button>
              <button
                className="text-white/70 hover:text-red-400 text-[11px] font-medium cursor-pointer"
                onClick={() => onClose("all")}
              >
                Close All
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertPopup;
