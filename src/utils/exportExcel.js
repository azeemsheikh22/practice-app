import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export function exportPoliciesToExcel(data) {
  if (!Array.isArray(data) || data.length === 0) return;
  const wsData = [
    ["Policy Name", "Alert Type", "Status", "Last Triggered"],
    ...data.map(row => [
      row.policyName || "",
      row.alertName || "",
      row.STATUS || "",
      row.lastTrigered || ""
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Policies");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "policies.xlsx");
}
