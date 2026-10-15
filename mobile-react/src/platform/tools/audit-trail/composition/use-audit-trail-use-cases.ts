import { createAuditTrailUseCases } from '../application/audit-trail-use-cases';
import { DefaultAuditTrailRepository } from '../data/repositories/default-audit-trail-repository';

const auditTrailUseCases = createAuditTrailUseCases(new DefaultAuditTrailRepository());

export function useAuditTrailUseCases() {
  return auditTrailUseCases;
}
