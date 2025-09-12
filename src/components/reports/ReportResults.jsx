import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Car,
  CheckCircle,
} from "lucide-react";
import {
  downloadCSV,
  downloadExcel,
  downloadPDF,
} from "../../utils/exportUtils";

const ReportResults = ({
  reportName,
  reportCategory,
  reportData,
  isLoading,
  onBack,
  onEdit,
}) => {
  const processReportData = () => {
    if (!reportData || !reportData.data) {
      return { headers: [], rows: [], summary: null, vehicleGroups: [] };
    }
    const { header, detail } = reportData.data;
    const headers = [];
    const excludedColumns = [
      "Fuel %",
      "Fuel",
      "FixedHeader",
      "Play",
      "CarID",
      "LatLong3",
      "LatLong4",
      "Driver Name",
    ];
    if (detail && detail.length > 0 && detail[0].reportData) {
      detail[0].reportData.forEach((item) => {
        if (
          item.col &&
          item.col.trim() !== "" &&
          item.col !== " " &&
          !excludedColumns.includes(item.col)
        ) {
          headers.push({
            key: item.col,
            label: item.col,
          });
        }
      });
    }

    // Process each row and group by vehicle
    const rows = [];
    const vehicleGroups = [];
    let currentVehicle = null;
    let currentGroupStartIndex = 0;

    if (detail) {
      detail.forEach((row, index) => {
        const processedRow = { id: row.rowID || index + 1 };

        if (row.reportData) {
          row.reportData.forEach((item) => {
            if (item.col && item.col.trim() !== "" && item.col !== " ") {
              // Clean up HTML content and skip icon columns
              let cleanData = item.data;
              if (
                typeof cleanData === "string" &&
                cleanData.includes("<i class")
              ) {
                cleanData = "Action"; // Replace HTML icons with text
              }
              processedRow[item.col] = cleanData || "-";
            }
          });
        }

        // Check for vehicle change
        const vehicleName =
          processedRow.Car || processedRow.Vehicle || "Unknown Vehicle";
        const driverName = processedRow.Driver || "";
        const clientName = processedRow.ClientName || "";

        if (currentVehicle !== vehicleName) {
          // If this is not the first vehicle, save the previous group
          if (currentVehicle !== null) {
            vehicleGroups.push({
              vehicle: currentVehicle,
              startIndex: currentGroupStartIndex,
              endIndex: rows.length - 1,
              rowCount: rows.length - currentGroupStartIndex,
            });
          }

          // Start new group
          currentVehicle = vehicleName;
          currentGroupStartIndex = rows.length;

          // Add vehicle group info
          vehicleGroups.push({
            vehicle: vehicleName,
            driver: driverName,
            client: clientName,
            startIndex: currentGroupStartIndex,
            isNewGroup: true,
          });
        }

        rows.push(processedRow);
      });

      // Add the last group
      if (currentVehicle !== null && vehicleGroups.length > 0) {
        const lastGroup = vehicleGroups[vehicleGroups.length - 1];
        lastGroup.endIndex = rows.length - 1;
        lastGroup.rowCount = rows.length - lastGroup.startIndex;
      }
    }

    // Calculate summary from header data if available
    let summary = null;
    if (header && header.length > 0) {
      summary = header.reduce((acc, item) => {
        if (item.col && item.data) {
          acc[item.col] = item.data;
        }
        return acc;
      }, {});
    }

    return { headers, rows, summary, vehicleGroups };
  };

  const { headers, rows, summary, vehicleGroups } = useMemo(
    () => processReportData(),
    [reportData]
  );
  const hasRealData = reportData && reportData.data && rows.length > 0;

  // console.log(reportData?.data);

  // Handle export functions
  const handleDownloadCSV = () => downloadCSV(rows, headers, reportName);
  const handleDownloadExcel = () => downloadExcel(rows, headers, reportName);
  const handleDownloadPDF = () =>
    downloadPDF(rows, headers, reportName, reportCategory, summary);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 text-[#25689f] hover:text-[#1F557F] transition-colors cursor-pointer text-sm sm:text-base"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                <span className="font-medium hidden sm:inline">Back to Setup</span>
                <span className="font-medium sm:hidden">Back</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {reportName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Category: {reportCategory}
                </p>
              </div>
            </div>

            {/* Action Buttons - Mobile: Stacked, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-[#25689f] hover:text-[#1F557F] border border-[#25689f] hover:border-[#1F557F] rounded-lg transition-colors cursor-pointer text-sm sm:text-base"
              >
                <span>Edit</span>
              </button>
              
              {/* Export buttons - Hidden on mobile, shown on larger screens */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleDownloadExcel}
                  disabled={!hasRealData}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  disabled={!hasRealData}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!hasRealData}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#25689f] text-white hover:bg-[#1F557F] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  <span>PDF</span>
                </button>
              </div>
              
              {/* Mobile: Single export dropdown */}
              <div className="sm:hidden relative">
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'excel') handleDownloadExcel();
                    else if (value === 'csv') handleDownloadCSV();
                    else if (value === 'pdf') handleDownloadPDF();
                    e.target.value = '';
                  }}
                  disabled={!hasRealData}
                  className="w-full px-3 py-2 bg-[#25689f] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm appearance-none cursor-pointer"
                >
                  <option value="">Export Options</option>
                  <option value="excel">Download Excel</option>
                  <option value="csv">Download CSV</option>
                  <option value="pdf">Download PDF</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content - Full Width */}
      <div className="w-full p-2 sm:p-4">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-[#25689f] mb-4"></div>
              <p className="text-gray-600 mb-2 text-sm sm:text-base text-center">Generating your report...</p>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                This may take a few moments
              </p>
            </div>
          ) : !hasRealData ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <FileText size={32} className="sm:w-12 sm:h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2 text-sm sm:text-base text-center">No report data available</p>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Please generate a report to view data
              </p>
            </div>
          ) : (
            <>
              {/* Table Header - Fixed */}
              <div className="bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    Report Data
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle size={12} className="sm:w-3 sm:h-3 text-green-600" />
                      <span>Showing {rows.length} records</span>
                    </div>
                    {vehicleGroups.length > 0 && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <Car size={12} className="sm:w-3 sm:h-3 text-blue-600" />
                        <span>
                          {
                            vehicleGroups.filter((group) => group.isNewGroup)
                              .length
                          }{" "}
                          vehicles
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              {reportData?.data?.header && (
                <div className="px-3 sm:px-6 py-2 bg-white border-b border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                    {reportData.data.header.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-center p-1 sm:p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-600 text-[10px] sm:text-xs text-center mb-1">
                          {item.col}
                        </span>
                        <span className="font-bold text-[#25689f] text-xs sm:text-sm">
                          {item.data !== null ? item.data : "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Container - Mobile: Horizontal scroll, Desktop: Fixed height */}
              <div className="overflow-auto max-h-[300px] sm:max-h-[450px]">
                <table className="w-full divide-y divide-gray-200 min-w-[600px]">
                  <thead className="bg-gray-50 sticky top-0 z-5">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-2 sm:px-3 py-1 sm:py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, index) => {
                      // Check if this row starts a new vehicle group
                      const vehicleGroup = vehicleGroups.find(
                        (group) =>
                          group.startIndex === index && group.isNewGroup
                      );

                      return (
                        <React.Fragment key={row.id}>
                          {/* Vehicle Separator Header */}
                          {vehicleGroup && (
                            <tr className="bg-gradient-to-r from-[#25689f] to-[#1F557F]">
                              <td
                                colSpan={headers.length}
                                className="px-2 sm:px-3 py-1 sm:py-2"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <span className="text-white font-bold text-xs sm:text-sm">
                                      {vehicleGroup.vehicle}
                                    </span>
                                    {vehicleGroup.driver && (
                                      <span className="text-white/90 text-[10px] sm:text-xs">
                                        {vehicleGroup.driver}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-white/80 text-[10px] sm:text-xs">
                                    {vehicleGroup.client}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Regular Data Row */}
                          <tr
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            {headers.map((header, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs text-gray-900"
                              >
                                {header.key === "Car" && row[header.key] ? (
                                  <span className="font-medium">{row[header.key]}</span>
                                ) : header.key === "Driver" ? (
                                  <span>{row[header.key] || "No Driver"}</span>
                                ) : header.key === "Distance" ? (
                                  <span className="font-medium text-blue-600 whitespace-nowrap">
                                    {row[header.key]}{" "}
                                    {row[header.key] !== "-" &&
                                    row[header.key] !== "0.00"
                                      ? "km"
                                      : ""}
                                  </span>
                                ) : header.key === "Max Speed" ? (
                                  <span className="font-medium text-orange-600 whitespace-nowrap">
                                    {row[header.key]}{" "}
                                    {row[header.key] !== "-" &&
                                    row[header.key] !== "0"
                                      ? "km/h"
                                      : ""}
                                  </span>
                                ) : header.key === "Travel Time" ||
                                  header.key === "Idle Duration" ||
                                  header.key === "Standing Time" ? (
                                  <span className="font-medium text-purple-600 whitespace-nowrap">
                                    {row[header.key]}
                                  </span>
                                ) : header.key.includes("Time") &&
                                  row[header.key] !== "-" ? (
                                  <span className="text-gray-700 whitespace-nowrap">
                                    {row[header.key]}
                                  </span>
                                ) : header.key.includes("Location") ? (
                                  <div className="max-w-xs">
                                    <span
                                      className="text-gray-700 block whitespace-nowrap"
                                      title={row[header.key]}
                                    >
                                      {row[header.key].length > 30
                                        ? row[header.key].substring(0, 30) +
                                          "..."
                                        : row[header.key]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="whitespace-nowrap">
                                    {row[header.key]}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportResults;
