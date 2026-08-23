import { version } from "./constants";
import type { ReportTemplatesRoutes } from "./types";

/**
 * Tenant context is inferred by the authenticated server session.  Do not put
 * tenant IDs in report-template URLs or browser requests.
 */
export const reportTemplates: ReportTemplatesRoutes = {
  list: `${version}/report-templates`,
  manage: `${version}/report-templates/manage`,
  getForManagement: (id) => `${version}/report-templates/manage/${id}`,
  dataSources: `${version}/report-templates/data-sources`,
  getById: (id) => `${version}/report-templates/${id}`,
  create: `${version}/report-templates`,
  update: (id) => `${version}/report-templates/${id}`,
  duplicate: (id) => `${version}/report-templates/${id}/duplicate`,
  publish: (id) => `${version}/report-templates/${id}/publish`,
  unpublish: (id) => `${version}/report-templates/${id}/unpublish`,
};
