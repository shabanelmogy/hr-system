import { apiRoutes } from "@/config";
import apiService from "@/lib/api/client";
import type { ExportFormatAdapter } from "../types";

export type PdfFormatOptions = { reportHeader: string };

export const pdfExportAdapter: ExportFormatAdapter<PdfFormatOptions> = {
  extension: "pdf",
  export: (rows, options) => {
    const endpoint = [
      apiRoutes.export.pdf,
      encodeURIComponent(options.fileName),
      encodeURIComponent(options.reportHeader),
      encodeURIComponent(options.culture),
    ].join("/");
    return apiService.postBlob(endpoint, rows, "application/pdf");
  },
};
