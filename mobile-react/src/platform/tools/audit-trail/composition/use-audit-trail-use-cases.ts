import { useMemo } from 'react';
import { useAuth } from '@/src/platform/auth';
import { createAuditTrailUseCases } from '../application/audit-trail-use-cases';
import { DefaultAuditTrailRepository } from '../data/repositories/default-audit-trail-repository';
import { createAuditTrailRemoteDataSource } from '../data/remote/audit-trail-remote-data-source';
export function useAuditTrailUseCases() {
  const { session } = useAuth();
  const system = Boolean(session?.roles.includes('super_admin'));
  return useMemo(() => createAuditTrailUseCases(new DefaultAuditTrailRepository(createAuditTrailRemoteDataSource(system))), [system]);
}
