import type { ExportRoutes, AdvancedToolsRoutes, GoogleRoutes } from './types';

const version = "/api/v1";

export const exportRoutes: ExportRoutes = {
  excel: `${version}/export/exportExcel`,
  pdf: `${version}/exportPdf/generateSyncfusionPdf`,
};

export const advancedTools: AdvancedToolsRoutes = {
  getLocalizationApi: `${version}/localization/getLocalization`,
  updateLocalizationApi: `${version}/localization/updateLocalizationKey`,
  trackChanges: `${version}/entityChangeLogs/getAllChangesLogs`,
};

export const google: GoogleRoutes = {
  auth: "/api/account/google-auth",
};
