// src/Utilites/excelExportUtils.js
import * as XLSX from "xlsx";

export const exportGridToExcel = (apiRef, options = {}) => {
  const {
    selectedOnly = false,
    fileName = "export",
    sheetName = "Sheet1",
    excludeFields = ["actions"],
  } = options;

  if (!apiRef?.current) return false;

  try {
    // Get rows based on selection mode
    let rows;
    if (selectedOnly) {
      const selectedRowIds = apiRef.current.getSelectedRows();
      if (selectedRowIds.size === 0) return false;

      rows = Array.from(selectedRowIds.keys())
        .map((id) => apiRef.current.getRow(id))
        .filter(Boolean);
    } else {
      rows = Array.from(apiRef.current.getRowModels().values());
    }

    if (!rows.length) return false;

    // Get columns for proper field mapping
    const columns = apiRef.current
      .getAllColumns()
      .filter(
        (col) =>
          !excludeFields.includes(col.field) && !col.field.startsWith("__")
      );

    // Clean data (remove action buttons, etc.)
    const cleanedRows = rows.map((row) => {
      const newRow = {};
      columns.forEach((column) => {
        // Use headerName as keys for better readability in Excel
        const key = column.headerName || column.field;
        let value = row[column.field];

        // Format date values if needed
        if (column.type === "date" && value) {
          try {
            value = new Date(value).toLocaleDateString();
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }

        newRow[key] = value;
      });
      return newRow;
    });

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(cleanedRows);

    // Add some basic styling - auto width columns
    const colWidths = {};
    cleanedRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const value = row[key] ? String(row[key]) : "";
        colWidths[key] = Math.max(colWidths[key] || 0, value.length);
      });
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate file and download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    return false;
  }
};
