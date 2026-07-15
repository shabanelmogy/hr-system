import { pdfExportAdapter, type PdfFormatOptions } from "@/shared/export/adapters/pdfExportAdapter";
import type { ExportGridApiRef, ExportRunOptions } from "@/shared/export/types";
import { useExportPipeline } from "@/shared/export/useExportPipeline";

type UsePdfExportOptions = {
  apiRef: ExportGridApiRef;
  defaultFileName?: string;
  defaultCulture?: string;
  reportPdfHeader?: string;
  excludeColumnsFromExport?: string[];
};

type PdfExportOptions = ExportRunOptions & Partial<PdfFormatOptions>;

export default function usePdfExport({
  apiRef,
  defaultFileName = "Export",
  defaultCulture = "en",
  reportPdfHeader = "ReportHeader",
  excludeColumnsFromExport = [],
}: UsePdfExportOptions) {
  const pipeline = useExportPipeline({
    apiRef,
    adapter: pdfExportAdapter,
    defaultFileName,
    defaultCulture,
    defaultExcludedColumns: excludeColumnsFromExport,
  });

  return {
    exportToPdf: (options: PdfExportOptions = {}) =>
      pipeline.exportData({
        ...options,
        reportHeader: options.reportHeader ?? reportPdfHeader,
      }),
    getExportableColumns: pipeline.getExportableColumns,
    isExporting: pipeline.isExporting,
  };
}
