import { useAuth, permissions } from '@/src/platform/auth';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useAuditTrailUseCases } from '../../composition/use-audit-trail-use-cases';
import type { AuditTrailQuery } from '../../domain/models/audit-trail';

export const auditTrailKeys = {
  all: ['platform-tools', 'audit-trail'] as const,
  list: (query: AuditTrailQuery, scope = 'company') => [...auditTrailKeys.all, scope, 'list', query] as const,
  entry: (moduleCode: string, id: number, scope = 'company') => [...auditTrailKeys.all, scope, 'entry', moduleCode, id] as const,
  filters: (scope = 'company') => [...auditTrailKeys.all, scope, 'filters'] as const,
};

function useAuditContext() {
  const { session } = useAuth();
  const system = Boolean(session?.roles.includes('super_admin'));
  return { key: [system ? 'system' : 'company', session?.userId, session?.tenantId, session?.companyId].join(':'),
    allowed: Boolean(session?.permissions.includes(system ? permissions.ViewSystemAuditTrail : permissions.ViewAuditTrail)) };
}
export function useAuditTrailList(query: AuditTrailQuery, enabled = true) {
  const useCases = useAuditTrailUseCases();
  const scope = useAuditContext();
  return useInfiniteQuery({
    queryKey: auditTrailKeys.list(query, scope.key),
    queryFn: ({ pageParam }) => useCases.getPage(query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && scope.allowed,
    staleTime: 15_000,
  });
}

export function useAuditTrailEntry(moduleCode: string | null, id: number | null) {
  const useCases = useAuditTrailUseCases();
  const scope = useAuditContext();
  return useQuery({
    queryKey: auditTrailKeys.entry(moduleCode ?? '', id ?? 0, scope.key),
    queryFn: () => useCases.getEntry(moduleCode!, id!),
    enabled: scope.allowed && Boolean(moduleCode) && Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useAuditTrailFilters() {
  const useCases = useAuditTrailUseCases();
  const scope = useAuditContext();
  return useQuery({
    queryKey: auditTrailKeys.filters(scope.key),
    queryFn: () => useCases.getFilters(),
    enabled: scope.allowed,
    staleTime: 60_000,
  });
}
