import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAuditTrailEntry,
  getAuditTrailFilters,
  getAuditTrailPage,
} from "../services/auditTrailService";
import type { AuditTrailQuery } from "../types/auditTrail";

export const auditTrailKeys = {
  all: ["platform", "auditTrail"] as const,
  list: (query: AuditTrailQuery) => [...auditTrailKeys.all, "list", query] as const,
  entry: (moduleCode: string, id: number) => [...auditTrailKeys.all, "entry", moduleCode, id] as const,
  filters: () => [...auditTrailKeys.all, "filters"] as const,
};

export function useAuditTrailList(query: AuditTrailQuery, enabled = true) {
  return useInfiniteQuery({
    queryKey: auditTrailKeys.list(query),
    queryFn: ({ pageParam }) => getAuditTrailPage(query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 15_000,
  });
}

export function useAuditTrailEntry(moduleCode: string | null, id: number | null) {
  return useQuery({
    queryKey: auditTrailKeys.entry(moduleCode ?? "", id ?? 0),
    queryFn: () => getAuditTrailEntry(moduleCode!, id!),
    enabled: Boolean(moduleCode) && Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useAuditTrailFilters(enabled = true) {
  return useQuery({
    queryKey: auditTrailKeys.filters(),
    queryFn: getAuditTrailFilters,
    enabled,
    staleTime: 60_000,
  });
}
