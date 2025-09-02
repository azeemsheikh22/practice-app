import { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  ChevronRight,
  ChevronDown,
  Car,
  Users,
  Layers,
} from "lucide-react";
import SelectionModal from "./SelectionModal";
import { motion } from "framer-motion";

const ReportSetup = ({ selectedReport, selectedCategory, onRun, onCancel }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [reportConfig, setReportConfig] = useState({
    target: "vehicle",
    vehicleSelected: false,
    selectedItems: [],
    timeFrame: "today",
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    fromTime: "00:00",
    toTime: "23:59",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle selection changes
  const handleSelectionChange = (field, value) => {
    setReportConfig({
      ...reportConfig,
      [field]: value,
    });
  };

  const handleRadioChange = (e) => {
    setReportConfig({
      ...reportConfig,
      target: e.target.value,
      vehicleSelected: false,
    });
  };

  const handleTimeFrameChange = (value) => {
    setReportConfig({
      ...reportConfig,
      timeFrame: value,
    });

    // Set dates based on selection
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let fromDate, toDate;

    switch (value) {
      case "today":
        fromDate = today.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "yesterday":
        fromDate = yesterday.toISOString().split("T")[0];
        toDate = yesterday.toISOString().split("T")[0];
        break;
      case "thisWeek":
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        fromDate = firstDay.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "lastWeek":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        fromDate = lastWeekStart.toISOString().split("T")[0];
        toDate = lastWeekEnd.toISOString().split("T")[0];
        break;
      case "last7Days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        fromDate = sevenDaysAgo.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "last15Days":
        const fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(today.getDate() - 15);
        fromDate = fifteenDaysAgo.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "other":
        // Keep current dates
        break;
      default:
        fromDate = today.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
    }

    setReportConfig((prev) => ({
      ...prev,
      fromDate,
      toDate,
    }));
  };

  // Handle opening the selection modal
  const openSelectionModal = () => {
    setIsModalOpen(true);
  };

  // Handle saving selections from the modal
  const handleSaveSelection = (items) => {
    setReportConfig({
      ...reportConfig,
      vehicleSelected: items.length > 0,
      selectedItems: items,
    });
  };

  // Function to simulate running the report
  const handleRunReport = () => {
    // Extract valueIds from selected items for sending to backend
    const selectedValueIds = reportConfig.selectedItems.map(
      (item) => item.valueId || item.id
    );

    // Format dates with time for API
    const fromDateTime = `${reportConfig.fromDate} ${reportConfig.fromTime}:00`;
    const toDateTime = `${reportConfig.toDate} ${reportConfig.toTime}:59`;

    const reportData = {
      ...reportConfig,
      selectedValueIds, // Send valueIds instead of full objects
      fromDateTime,
      toDateTime,
    };

    // Here you would normally validate that all required selections are made
    onRun(reportData);
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{selectedReport}</h2>
            <p className="text-sm opacity-90">Category: {selectedCategory}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Report Configuration Steps */}
        <div className="p-6">
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <button
              className={`flex items-center gap-2 pb-2 px-1 cursor-pointer ${
                activeStep === 1
                  ? "text-[#25689f] border-b-2 border-[#25689f]"
                  : "text-gray-500 hover:text-[#25689f]"
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div className="w-6 h-6 rounded-full bg-[#25689f] text-white flex items-center justify-center text-sm">
                1
              </div>
              <span className="font-medium">Selection</span>
            </button>

            <ChevronRight className="text-gray-400" size={20} />

            <button
              className={`flex items-center gap-2 pb-2 px-1 ${
                !reportConfig.vehicleSelected
                  ? "cursor-not-allowed text-gray-300"
                  : activeStep === 2
                  ? "text-[#25689f] border-b-2 border-[#25689f] cursor-pointer"
                  : "text-gray-500 hover:text-[#25689f] cursor-pointer"
              }`}
              onClick={() => reportConfig.vehicleSelected && setActiveStep(2)}
              disabled={!reportConfig.vehicleSelected}
            >
              <div
                className={`w-6 h-6 rounded-full ${
                  reportConfig.vehicleSelected ? "bg-[#25689f]" : "bg-gray-300"
                } text-white flex items-center justify-center text-sm`}
              >
                2
              </div>
              <span className="font-medium">Time Frame</span>
            </button>

            <ChevronRight className="text-gray-400" size={20} />

            <button
              className={`flex items-center gap-2 pb-2 px-1 ${
                !reportConfig.vehicleSelected
                  ? "cursor-not-allowed text-gray-300"
                  : activeStep === 3
                  ? "text-[#25689f] border-b-2 border-[#25689f] cursor-pointer"
                  : "text-gray-500 hover:text-[#25689f] cursor-pointer"
              }`}
              onClick={() => reportConfig.vehicleSelected && setActiveStep(3)}
              disabled={!reportConfig.vehicleSelected}
            >
              <div
                className={`w-6 h-6 rounded-full ${
                  reportConfig.vehicleSelected ? "bg-[#25689f]" : "bg-gray-300"
                } text-white flex items-center justify-center text-sm`}
              >
                3
              </div>
              <span className="font-medium">Options</span>
            </button>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {activeStep === 1 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-[#25689f]">1</span>
                  Run this report for:
                </h3>

                <div className="space-y-3 ml-4">
                  {/* Vehicle Selection */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="vehicle-select"
                      name="target"
                      value="vehicle"
                      checked={reportConfig.target === "vehicle"}
                      onChange={handleRadioChange}
                      className="form-radio text-[#25689f] h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="vehicle-select"
                      className="flex items-center gap-2 text-gray-700 cursor-pointer"
                    >
                      <Car size={16} className="text-green-600" />
                      Select Vehicle(s)
                    </label>

                    {reportConfig.target === "vehicle" && (
                      <button
                        className={`ml-4 px-3 py-1 text-sm rounded-md cursor-pointer ${
                          reportConfig.vehicleSelected
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-[#25689f]/10 text-[#25689f] hover:bg-[#25689f]/20 border border-[#25689f]/20"
                        }`}
                        onClick={openSelectionModal}
                      >
                        {reportConfig.vehicleSelected ? "✓ Selected" : "Select"}
                      </button>
                    )}
                  </div>

                  {/* Driver Selection */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="driver-select"
                      name="target"
                      value="driver"
                      checked={reportConfig.target === "driver"}
                      onChange={handleRadioChange}
                      className="form-radio text-[#25689f] h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="driver-select"
                      className="flex items-center gap-2 text-gray-700 cursor-pointer"
                    >
                      <Users size={16} className="text-violet-600" />
                      Select Driver(s)
                    </label>

                    {reportConfig.target === "driver" && (
                      <button
                        className={`ml-4 px-3 py-1 text-sm rounded-md cursor-pointer ${
                          reportConfig.vehicleSelected
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-[#25689f]/10 text-[#25689f] hover:bg-[#25689f]/20 border border-[#25689f]/20"
                        }`}
                        onClick={openSelectionModal}
                      >
                        {reportConfig.vehicleSelected ? "✓ Selected" : "Select"}
                      </button>
                    )}
                  </div>

                  {/* Group Selection */}
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="group-select"
                      name="target"
                      value="group"
                      checked={reportConfig.target === "group"}
                      onChange={handleRadioChange}
                      className="form-radio text-[#25689f] h-4 w-4 cursor-pointer"
                    />
                    <label
                      htmlFor="group-select"
                      className="flex items-center gap-2 text-gray-700 cursor-pointer"
                    >
                      <Layers size={16} className="text-blue-600" />
                      Select Group(s)
                    </label>

                    {reportConfig.target === "group" && (
                      <button
                        className={`ml-4 px-3 py-1 text-sm rounded-md cursor-pointer ${
                          reportConfig.vehicleSelected
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-[#25689f]/10 text-[#25689f] hover:bg-[#25689f]/20 border border-[#25689f]/20"
                        }`}
                        onClick={openSelectionModal}
                      >
                        {reportConfig.vehicleSelected ? "✓ Selected" : "Select"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex mt-6 justify-end">
                  <button
                    className="flex items-center gap-1 px-4 py-2 bg-[#25689f] text-white rounded-md hover:bg-[#1F557F] transition-colors cursor-pointer"
                    onClick={() => setActiveStep(2)}
                    disabled={!reportConfig.vehicleSelected}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-[#25689f]">2</span>
                  Select report time frame:
                </h3>

                <div className="space-y-3 ml-4">
                  <select
                    value={reportConfig.timeFrame}
                    onChange={(e) => handleTimeFrameChange(e.target.value)}
                    className="w-60 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="last7Days">Last 7 Days</option>
                    <option value="last15Days">Last 15 Days</option>
                    <option value="other">Other</option>
                  </select>

                  {reportConfig.timeFrame === "other" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={reportConfig.fromDate}
                            onChange={(e) =>
                              handleSelectionChange("fromDate", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
                          />
                          <Calendar
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={16}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={reportConfig.toDate}
                            onChange={(e) =>
                              handleSelectionChange("toDate", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
                          />
                          <Calendar
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={16}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={reportConfig.fromTime}
                            onChange={(e) =>
                              handleSelectionChange("fromTime", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
                          />
                          <Clock
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={16}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To Time
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={reportConfig.toTime}
                            onChange={(e) =>
                              handleSelectionChange("toTime", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer"
                          />
                          <Clock
                            className="absolute left-3 top-2.5 text-gray-400"
                            size={16}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex mt-6 justify-between">
                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                      onClick={() => setActiveStep(1)}
                    >
                      <ChevronDown size={16} /> Back
                    </button>

                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-[#25689f] text-white rounded-md hover:bg-[#1F557F] transition-colors cursor-pointer"
                      onClick={() => setActiveStep(3)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-[#25689f]">3</span>
                  Ready to Generate Report
                </h3>

                <div className="space-y-6 ml-4">
                  {/* Report Summary Card */}
                  <motion.div
                    className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#25689f] rounded-full flex items-center justify-center">
                        <Download size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {selectedReport}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Category: {selectedCategory}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          Target:
                        </span>
                        <div className="flex items-center gap-1">
                          {reportConfig.target === "vehicle" && (
                            <Car size={14} className="text-green-600" />
                          )}
                          {reportConfig.target === "driver" && (
                            <Users size={14} className="text-violet-600" />
                          )}
                          {reportConfig.target === "group" && (
                            <Layers size={14} className="text-blue-600" />
                          )}
                          <span className="text-gray-600 capitalize">
                            {reportConfig.target}(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700">
                          Selected:
                        </span>
                        <div className="flex-1">
                          <span className="text-gray-600 mb-2 block">
                            {reportConfig.selectedItems.length}{" "}
                            {reportConfig.target}(s)
                          </span>
                          {reportConfig.selectedItems.length > 0 && (
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {reportConfig.selectedItems.map((item, index) => (
                                <div
                                  key={item.id || index}
                                  className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border"
                                >
                                  {reportConfig.target === "vehicle" && (
                                    <Car size={12} className="text-green-600" />
                                  )}
                                  {reportConfig.target === "driver" && (
                                    <Users
                                      size={12}
                                      className="text-violet-600"
                                    />
                                  )}
                                  {reportConfig.target === "group" && (
                                    <Layers
                                      size={12}
                                      className="text-blue-600"
                                    />
                                  )}
                                  <span className="text-gray-700 font-medium truncate">
                                    {item.text || item.name || "Unknown"}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    (ID: {item.valueId || item.id})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          Time Frame:
                        </span>
                        <span className="text-gray-600 capitalize">
                          {reportConfig.timeFrame.replace(/([A-Z])/g, " $1")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          Date & Time Range:
                        </span>
                        <div className="text-gray-600">
                          <div className="text-xs">
                            <span className="font-medium">From:</span>{" "}
                            {reportConfig.fromDate} {reportConfig.fromTime}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">To:</span>{" "}
                            {reportConfig.toDate} {reportConfig.toTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex mt-8 justify-between items-center">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                      onClick={() => setActiveStep(2)}
                    >
                      <ChevronDown size={16} />
                      Back
                    </button>

                    {/* Animated Run Report Button */}
                    <motion.button
                      className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25689f] to-[#1F557F] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                      onClick={handleRunReport}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {/* Background animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#1F557F] to-[#25689f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />

                      {/* Content */}
                      <div className="relative flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Download size={20} />
                        </motion.div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">
                            Generate Report
                          </div>
                          <div className="text-xs opacity-90">
                            Click to start processing
                          </div>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <motion.div
                        className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {/* Selection Modal */}
      <SelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSelection}
        type={reportConfig.target}
      />
    </div>
  );
};

export default ReportSetup;
