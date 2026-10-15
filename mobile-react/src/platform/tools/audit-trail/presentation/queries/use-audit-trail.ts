import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useAuditTrailUseCases } from '../../composition/use-audit-trail-use-cases';
import type { AuditTrailQuery } from '../../domain/models/audit-trail';

export const auditTrailKeys = {
  all: ['platform-tools', 'audit-trail'] as const,
  list: (query: AuditTrailQuery) => [...auditTrailKeys.all, 'list', query] as const,
  entry: (moduleCode: string, id: number) => [...auditTrailKeys.all, 'entry', moduleCode, id] as const,
  filters: () => [...auditTrailKeys.all, 'filters'] as const,
};

export function useAuditTrailList(query: AuditTrailQuery, enabled = true) {
  const useCases = useAuditTrailUseCases();
  return useInfiniteQuery({
    queryKey: auditTrailKeys.list(query),
    queryFn: ({ pageParam }) => useCases.getPage(query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 15_000,
  });
}

export function useAuditTrailEntry(moduleCode: string | null, id: number | null) {
  const useCases = useAuditTrailUseCases();
  return useQuery({
    queryKey: auditTrailKeys.entry(moduleCode ?? '', id ?? 0),
    queryFn: () => useCases.getEntry(moduleCode!, id!),
    enabled: Boolean(moduleCode) && Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useAuditTrailFilters() {
  const useCases = useAuditTrailUseCases();
  return useQuery({
    queryKey: auditTrailKeys.filters(),
    queryFn: () => useCases.getFilters(),
    staleTime: 60_000,
  });
}
