import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAuditTrailEntry,
  getAuditTrailFilters,
  getAuditTrailPage,
} from "../services/auditTrailService";
import type { AuditTrailQuery } from "../types/auditTrail";

export const auditTrailKeys = {
  all: ["platform", "auditTrail"] as const,
  list: (query: AuditTrailQuery, scope = "company") => [...auditTrailKeys.all, scope, "list", query] as const,
  entry: (moduleCode: string, id: number, scope = "company") => [...auditTrailKeys.all, scope, "entry", moduleCode, id] as const,
  filters: (scope = "company") => [...auditTrailKeys.all, scope, "filters"] as const,
};

function useAuditScope() {
  const { user } = useSession();
  const system = Boolean(user?.roles.includes("super_admin"));
  return { system, key: [system ? "system" : "company", user?.userId, user?.tenantId, user?.companyId].join(":"),
    allowed: Boolean(user?.permissions.includes(system ? permissions.ViewSystemAuditTrail : permissions.ViewAuditTrail)) };
}

export function useAuditTrailList(query: AuditTrailQuery, enabled = true) {
  const scope = useAuditScope();
  return useInfiniteQuery({
    queryKey: auditTrailKeys.list(query, scope.key),
    queryFn: ({ pageParam }) => getAuditTrailPage(query, pageParam, scope.system),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && scope.allowed,
    staleTime: 15_000,
  });
}

export function useAuditTrailEntry(moduleCode: string | null, id: number | null) {
  const scope = useAuditScope();
  return useQuery({
    queryKey: auditTrailKeys.entry(moduleCode ?? "", id ?? 0, scope.key),
    queryFn: () => getAuditTrailEntry(moduleCode!, id!, scope.system),
    enabled: scope.allowed && Boolean(moduleCode) && Boolean(id),
    staleTime: 5 * 60_000,
  });
}

export function useAuditTrailFilters(enabled = true) {
  const scope = useAuditScope();
  return useQuery({
    queryKey: auditTrailKeys.filters(scope.key),
    queryFn: () => getAuditTrailFilters(scope.system),
    enabled: enabled && scope.allowed,
    staleTime: 60_000,
  });
}
