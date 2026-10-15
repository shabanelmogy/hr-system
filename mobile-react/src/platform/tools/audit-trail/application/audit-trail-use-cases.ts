import type { AuditTrailRepository } from '../domain/repositories/audit-trail-repository';

export type AuditTrailUseCases = AuditTrailRepository;

export function createAuditTrailUseCases(repository: AuditTrailRepository): AuditTrailUseCases {
  return {
    getPage: (query, cursor) => repository.getPage(query, cursor),
    getEntry: (moduleCode, id) => repository.getEntry(moduleCode, id),
    getFilters: () => repository.getFilters(),
  };
}
