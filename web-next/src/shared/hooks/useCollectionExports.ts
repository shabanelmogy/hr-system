import { useCollectionExportApi } from "@/shared/export/useCollectionExportApi";
import type { ExportMenuOption } from "@/shared/export/types";
import { extractErrorMessageSilent } from "@/shared/utils/errorUtils";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import usePdfExport from "./usePdfExport";
import useServerExport from "./useServerExport";
import useSnackbar from "./useSnackbar";

type UseCollectionExportsOptions<T extends object> = {
  rows: readonly T[];
  columns: readonly string[];
  fileName: string;
  culture: string;
  reportHeader?: string;
  disabled?: boolean;
};

export function useCollectionExports<T extends object>({
  rows,
  columns,
  fileName,
  culture,
  reportHeader = fileName,
  disabled = false,
}: UseCollectionExportsOptions<T>) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const apiRef = useCollectionExportApi(rows, columns);
  const excel = useServerExport({
    apiRef,
    defaultFileName: fileName,
    defaultCulture: culture,
  });
  const pdf = usePdfExport({
    apiRef,
    defaultFileName: fileName,
    defaultCulture: culture,
    reportPdfHeader: reportHeader,
  });

  const runExport = useCallback(
    async (exporter: () => Promise<boolean>) => {
      try {
        const exported = await exporter();
        if (!exported) {
          showSnackbar("warning", t("pagination.noData") || "No data available");
        }
      } catch (error) {
        showSnackbar(
          "error",
          extractErrorMessageSilent(error),
          t("messages.error") || "Export failed",
        );
      }
    },
    [showSnackbar, t],
  );

  const exportToExcel = useCallback(
    () => runExport(() => excel.exportToExcel({})),
    [excel, runExport],
  );
  const exportToPdf = useCallback(
    () => runExport(() => pdf.exportToPdf({})),
    [pdf, runExport],
  );
  const isExporting = excel.isExporting || pdf.isExporting;
  const exportOptions = useMemo<ExportMenuOption[]>(
    () => [
      {
        id: "excel",
        format: "excel",
        label: t("actions.exportExcel") || "Export to Excel",
        onSelect: exportToExcel,
        loading: excel.isExporting,
        disabled: disabled || isExporting,
      },
      {
        id: "pdf",
        format: "pdf",
        label: t("actions.exportPdf") || "Export to PDF",
        onSelect: exportToPdf,
        loading: pdf.isExporting,
        disabled: disabled || isExporting,
      },
    ],
    [disabled, excel.isExporting, exportToExcel, exportToPdf, isExporting, pdf.isExporting, t],
  );

  return {
    exportToExcel,
    exportToPdf,
    exportOptions,
    isExcelExporting: excel.isExporting,
    isPdfExporting: pdf.isExporting,
    isExporting,
  };
}
