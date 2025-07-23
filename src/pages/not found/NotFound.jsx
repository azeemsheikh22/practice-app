import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Animation */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          <div className="text-8xl sm:text-9xl lg:text-[12rem] font-bold text-[#25689f]/20 select-none">
            404
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <AlertTriangle size={80} className="text-[#25689f] opacity-80" />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#25689f]/10 rounded-full transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#1F557F]/5 rounded-full transform -translate-x-8 translate-y-8"></div>

          <div className="relative z-10">
            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4"
            >
              Page Not Found
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 mb-2"
            >
              Oops! The page you're looking for doesn't exist.
            </motion.p>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-gray-500 mb-8 max-w-md mx-auto leading-relaxed"
            >
              The page might have been moved, deleted, or you entered the wrong URL.
              Let's get you back on track.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* Go Home Button */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleGoHome}
                className="flex items-center gap-3 cursor-pointer px-6 py-3 bg-[#25689f] hover:bg-[#1F557F] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px] justify-center"
              >
                <Home size={20} />
                <span>Go Home</span>
              </motion.button>

              {/* Go Back Button */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleGoBack}
                className="flex items-center cursor-pointer gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-[#25689f] font-semibold rounded-lg border-2 border-[#25689f] hover:border-[#1F557F] hover:text-[#1F557F] transition-all duration-300 min-w-[160px] justify-center"
              >
                <ArrowLeft size={20} />
                <span>Go Back</span>
              </motion.button>
            </motion.div>

            {/* Additional Help */}
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
                <Search size={16} />
                <span className="text-sm font-medium">Need help?</span>
              </div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                If you believe this is an error, please contact the system administrator
                or try refreshing the page.
              </p>
            </motion.div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#25689f]/0 via-[#25689f]/5 to-[#25689f]/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-400">
            Telogix Tracking App • Error 404
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
