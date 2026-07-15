import { apiRoutes } from "@/config";
import apiService from "@/lib/api/client";
import type { ExportFormatAdapter } from "../types";

export type ExcelFormatOptions = object;

export const excelExportAdapter: ExportFormatAdapter<ExcelFormatOptions> = {
  extension: "xlsx",
  export: (rows, options) => {
    const endpoint = [
      apiRoutes.export.excel,
      encodeURIComponent(options.fileName),
      encodeURIComponent(options.culture),
    ].join("/");
    return apiService.postBlob(
      endpoint,
      rows,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },
};
