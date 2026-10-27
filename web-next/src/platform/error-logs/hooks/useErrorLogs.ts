"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/SessionContext";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import {
  getErrorLogDetail,
  getErrorLogSettings,
  listErrorLogs,
  updateErrorLogSettings,
} from "../services/errorLogService";
import type { ErrorLogCriteria, ErrorLogScope } from "../types/errorLogs";

export const errorLogKeys = {
  root: ["error-logs"] as const,
  scope: (scope: ErrorLogScope, userId?: string, tenantId?: string, companyId?: number) =>
    [...errorLogKeys.root, scope, userId ?? null, tenantId ?? null, companyId ?? null] as const,
};

function useErrorLogScope(scope: ErrorLogScope) {
  const { user, isLoggingOut, isSwitchingCompany } = useSession();
  const { hasPermission } = usePermissions();
  const superAdmin = user?.roles.some((role) => role.toLowerCase() === "super_admin") ?? false;
  const allowed = scope === "system"
    ? superAdmin && hasPermission(permissions.ViewSystemErrorLogs)
    : !superAdmin && Boolean(user?.tenantId && user?.companyId) && hasPermission(permissions.ViewErrorLogs);
  const key = errorLogKeys.scope(scope, user?.userId, user?.tenantId, user?.companyId);
  return { user, allowed: allowed && !isLoggingOut && !isSwitchingCompany, key, superAdmin };
}

export function useErrorLogList(scope: ErrorLogScope, criteria: ErrorLogCriteria, validCriteria = true) {
  const current = useErrorLogScope(scope);
  const query = useQuery({
    queryKey: [...current.key, "list", criteria],
    queryFn: () => listErrorLogs(scope, criteria),
    enabled: current.allowed && validCriteria,
    retry: 1,
  });
  return { ...query, allowed: current.allowed };
}

export function useErrorLogDetail(scope: ErrorLogScope, id: string | null, enabled: boolean) {
  const current = useErrorLogScope(scope);
  return useQuery({
    queryKey: [...current.key, "detail", id],
    queryFn: () => getErrorLogDetail(scope, id!),
    enabled: Boolean(current.allowed && enabled && id),
    retry: 1,
  });
}

export function useErrorLogSettings() {
  const { user, isLoggingOut, isSwitchingCompany } = useSession();
  const { hasPermission } = usePermissions();
  const allowed = Boolean(user?.roles.some((role) => role.toLowerCase() === "super_admin")
    && hasPermission(permissions.ViewErrorLogSettings) && !isLoggingOut && !isSwitchingCompany);
  const key = errorLogKeys.scope("system", user?.userId);
  const query = useQuery({ queryKey: [...key, "settings"], queryFn: getErrorLogSettings, enabled: allowed, retry: 1 });
  const cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ retentionDays, expectedRevision }: { retentionDays: number; expectedRevision: number }) =>
      updateErrorLogSettings(retentionDays, expectedRevision),
    onSuccess: async () => { await cache.invalidateQueries({ queryKey: [...key, "settings"] }); },
  });
  return { query, mutation, allowed };
}
