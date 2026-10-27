"use client";
import { useEffect } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import { configureErrorLogReporter } from "@/lib/observability/errorLogReporter";
import { sendClientErrorLog } from "../services/clientErrorLogService";

export function ErrorLogCaptureBridge() {
  const { user, isSwitchingCompany, isLoggingOut } = useSession();
  const enabled = Boolean(user?.userId && (user.roles.includes("super_admin") || (user.tenantId && user.companyId)) && !isSwitchingCompany && !isLoggingOut);
  useEffect(() => {
    if (!enabled) return;
    return configureErrorLogReporter(sendClientErrorLog);
  }, [enabled, user?.userId, user?.tenantId, user?.companyId]);
  return null;
}
