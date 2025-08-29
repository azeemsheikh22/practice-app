import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
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

  // Sample data for vehicle, driver and group selection
  const mockItems = {
    vehicle: [
      { id: 1, name: "3569874" },
      { id: 2, name: "C-3044 20KL" },
      { id: 3, name: "C-3059 48KL" },
      { id: 4, name: "E-2932" },
      { id: 5, name: "E-3632 21KL" },
      { id: 6, name: "E-3937" },
      { id: 7, name: "GLTAA-611 (Spot)" },
      { id: 8, name: "GLTAA-711 (Spot)" },
    ],
    driver: [
      { id: 1, name: "Hashmat Afridi RASCH PVT LTD" },
      { id: 2, name: "Muhammad Hanif P-1196 RASCH PVT LTD" },
      { id: 3, name: "Reeban Khan" },
      { id: 4, name: "Amjad-2 RASCH PVT LTD" },
      { id: 5, name: "Fida Ullah RASCH PVT LTD" },
      { id: 6, name: "Sher Baz" },
      { id: 7, name: "OWAIS KHAN" },
      { id: 8, name: "OWAIS KHAN RASCH PVT LTD" },
    ],
    group: [
      { id: 1, name: "[Ungrouped]" },
      { id: 2, name: "Al Razzaq Filling Station (TPPL)" },
      { id: 3, name: "Awais Shakeel" },
      { id: 4, name: "Cararaj River View Filling Station (TPPL)" },
      { id: 5, name: "Carvan Carriage Co. (TPPL)" },
      { id: 6, name: "Fairways OCC (TPPL)" },
      { id: 7, name: "Gillani Filling Station" },
      { id: 8, name: "Gillani Filling Station (TPPL)" },
    ],
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
    // Here you would normally validate that all required selections are made
    onRun(reportConfig);
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
              className={`flex items-center gap-2 pb-2 px-1 cursor-pointer ${
                activeStep === 2
                  ? "text-[#25689f] border-b-2 border-[#25689f]"
                  : "text-gray-500 hover:text-[#25689f]"
              }`}
              onClick={() => setActiveStep(2)}
            >
              <div className="w-6 h-6 rounded-full bg-[#25689f] text-white flex items-center justify-center text-sm">
                2
              </div>
              <span className="font-medium">Time Frame</span>
            </button>

            <ChevronRight className="text-gray-400" size={20} />

            <button
              className={`flex items-center gap-2 pb-2 px-1 cursor-pointer ${
                activeStep === 3
                  ? "text-[#25689f] border-b-2 border-[#25689f]"
                  : "text-gray-500 hover:text-[#25689f]"
              }`}
              onClick={() => setActiveStep(3)}
            >
              <div className="w-6 h-6 rounded-full bg-[#25689f] text-white flex items-center justify-center text-sm">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h3.5a.5.5 0 00.5-.5V12h1a1 1 0 001-1V7a1 1 0 00-.74-.95l-1.83-.55A1 1 0 0013.5 5h-9a1 1 0 00-.9.55L2.05 8H2a1 1 0 00-1 1v1a1 1 0 001 1h1v2a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0z" />
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-[#25689f]">3</span>
                  Report Options
                </h3>

                <div className="space-y-6 ml-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Filter size={16} className="text-[#25689f]" />
                      Advanced Options
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox text-[#25689f] rounded h-4 w-4 cursor-pointer"
                          />
                          <span className="text-sm">
                            Include Geofence Information
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox text-[#25689f] rounded h-4 w-4 cursor-pointer"
                          />
                          <span className="text-sm">
                            Include Address Information
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox text-[#25689f] rounded h-4 w-4 cursor-pointer"
                          />
                          <span className="text-sm">Group by Day</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Download size={16} className="text-[#25689f]" />
                      Export Options
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Format
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#25689f] focus:border-[#25689f] outline-none cursor-pointer">
                          <option value="csv">
                            CSV (Comma Separated Values)
                          </option>
                          <option value="pdf">PDF Document</option>
                          <option value="excel">Excel Spreadsheet</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox text-[#25689f] rounded h-4 w-4 cursor-pointer"
                          />
                          <span className="text-sm">
                            Send as Email Attachment
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex mt-6 justify-between">
                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                      onClick={() => setActiveStep(2)}
                    >
                      <ChevronDown size={16} /> Back
                    </button>

                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-[#25689f] text-white rounded-md hover:bg-[#1F557F] transition-colors cursor-pointer"
                      onClick={handleRunReport}
                    >
                      <Download size={16} /> Run Report
                    </button>
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
        items={mockItems[reportConfig.target] || []}
      />
    </div>
  );
};

export default ReportSetup;
