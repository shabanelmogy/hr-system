import type { ExportRoutes, AdvancedToolsRoutes, GoogleRoutes } from './types';
import { version } from "./constants";

export const exportRoutes: ExportRoutes = {
  excel: `${version}/export/exportExcel`,
  pdf: `${version}/exportPdf/generateSyncfusionPdf`,
};

export const advancedTools: AdvancedToolsRoutes = {
  getLocalizationApi: `${version}/localization/getLocalization`,
  updateLocalizationApi: `${version}/localization/updateLocalizationKey`,
  trackChanges: `${version}/entityChangeLogs/getAllChangesLogs`,
  healthCheck: "/api/health",
};

export const google: GoogleRoutes = {
  auth: "/api/account/google-auth",
};
