import { appRoles, permissions, useAuth, useAuthorization } from '@/src/platform/auth';
import { useAccessibleModules } from '@/src/platform/modules';

/** Resolves the combined report permission and Reporting-module entitlement gate. */
export function useManagedReportAvailability(scope: 'tenant' | 'global' = 'tenant', entityKey?: string) {
  const { session } = useAuth();
  const entityPermission = entityKey === 'countries' ? permissions.ViewCountries
    : entityKey === 'states' ? permissions.ViewStates : entityKey === 'districts' ? permissions.ViewDistricts : null;
  const authorization = useAuthorization({
    ...(scope === 'global'
      ? {
        allowedRoles: [appRoles.superAdmin],
        requiredPermissions: [permissions.ViewGlobalCrystalReports],
      }
      : { allowSuperAdmin: true, requiredPermissions: [permissions.ViewCrystalReports] }),
  });
  const companyAuthorization = useAuthorization({ requiredPermissions: entityPermission
    ? [permissions.ViewCrystalReports, entityPermission] : [permissions.ViewCrystalReports], permissionMode: 'all' });
  const companyConsumer = scope === 'global' && !authorization.allowed && !!entityPermission &&
    !!session?.tenantId && (session.companyId ?? 0) > 0 && !session.roles.some((role) => role.toLowerCase() === appRoles.superAdmin) && companyAuthorization.allowed;
  const allowed = authorization.allowed || companyConsumer;
  const needsModule = scope === 'tenant' || companyConsumer;
  const modulesQuery = useAccessibleModules(needsModule && allowed);
  const reportingInstalled = (modulesQuery.data ?? [])
    .some((module) => module.code.toLowerCase() === 'reporting');

  return {
    allowed: allowed && (!needsModule || reportingInstalled),
    isLoading: authorization.isLoading || (scope === 'global' && companyAuthorization.isLoading) || (needsModule && modulesQuery.isLoading),
    companyConsumer,
    scopeKey: JSON.stringify([session?.userId, session?.tenantId, session?.companyId]),
  };
}
