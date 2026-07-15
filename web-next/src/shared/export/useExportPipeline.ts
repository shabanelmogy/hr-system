import { saveAs } from "file-saver";
import { useCallback, useState } from "react";
import { getExportableColumns, prepareGridExport } from "./gridExportData";
import type {
  ExportFormatAdapter,
  ExportGridApiRef,
  ExportRunOptions,
} from "./types";

type UseExportPipelineOptions<TFormatOptions extends object> = {
  apiRef: ExportGridApiRef;
  adapter: ExportFormatAdapter<TFormatOptions>;
  defaultFileName: string;
  defaultCulture: string;
  defaultExcludedColumns: string[];
};

export function useExportPipeline<TFormatOptions extends object>({
  apiRef,
  adapter,
  defaultFileName,
  defaultCulture,
  defaultExcludedColumns,
}: UseExportPipelineOptions<TFormatOptions>) {
  const [isExporting, setIsExporting] = useState(false);

  const resolveColumns = useCallback(
    (excludeColumns: string[] = []) =>
      getExportableColumns(apiRef, defaultExcludedColumns, excludeColumns),
    [apiRef, defaultExcludedColumns],
  );

  const exportData = useCallback(async (
    options: ExportRunOptions & TFormatOptions,
  ) => {
    setIsExporting(true);
    try {
      const fileName = options.fileName ?? defaultFileName;
      const culture = options.culture ?? defaultCulture;
      const columns = options.includeColumns ?? resolveColumns(options.excludeColumns);
      const prepared = prepareGridExport(apiRef, columns, defaultExcludedColumns);
      if (!prepared) return false;

      const blob = await adapter.export(prepared.rows, {
        ...options,
        fileName,
        culture,
      });
      if (blob.size === 0) throw new Error("Server returned empty file");

      const extension = `.${adapter.extension}`;
      saveAs(blob, fileName.toLowerCase().endsWith(extension) ? fileName : `${fileName}${extension}`);
      return true;
    } finally {
      setIsExporting(false);
    }
  }, [adapter, apiRef, defaultCulture, defaultExcludedColumns, defaultFileName, resolveColumns]);

  return { exportData, getExportableColumns: resolveColumns, isExporting };
}
