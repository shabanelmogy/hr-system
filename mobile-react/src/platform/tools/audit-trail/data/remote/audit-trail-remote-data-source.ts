import { apiService } from '@/src/core/api';

import type { AuditTrailRepository } from '../../domain/repositories/audit-trail-repository';
import { auditTrailEndpoints } from './audit-trail-endpoints';
import { systemAuditTrailEndpoints } from './system-audit-trail-endpoints';
import {
  auditTrailDetailsSchema,
  auditTrailFiltersSchema,
  auditTrailPageSchema,
} from './audit-trail-schemas';

export function createAuditTrailRemoteDataSource(system = false): AuditTrailRepository {
  return {
  async getPage(query, cursor) {
    const response = await apiService.get<unknown>(system ? systemAuditTrailEndpoints.list : auditTrailEndpoints.list, {
      params: { ...query, cursor: cursor ?? undefined },
    });
    return auditTrailPageSchema.parse(response);
  },
  async getEntry(moduleCode, id) {
    return auditTrailDetailsSchema.parse(await apiService.get<unknown>(system ? systemAuditTrailEndpoints.entry(moduleCode, id) : auditTrailEndpoints.entry(moduleCode, id)));
  },
  async getFilters() {
    return auditTrailFiltersSchema.parse(await apiService.get<unknown>(system ? systemAuditTrailEndpoints.filters : auditTrailEndpoints.filters)).modules;
  },
  };
}
export const auditTrailRemoteDataSource = createAuditTrailRemoteDataSource();
