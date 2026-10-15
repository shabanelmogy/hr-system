import type {
  AuditTrailDetails,
  AuditTrailModuleFilter,
  AuditTrailPage,
  AuditTrailQuery,
} from '../models/audit-trail';

export interface AuditTrailRepository {
  getPage(query: AuditTrailQuery, cursor?: string | null): Promise<AuditTrailPage>;
  getEntry(moduleCode: string, id: number): Promise<AuditTrailDetails>;
  getFilters(): Promise<AuditTrailModuleFilter[]>;
}
