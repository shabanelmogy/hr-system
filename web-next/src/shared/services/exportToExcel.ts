// src/Utilites/excelExportUtils.js
import * as XLSX from "xlsx";

type GridRow = Record<string, unknown>;
type GridColumn = { field: string; headerName?: string; type?: string };
type GridApi = {
  getSelectedRows: () => Map<unknown, GridRow>;
  getRow: (id: unknown) => GridRow | null;
  getRowModels: () => Map<unknown, GridRow>;
  getAllColumns: () => GridColumn[];
};
export type GridApiRef = { current?: GridApi | null };
type ExportOptions = {
  selectedOnly?: boolean;
  fileName?: string;
  sheetName?: string;
  excludeFields?: readonly string[];
};

export const exportGridToExcel = (apiRef: GridApiRef, options: ExportOptions = {}) => {
  const {
    selectedOnly = false,
    fileName = "export",
    sheetName = "Sheet1",
    excludeFields = ["actions"],
  } = options;

  if (!apiRef?.current) return false;

  try {
    const api = apiRef.current;
    if (!api) return false;
    // Get rows based on selection mode
    let rows: GridRow[];
    if (selectedOnly) {
      const selectedRowIds = api.getSelectedRows();
      if (selectedRowIds.size === 0) return false;

      rows = Array.from(selectedRowIds.keys())
        .map((id) => api.getRow(id))
      .filter((row): row is GridRow => row !== null);
    } else {
      rows = Array.from(api.getRowModels().values());
    }

    if (!rows.length) return false;

    // Get columns for proper field mapping
    const columns = api
      .getAllColumns()
      .filter(
        (col) =>
          !excludeFields.includes(col.field) && !col.field.startsWith("__")
      );

    // Clean data (remove action buttons, etc.)
    const cleanedRows = rows.map((row) => {
      const newRow: GridRow = {};
      columns.forEach((column) => {
        // Use headerName as keys for better readability in Excel
        const key = column.headerName || column.field;
        let value = row[column.field];

        // Format date values if needed
        if (column.type === "date" && value) {
          try {
            if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
              value = new Date(value).toLocaleDateString();
            }
          } catch {
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
    const colWidths: Record<string, number> = {};
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
