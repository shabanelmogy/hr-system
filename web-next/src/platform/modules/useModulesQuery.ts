import { useQuery } from "@tanstack/react-query";
import { moduleApi, moduleKeys } from "./moduleApi";
import { intersectAccessibleModulesWithFrontendRegistry } from "./registry";

export function useAccessibleModulesQuery(enabled = true) {
  return useQuery({
    queryKey: moduleKeys.accessible(),
    queryFn: moduleApi.getAccessible,
    select: intersectAccessibleModulesWithFrontendRegistry,
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
