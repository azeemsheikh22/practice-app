import {useMemo } from "react";
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
  CheckCircle,
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
  const processReportData = () => {
    if (!reportData || !reportData.data) {
      return { headers: [], rows: [], summary: null };
    }

    const { header, detail } = reportData.data;

    // Extract headers from the first detail item's reportData with dynamic widths
    const headers = [];
    const excludedColumns = ['Fuel %', 'Fuel', 'FixedHeader', 'Play', 'CarID'];
    if (detail && detail.length > 0 && detail[0].reportData) {
      detail[0].reportData.forEach((item) => {
        if (item.col && 
            item.col.trim() !== "" && 
            item.col !== " " && 
            !excludedColumns.includes(item.col)) {
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

  // Only show data if we have real API data
  const hasRealData = reportData && reportData.data && rows.length > 0;


  console.log(reportData?.data)

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

    // Header drawing function (called on each page)
    const drawHeader = (docInstance) => {
      // Logo/text header
      try {
        docInstance.setFontSize(18);
        docInstance.setTextColor(37, 104, 159);
        docInstance.setFont('helvetica', 'bold');
        docInstance.text('TELOGIX', 20, 18);

        docInstance.setFontSize(9);
        docInstance.setTextColor(100, 100, 100);
        docInstance.setFont('helvetica', 'normal');
        docInstance.text('GPS Tracking Solutions', 20, 24);
      } catch (e) {
        // ignore
      }

      // Right side details
      docInstance.setFontSize(11);
      docInstance.setTextColor(51, 51, 51);
      docInstance.setFont('helvetica', 'bold');
      docInstance.text(reportName, pageWidth - 20, 18, { align: 'right' });

      docInstance.setFontSize(8);
      docInstance.setTextColor(100, 100, 100);
      docInstance.setFont('helvetica', 'normal');
      docInstance.text(`Category: ${reportCategory}`, pageWidth - 20, 24, { align: 'right' });
      docInstance.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 30, { align: 'right' });
      docInstance.text(`Total Records: ${rows.length}`, pageWidth - 20, 36, { align: 'right' });

      // Separator line
      docInstance.setDrawColor(37, 104, 159);
      docInstance.setLineWidth(0.5);
      docInstance.line(20, 40, pageWidth - 20, 40);
    };

    // Footer drawing function (called on each page)
    const drawFooter = (docInstance, pageNumber, pageCount) => {
      const footerY = pageHeight - 12;
      docInstance.setDrawColor(220, 220, 220);
      docInstance.setLineWidth(0.2);
      docInstance.line(20, footerY - 6, pageWidth - 20, footerY - 6);

      docInstance.setFontSize(8);
      docInstance.setTextColor(100, 100, 100);
      docInstance.setFont('helvetica', 'normal');
      docInstance.text('© Telogix GPS Tracking System', 20, footerY);
      docInstance.text(`Page ${pageNumber} of ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
      docInstance.text(new Date().toLocaleDateString(), pageWidth - 20, footerY, { align: 'right' });
    };

    // Prepare table data
    const tableHeaders = headers.map(h => h.label);
    const tableData = rows.map(row => 
      headers.map(h => {
        let value = row[h.key] || "-";
        if (typeof value === 'string') {
          value = value.replace(/<[^>]*>/g, '');
          value = value.replace(/&nbsp;/g, ' ');

          if (h.key === 'Distance' && value !== '-') {
            value = value + (value.includes('km') ? '' : ' km');
          } else if (h.key === 'Max Speed' && value !== '-' && !value.includes('km/h')) {
            value = value + (value === '0' || value === '-' ? '' : ' km/h');
          }

          if (value.length > 80) value = value.substring(0, 77) + '...';
        }
        return String(value);
      })
    );

    // If header summary exists (reportData.data.header), render it above table on first page
    let startY = 48; // default table start after header
    if (summary && Object.keys(summary).length > 0) {
      // Render a compact summary block at the top
      doc.setFontSize(11);
      doc.setTextColor(37, 104, 159);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Summary', 20, 46);

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');

      const entries = Object.entries(summary);
      entries.forEach(([key, value], i) => {
        const x = 20 + (i % 3) * 70;
        const y = 52 + Math.floor(i / 3) * 10;
        const textValue = value === '0' ? 'N/A' : value;
        let suffix = '';
        if (key.toLowerCase().includes('speed')) suffix = ' km/h';
        if (key.toLowerCase().includes('km') || key.toLowerCase().includes('distance')) suffix = ' km';

        doc.text(`${key}: ${textValue}${textValue !== 'N/A' ? suffix : ''}`, x, y);
      });

      // leave space for summary
      startY = 72;
    }

    // Use autoTable to render the table and let it manage pagination automatically
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY,
      margin: { left: 20, right: 20, bottom: 30 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        textColor: [51, 51, 51],
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [37, 104, 159],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' },
        1: { cellWidth: 40, halign: 'left' }
      },
      didDrawPage: function (data) {
        // Show full header only on first page; footer on every page
        if (data.pageNumber === 1) {
          drawHeader(doc);
        }
        drawFooter(doc, data.pageNumber, data.pageCount);
      }
    });

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
                    <span>Showing {rows.length} records</span>
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
                    {rows.map((row, index) => (
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
                                  className="text-gray-700 block"
                                  title={row[header.key]}
                                >
                                  {row[header.key].length > 30 
                                    ? row[header.key].substring(0, 30) + "..."
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
                    ))}
                  </tbody>
                </table>
              </div>

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
