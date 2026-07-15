import { excelExportAdapter } from "@/shared/export/adapters/excelExportAdapter";
import type { ExportGridApiRef, ExportRunOptions } from "@/shared/export/types";
import { useExportPipeline } from "@/shared/export/useExportPipeline";

type UseServerExportOptions = {
  apiRef: ExportGridApiRef;
  defaultFileName?: string;
  defaultCulture?: string;
  excludeColumnsFromExport?: string[];
};

export default function useServerExport({
  apiRef,
  defaultFileName = "Export",
  defaultCulture = "en",
  excludeColumnsFromExport = [],
}: UseServerExportOptions) {
  const pipeline = useExportPipeline({
    apiRef,
    adapter: excelExportAdapter,
    defaultFileName,
    defaultCulture,
    defaultExcludedColumns: excludeColumnsFromExport,
  });

  return {
    exportToExcel: (options: ExportRunOptions = {}) => pipeline.exportData(options),
    getExportableColumns: pipeline.getExportableColumns,
    isExporting: pipeline.isExporting,
  };
}
