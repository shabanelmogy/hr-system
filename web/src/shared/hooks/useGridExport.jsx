// src/Utilites/CustomHooks/useGridExport.js
import { useState, useCallback } from "react";
import { exportGridToExcel } from "../../Services/exportToExcel";

const useGridExport = ({
  apiRef,
  showSnackbar,
  t,
  defaultFileName = "export",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(
    async (options = {}) => {
      const {
        selectedOnly = false,
        fileName = defaultFileName,
        sheetName = "Sheet1",
      } = options;

      if (!apiRef?.current || isExporting) return;

      try {
        setIsExporting(true);

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
