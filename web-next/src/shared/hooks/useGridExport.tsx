// src/Utilites/CustomHooks/useGridExport.js
import { useState, useCallback } from "react";
import type { GridApiRef } from "../services/exportToExcel";

type ExportOptions = {
  selectedOnly?: boolean;
  fileName?: string;
  sheetName?: string;
};
type GridExportOptions = {
  apiRef: GridApiRef;
  showSnackbar?: (severity: string, messages: string[], title: string) => void;
  t: (key: string, fallback?: string) => string;
  defaultFileName?: string;
};

const useGridExport = ({
  apiRef,
  showSnackbar,
  t,
  defaultFileName = "export",
}: GridExportOptions) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(
    async (options: ExportOptions = {}) => {
      const {
        selectedOnly = false,
        fileName = defaultFileName,
        sheetName = "Sheet1",
      } = options;

      if (!apiRef?.current || isExporting) return;

      try {
        setIsExporting(true);

        const { exportGridToExcel } = await import("../services/exportToExcel");
        const success = exportGridToExcel(apiRef, {
          selectedOnly,
          fileName: selectedOnly ? `${fileName}_selected` : fileName,
          sheetName,
        });

        if (success) {
          showSnackbar?.(
            "success",
            [t("exportSuccess", "Export successful")],
            t("success", "Success")
          );
        } else if (selectedOnly) {
          showSnackbar?.(
            "warning",
            [t("noRowsSelected", "No rows selected")],
            t("warning", "Warning")
          );
        } else {
          showSnackbar?.(
            "warning",
            [t("noDataToExport", "No data to export")],
            t("warning", "Warning")
          );
        }
      } catch (error) {
        console.error("Export error:", error);
        showSnackbar?.(
          "error",
          [t("exportFailed", "Export failed")],
          t("error", "Error")
        );
      } finally {
        setIsExporting(false);
      }
    },
    [apiRef, defaultFileName, isExporting, showSnackbar, t]
  );

  return {
    exportToExcel,
    isExporting,
  };
};

export default useGridExport;
