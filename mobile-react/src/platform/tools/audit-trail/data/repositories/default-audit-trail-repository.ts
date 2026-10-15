import type { AuditTrailRepository } from '../../domain/repositories/audit-trail-repository';
import { auditTrailRemoteDataSource } from '../remote/audit-trail-remote-data-source';

export class DefaultAuditTrailRepository implements AuditTrailRepository {
  constructor(private readonly remote: AuditTrailRepository = auditTrailRemoteDataSource) {}

  getPage: AuditTrailRepository['getPage'] = (query, cursor) => this.remote.getPage(query, cursor);
  getEntry: AuditTrailRepository['getEntry'] = (moduleCode, id) => this.remote.getEntry(moduleCode, id);
  getFilters: AuditTrailRepository['getFilters'] = () => this.remote.getFilters();
}
