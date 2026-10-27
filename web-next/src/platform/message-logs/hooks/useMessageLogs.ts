"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { getMessageLog, listMessageLogs } from "../services/messageLogService";
import type { MessageLogCriteria } from "../types/messageLogs";

function useMessageScope() {
  const { user, isLoggingOut, isSwitchingCompany } = useSession(); const { hasPermission } = usePermissions();
  const allowed = Boolean(user?.tenantId && user.companyId && !user.roles.some(role => role.toLowerCase() === "super_admin") &&
    hasPermission(permissions.ViewMessageLogs) && !isLoggingOut && !isSwitchingCompany);
  return { allowed, key: ["message-logs", user?.userId ?? null, user?.tenantId ?? null, user?.companyId ?? null] as const };
}
export function useMessageLogList(criteria: MessageLogCriteria, valid: boolean) {
  const scope = useMessageScope();
  return { ...useQuery({ queryKey: [...scope.key, "list", criteria], queryFn: () => listMessageLogs(criteria), enabled: scope.allowed && valid, retry: 1,
    placeholderData: (previous, previousQuery) => previous && previousQuery?.queryKey.slice(0, scope.key.length).every((part, index) => part === scope.key[index])
      ? { ...previous, items: [] } : undefined,
  }), allowed: scope.allowed };
}
export function useMessageLogDetail(id: string) {
  const scope = useMessageScope();
  return useQuery({ queryKey: [...scope.key, "detail", id], queryFn: () => getMessageLog(id), enabled: scope.allowed, gcTime: 0, retry: 1 });
}
