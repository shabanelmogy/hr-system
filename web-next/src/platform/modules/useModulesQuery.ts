"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { canAccessRoute } from "@/lib/auth/route-access";
import { getAdministrationModule } from "./tenantAdministrationLauncher";
import type { ErpModule } from "./types";
import { useQuery } from "@tanstack/react-query";
import { moduleApi, moduleKeys } from "./moduleApi";
import { intersectAccessibleModulesWithFrontendRegistry } from "./registry";

export function useAccessibleModulesQuery(enabled = true) {
  const { user } = useSession();
  const { t } = useTranslation();
  const select = useCallback((serverModules: ErpModule[]) => {
    const modules = intersectAccessibleModulesWithFrontendRegistry(serverModules);
    const administration = user ? getAdministrationModule(path => canAccessRoute(path, user), key => t(key)) : null;
    return administration ? [...modules, administration] : modules;
  }, [user, t]);
  return useQuery({
    queryKey: moduleKeys.accessible(),
    queryFn: moduleApi.getAccessible,
    select,
    enabled,
    staleTime: 30_000,
  });
}

export function useInstalledModulesQuery(enabled = true) {
  return useQuery({
    queryKey: moduleKeys.installed(),
    queryFn: moduleApi.getInstalled,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useTenantEntitlementModulesQuery(enabled = true) {
  return useQuery({
    queryKey: moduleKeys.tenantEntitlements(),
    queryFn: moduleApi.getTenantEntitlements,
    enabled,
    staleTime: 5 * 60_000,
  });
}
