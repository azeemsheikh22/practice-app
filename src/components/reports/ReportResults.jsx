import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  FileText,
  Users,
  Car,
  Layers,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo3 from "../../assets/LogoColor.png";

const ReportResults = ({
  reportName,
  reportCategory,
  //   reportConfig,
  reportData,
  isLoading,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100; 

  const processReportData = () => {
    if (!reportData || !reportData.data) {
      return { headers: [], rows: [], summary: null };
    }

    const { header, detail } = reportData.data;

    // Extract headers from the first detail item's reportData with dynamic widths
    const headers = [];
    if (detail && detail.length > 0 && detail[0].reportData) {
      detail[0].reportData.forEach((item) => {
        if (item.col && item.col.trim() !== "" && item.col !== " ") {
          headers.push({
            key: item.col,
            label: item.col,
          });
        }
      });
    }

    // Process each row
    const rows = [];
    if (detail) {
      detail.forEach((row, index) => {
        const processedRow = { id: row.rowID || index + 1 };

        if (row.reportData) {
          row.reportData.forEach((item) => {
            if (item.col && item.col.trim() !== "" && item.col !== " ") {
              // Clean up HTML content and skip icon columns
              let cleanData = item.data;
              if (typeof cleanData === "string" && cleanData.includes("<i class")) {
                cleanData = "Action"; // Replace HTML icons with text
              }
              processedRow[item.col] = cleanData || "-";
            }
          });
        }

        rows.push(processedRow);
      });
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

    return { headers, rows, summary };
  };

  // Get processed data with memoization
  const { headers, rows, summary } = useMemo(() => processReportData(), [reportData]);

  // Pagination calculations
  const totalPages = Math.ceil(rows.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Only show data if we have real API data
  const hasRealData = reportData && reportData.data && rows.length > 0;

  // Download CSV function
  const downloadCSV = () => {
    if (!rows.length) return;

    const csvHeaders = headers.map(h => h.label).join(",");
    const csvRows = rows.map(row => 
      headers.map(h => {
        const value = row[h.key] || "";
        // Clean and escape CSV values
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const csvContent = csvHeaders + "\n" + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName}_Report.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    if (!rows.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      rows.map(row => {
        const cleanRow = {};
        headers.forEach(h => {
          cleanRow[h.label] = row[h.key] || "";
        });
        return cleanRow;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    
    // Generate file
    XLSX.writeFile(workbook, `${reportName}_Report.xlsx`);
  };

  // Download PDF function with professional formatting
  const downloadPDF = () => {
    if (!rows.length) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add Telogix logo and header
    const addHeader = () => {
      // Add logo if possible - convert image to base64
      try {
        const img = new Image();
        img.src = logo3;
        
        // For now, use text-based header with professional styling
        doc.setFontSize(20);
        doc.setTextColor(37, 104, 159); // Telogix blue color #25689f
        doc.setFont("helvetica", "bold");
        doc.text("TELOGIX", 20, 20);
        
        // Add tagline
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("GPS Tracking Solutions", 20, 27);
      } catch (error) {
        console.log("Logo loading error:", error);
        // Fallback text header
        doc.setFontSize(18);
        doc.setTextColor(37, 104, 159);
        doc.setFont("helvetica", "bold");
        doc.text("TELOGIX REPORT", 20, 20);
      }
      
      // Report title
      doc.setFontSize(16);
      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "bold");
      doc.text(reportName, pageWidth - 20, 20, { align: 'right' });
      
      // Report details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Category: ${reportCategory}`, pageWidth - 20, 27, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 33, { align: 'right' });
      doc.text(`Total Records: ${rows.length}`, pageWidth - 20, 39, { align: 'right' });
      
      // Add professional line separator
      doc.setDrawColor(37, 104, 159);
      doc.setLineWidth(0.5);
      doc.line(20, 45, pageWidth - 20, 45);
      
      // Add lighter line below
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(20, 47, pageWidth - 20, 47);
    };

    // Footer function
    const addFooter = (pageNumber, totalPages) => {
      const footerY = pageHeight - 15;
      
      // Add footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      
      // Left footer - company info
      doc.text("© Telogix GPS Tracking System", 20, footerY);
      
      // Center footer - page info
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
      
      // Right footer - generation time
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, footerY, { align: 'right' });
    };

    // Prepare table data with better formatting
    const tableHeaders = headers.map(h => h.label);
    const tableData = rows.map(row => 
      headers.map(h => {
        let value = row[h.key] || "-";
        // Clean up HTML and format data
        if (typeof value === "string") {
          value = value.replace(/<[^>]*>/g, ''); // Remove HTML tags
          value = value.replace(/&nbsp;/g, ' '); // Replace HTML spaces
          
          // Format specific data types
          if (h.key === "Distance" && value !== "-") {
            value = value + (value.includes('km') ? '' : ' km');
          } else if (h.key === "Max Speed" && value !== "-" && !value.includes('km/h')) {
            value = value + (value === "0" || value === "-" ? '' : ' km/h');
          }
          
          // Limit length for PDF table
          if (value.length > 35) {
            value = value.substring(0, 32) + "...";
          }
        }
        return String(value);
      })
    );

    // Calculate rows per page based on content
    const rowsPerPage = 18;
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    
    // Generate pages
    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) doc.addPage('l', 'a4'); // Landscape orientation
      
      addHeader();
      
      const startRow = (page - 1) * rowsPerPage;
      const endRow = Math.min(startRow + rowsPerPage, rows.length);
      const pageData = tableData.slice(startRow, endRow);
      
      // Add summary section on first page
      if (page === 1 && summary && Object.keys(summary).length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(37, 104, 159);
        doc.setFont("helvetica", "bold");
        doc.text("Report Summary", 20, 55);
        
        let summaryY = 62;
        Object.entries(summary).forEach(([key, value], index) => {
          if (index < 4) { // Show max 4 summary items
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");
            doc.text(`${key}: ${value || 'N/A'}`, 20 + (index * 70), summaryY);
          }
        });
        
        // Adjust table start position
        var tableStartY = 75;
      } else {
        var tableStartY = 55;
      }
      
      // Add data table
      autoTable(doc, {
        head: [tableHeaders],
        body: pageData,
        startY: tableStartY,
        margin: { left: 20, right: 20, bottom: 25 },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left',
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [37, 104, 159], // Telogix blue
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'left' },   // Car
          1: { cellWidth: 25, halign: 'left' },   // Driver
          2: { cellWidth: 20, halign: 'center' }, // Distance
          3: { cellWidth: 20, halign: 'center' }, // Speed
          // Auto-width for remaining columns
        },
        didDrawCell: function(data) {
          // Add special formatting for specific columns
          if (data.section === 'body') {
            if (data.column.index === 0) { // Car column
              doc.setTextColor(34, 139, 34); // Green for cars
            } else if (data.column.index === 1) { // Driver column  
              doc.setTextColor(138, 43, 226); // Violet for drivers
            } else if (data.column.index === 2) { // Distance column
              doc.setTextColor(30, 144, 255); // Blue for distance
            } else if (data.column.index === 3) { // Speed column
              doc.setTextColor(255, 140, 0); // Orange for speed
            }
          }
        }
      });
      
      addFooter(page, totalPages);
    }

    // Save the PDF with timestamp
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    doc.save(`${reportName}_Report_${timestamp}.pdf`);
  };

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
                onClick={downloadExcel}
                disabled={!hasRealData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                <span>Excel</span>
              </button>
              <button 
                onClick={downloadCSV}
                disabled={!hasRealData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                <span>CSV</span>
              </button>
              <button 
                onClick={downloadPDF}
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
                    <span>Showing {paginatedRows.length} of {rows.length} records</span>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-auto max-h-[calc(100vh-350px)]">
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
                    {paginatedRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                                <span>{row[header.key] || "No Driver"}</span>
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
                                  className="text-gray-700 truncate block"
                                  title={row[header.key]}
                                >
                                  {row[header.key]}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} ({rows.length} total records)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-2 text-sm rounded-lg cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-[#25689f] text-white"
                                  : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Footer Summary - Fixed at Bottom */}
              {summary && Object.keys(summary).length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 sticky bottom-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
                    {Object.entries(summary).map(([key, value], index) => (
                      <div key={index} className="text-center">
                        <span className="font-medium">{key}:</span>
                        <br />
                        <strong
                          className={`${
                            key.includes("Distance")
                              ? "text-blue-600"
                              : key.includes("Time")
                              ? "text-purple-600"
                              : "text-green-600"
                          }`}
                        >
                          {value || "N/A"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportResults;
