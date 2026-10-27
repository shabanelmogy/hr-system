export const systemAuditTrailEndpoints = {
  list: 'system-audit-trail',
  filters: 'system-audit-trail/filters',
  entry: (moduleCode: string, id: number) => `system-audit-trail/${encodeURIComponent(moduleCode)}/${id}`,
};
