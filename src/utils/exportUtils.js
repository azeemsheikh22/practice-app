import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Download CSV function
export const downloadCSV = (rows, headers, reportName) => {
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
export const downloadExcel = (rows, headers, reportName) => {
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
export const downloadPDF = (rows, headers, reportName, reportCategory, summary) => {
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
