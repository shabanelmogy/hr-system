import { version } from "./constants";
import type { CrystalReportsRoutes } from "./types";

/** Crystal report management routes. Tenant and company scope come from the session. */
export const crystalReports: CrystalReportsRoutes = {
  list: `${version}/crystal-reports`,
  render: (id) => `${version}/crystal-reports/${id}/render`,
  manage: `${version}/crystal-reports/manage`,
  getForManagement: (id) => `${version}/crystal-reports/manage/${id}`,
  create: `${version}/crystal-reports`,
  versions: (id) => `${version}/crystal-reports/${id}/versions`,
  download: (id) => `${version}/crystal-reports/${id}/download`,
  downloadVersion: (id, versionId) => `${version}/crystal-reports/${id}/versions/${versionId}/download`,
  publishVersion: (id, versionId) => `${version}/crystal-reports/${id}/versions/${versionId}/publish`,
  access: (id) => `${version}/crystal-reports/${id}/access`,
  archive: (id) => `${version}/crystal-reports/${id}`,
  legacyCandidates: `${version}/crystal-reports/legacy-candidates`,
  importLegacy: `${version}/crystal-reports/legacy-imports`,
};
