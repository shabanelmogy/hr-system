"use client";

import { useAuthorization } from "@/lib/auth/useAuthorization";
import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { useAccessibleModulesQuery } from "@/platform/modules";

const superAdminRole = "super_admin";

export type ManagedReportScope = "tenant" | "global";

export function getManagedReportAuthorization(scope: ManagedReportScope) {
  return {
    allowedRoles: scope === "global" ? [superAdminRole] : undefined,
    requiredPermissions: [
      scope === "global"
        ? permissions.ViewGlobalCrystalReports
        : permissions.ViewCrystalReports,
    ] as const,
  } as const;
}

export function resolveManagedReportAvailability(
  scope: ManagedReportScope,
  input: {
    authorizationAllowed: boolean;
    authorizationLoading: boolean;
    reportingAccessible: boolean;
    modulesLoading: boolean;
  },
) {
  return {
    allowed: input.authorizationAllowed && (scope === "global" || input.reportingAccessible),
    isLoading:
      input.authorizationLoading ||
      (scope === "tenant" && input.authorizationAllowed && input.modulesLoading),
  } as const;
}

/**
 * Resolves the authorization contract for a managed Crystal report.
 *
 * Global reports are platform-owned and therefore require both the
 * super-admin role and the global report permission. They intentionally do
 * not query tenant module entitlements. Tenant reports require the tenant
 * report permission and an accessible Reporting module.
 */
export function useManagedReportAvailability(scope: ManagedReportScope = "tenant", entityKey?: string) {
  const { user } = useSession();
  const entityPermission = entityKey === "countries" ? permissions.ViewCountries
    : entityKey === "states" ? permissions.ViewStates : entityKey === "districts" ? permissions.ViewDistricts : null;
  const authorization = useAuthorization({
    ...getManagedReportAuthorization(scope),
  });
  const companyAuthorization = useAuthorization({
    requiredPermissions: entityPermission ? [permissions.ViewCrystalReports, entityPermission] : [permissions.ViewCrystalReports],
    permissionMode: "all",
  });
  const companyConsumer = scope === "global" && !authorization.allowed && !!entityPermission &&
    !!user?.tenantId && (user.companyId ?? 0) > 0 && !user.roles.some((role) => role.toLowerCase() === superAdminRole) && companyAuthorization.allowed;
  const allowed = authorization.allowed || companyConsumer;
  const needsModule = scope === "tenant" || companyConsumer;
  const modulesQuery = useAccessibleModulesQuery(
    needsModule && allowed,
  );
  const reportingAccessible = (modulesQuery.data ?? []).some(
    (module) => module.code.trim().toLowerCase() === "reporting",
  );

  return {
    ...resolveManagedReportAvailability(needsModule ? "tenant" : "global", {
      authorizationAllowed: allowed,
      authorizationLoading: authorization.isLoading || (scope === "global" && companyAuthorization.isLoading),
      reportingAccessible,
      modulesLoading: modulesQuery.isLoading,
    }),
    scope,
    companyConsumer,
    scopeKey: JSON.stringify([user?.userId, user?.tenantId, user?.companyId]),
  } as const;
}
