import { appRoles, permissions, useAuthorization } from '@/src/platform/auth';
import { useAccessibleModules } from '@/src/platform/modules';

/** Resolves the combined report permission and Reporting-module entitlement gate. */
export function useManagedReportAvailability(scope: 'tenant' | 'global' = 'tenant') {
  const authorization = useAuthorization({
    ...(scope === 'global'
      ? {
        allowedRoles: [appRoles.superAdmin],
        requiredPermissions: [permissions.ViewGlobalCrystalReports],
      }
      : { allowSuperAdmin: true, requiredPermissions: [permissions.ViewCrystalReports] }),
  });
  const modulesQuery = useAccessibleModules(scope === 'tenant' && authorization.allowed);
  const reportingInstalled = (modulesQuery.data ?? [])
    .some((module) => module.code.toLowerCase() === 'reporting');

  return {
    allowed: authorization.allowed && (scope === 'global' || reportingInstalled),
    isLoading: authorization.isLoading || (scope === 'tenant' && modulesQuery.isLoading),
  };
}
