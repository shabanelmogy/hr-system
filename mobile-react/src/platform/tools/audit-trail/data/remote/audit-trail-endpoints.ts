import { systemAuditTrailEndpoints } from './system-audit-trail-endpoints';

export const auditTrailEndpoints = {
  list: 'audit-trail',
  filters: 'audit-trail/filters',
  entry: (moduleCode: string, id: number) => `audit-trail/${encodeURIComponent(moduleCode)}/${id}`,
};

export function createAuditTrailEndpoints(system = false) {
  return system ? systemAuditTrailEndpoints : auditTrailEndpoints;
}
