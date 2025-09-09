import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Users,
  Car,
  CheckCircle,
} from "lucide-react";
// import logo3 from "../../assets/LogoColor.png";
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
    <div className="h-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#25689f] hover:text-[#1F557F] transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Setup</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {reportName}
                </h1>
                <p className="text-sm text-gray-600">
                  Category: {reportCategory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-[#25689f] hover:text-[#1F557F] border border-[#25689f] hover:border-[#1F557F] rounded-lg transition-colors cursor-pointer"
              >
                <span>Edit</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={!hasRealData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                <span>Excel</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={!hasRealData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!hasRealData}
                className="flex items-center gap-2 px-4 py-2 bg-[#25689f] text-white hover:bg-[#1F557F] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full p-4">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25689f] mb-4"></div>
              <p className="text-gray-600 mb-2">Generating your report...</p>
              <p className="text-sm text-gray-500">
                This may take a few moments
              </p>
            </div>
          ) : !hasRealData ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No report data available</p>
              <p className="text-sm text-gray-500">
                Please generate a report to view data
              </p>
            </div>
          ) : (
            <>
              {/* Table Header - Fixed */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Report Data
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Showing {rows.length} records</span>
                    {vehicleGroups.length > 0 && (
                      <>
                        <span className="text-gray-400">•</span>
                        <Car size={16} className="text-blue-600" />
                        <span>
                          {
                            vehicleGroups.filter((group) => group.isNewGroup)
                              .length
                          }{" "}
                          vehicles
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              {reportData?.data?.header && (
                <div className="px-6 py-3 bg-white border-b border-gray-200">
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-auto`}
                  >
                    {reportData.data.header.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center justify-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-600 mb-1 sm:mb-0">
                          {item.col}
                        </span>
                        <span className="ml-2 font-bold text-[#25689f]">
                          {item.data !== null ? item.data : "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-5">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                                className="px-4 py-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <Car size={20} className="text-white" />
                                      <span className="text-white font-bold text-base">
                                        {vehicleGroup.vehicle}
                                      </span>
                                    </div>
                                    {vehicleGroup.driver && (
                                      <div className="flex items-center gap-2">
                                        <Users
                                          size={16}
                                          className="text-white/80"
                                        />
                                        <span className="text-white/90 text-sm">
                                          {vehicleGroup.driver}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-white/80 text-sm">
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
                                className="px-4 py-3 text-sm text-gray-900"
                              >
                                {header.key === "Car" && row[header.key] ? (
                                  <div className="flex items-center whitespace-nowrap">
                                    <Car
                                      size={16}
                                      className="text-green-600 mr-2 flex-shrink-0"
                                    />
                                    <span className="font-medium">
                                      {row[header.key]}
                                    </span>
                                  </div>
                                ) : header.key === "Driver" ? (
                                  <div className="flex items-center whitespace-nowrap">
                                    <Users
                                      size={16}
                                      className="text-violet-600 mr-2 flex-shrink-0"
                                    />
                                    <span>
                                      {row[header.key] || "No Driver"}
                                    </span>
                                  </div>
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
