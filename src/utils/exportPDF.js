import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/LogoColor.png";

export function exportPoliciesToPDF(data) {
  if (!Array.isArray(data) || data.length === 0) return;
  const doc = new jsPDF({ orientation: "landscape" });

  // Add logo with aspect ratio preserved
  const img = new Image();
  img.src = logo;
  img.onload = function () {
    // Maintain aspect ratio, max height 18, max width 40
    let maxW = 40, maxH = 18;
    let w = img.naturalWidth, h = img.naturalHeight;
    let ratio = Math.min(maxW / w, maxH / h);
    let drawW = w * ratio;
    let drawH = h * ratio;
    doc.addImage(img, "PNG", 10, 8, drawW, drawH);
    doc.setFontSize(18);
    doc.text("Policy Management Report", 55, 20);
    addTableAndSave();
  };
  img.onerror = function () {
    doc.setFontSize(18);
    doc.text("Policy Management Report", 55, 20);
    addTableAndSave();
  };

  function addTableAndSave() {
    autoTable(doc, {
      startY: 30,
      head: [["Policy Name", "Alert Type", "Status", "Last Triggered"]],
      body: data.map(row => [
        row.policyName || "",
        row.alertName || "",
        row.STATUS || "",
        row.lastTrigered || ""
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableLineColor: [41, 128, 185],
      tableLineWidth: 0.1,
      margin: { left: 10, right: 10 },
    });
    doc.save("policies.pdf");
  }
}
