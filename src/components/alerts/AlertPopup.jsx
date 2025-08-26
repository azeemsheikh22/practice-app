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
      className="fixed bottom-4 right-4 flex flex-col items-end"
      style={{ zIndex, pointerEvents: 'none' }}
    >
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            key={alerts[alerts.length - 1].alm_id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              pointerEvents: 'auto',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
            }}
            className="bg-[#0d3552] text-white rounded-lg px-4 py-2 min-w-[240px] max-w-[340px] relative border-l-4 border-blue-400 transition-all duration-200"
            onMouseEnter={() => onAlertHover && onAlertHover(alerts[alerts.length - 1].alm_id)}
            onMouseLeave={() => onAlertHover && onAlertHover(null)}
          >
            <div className="flex items-center gap-3 mb-1">
              <div>{alertTypeIcons[alerts[alerts.length - 1].alm_type] || <AlertCircle size={20} />}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight break-words">
                  {alerts[alerts.length - 1].alm_type}
                </div>
                <div className="text-[11px] text-gray-200 max-w-[200px] overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal' }}>
                  {alerts[alerts.length - 1].carname} @ {alerts[alerts.length - 1].location}
                </div>
              </div>
              <button
                className="ml-1 text-white/80 hover:text-red-400 text-base font-bold cursor-pointer"
                onClick={() => onClose(alerts[alerts.length - 1].alm_id)}
                title="Close"
                style={{ pointerEvents: 'auto' }}
              >
                ×
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <button
                className="text-blue-300 hover:underline text-[11px] font-medium cursor-pointer"
                onClick={() => onViewAlert && onViewAlert(alerts[alerts.length - 1])}
                style={{ pointerEvents: 'auto' }}
              >
                View Alert
              </button>
              <button
                className="text-white/70 hover:text-red-400 text-[11px] font-medium cursor-pointer"
                onClick={() => onClose("all")}
                style={{ pointerEvents: 'auto' }}
              >
                Close All
              </button>
            </div>
            {/* If more alerts, show a badge/indicator */}
            {alerts.length > 1 && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full shadow-lg border border-white select-none" style={{ pointerEvents: 'none' }}>
                +{alerts.length - 1} more
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertPopup;
