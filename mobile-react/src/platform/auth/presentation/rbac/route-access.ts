import { ROUTES } from '@/src/core/constants/routes';
import {
  isAuthorized,
  type AuthorizationClaims,
} from '@/src/platform/auth/presentation/rbac/authorization';
import { appRoles, hasAnyRole } from '@/src/platform/auth/presentation/rbac/roles';
import {
  routePolicies,
  superAdminAllowedRoutes,
  type RoutePolicy,
} from '@/src/platform/auth/presentation/rbac/route-manifest';

export { BASIC_DATA_VIEW_PERMISSIONS, routePolicies } from './route-manifest';

export function requiredModuleForPath(pathname: string): { moduleCode: string; submoduleCode?: string } | null {
  if (pathname === ROUTES.apps) return null;
  if (pathname.startsWith('/apps/')) {
    const [, , moduleCode, submoduleCode] = pathname.split('/');
    return moduleCode ? { moduleCode, submoduleCode } : null;
  }
  if (matchesRoute(pathname, ROUTES.basicData.addressTypes)) {
    return { moduleCode: 'reference-data', submoduleCode: 'addresses' };
  }
  if ([ROUTES.basicData.countries, ROUTES.basicData.states, ROUTES.basicData.districts]
    .some((route) => matchesRoute(pathname, route))) {
    return { moduleCode: 'reference-data', submoduleCode: 'geography' };
  }
  if (matchesRoute(pathname, ROUTES.basicData.companyGeographicScope)) {
    return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  }
  if (pathname === ROUTES.basicData.root
    || pathname === ROUTES.basicData.geographicalInformation
    || pathname === ROUTES.basicData.organizationalStructure) return null;
  if (matchesRoute(pathname, ROUTES.basicData.organizationalStructure)) {
    return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  }
  if (matchesRoute(pathname, ROUTES.recruitment.root)) return { moduleCode: 'hr', submoduleCode: 'recruitment' };
  if (matchesRoute(pathname, ROUTES.workforcePlanning.index)) return { moduleCode: 'hr', submoduleCode: 'workforce' };
  if (matchesRoute(pathname, ROUTES.finance.ledgerSetup.root)) {
    return { moduleCode: 'acc', submoduleCode: 'ledger-setup' };
  }
  if (pathname === ROUTES.finance.root) return { moduleCode: 'acc' };
  if ([ROUTES.advancedTools.trackChanges, ROUTES.advancedTools.localizationApi]
    .some((route) => matchesRoute(pathname, route))) {
    return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  }
  if ([ROUTES.advancedTools.healthCheck, ROUTES.advancedTools.apiEndpoints, ROUTES.advancedTools.hangfireDashboard]
    .some((route) => matchesRoute(pathname, route))) {
    return { moduleCode: 'platform', submoduleCode: 'operations' };
  }
  if (pathname === ROUTES.advancedTools.root || pathname === ROUTES.extras.root) return null;
  if (matchesRoute(pathname, ROUTES.administration.root)) {
    return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  }
  if (matchesRoute(pathname, ROUTES.extras.appointments)) return { moduleCode: 'crm', submoduleCode: 'appointments' };
  if (matchesRoute(pathname, ROUTES.extras.files)) return { moduleCode: 'platform', submoduleCode: 'operations' };
  return null;
}

function matchesRoute(pathname: string, routePath: string): boolean {
  return (
    pathname === routePath ||
    (routePath !== ROUTES.home && pathname.startsWith(`${routePath}/`))
  );
}

export function getRoutePolicy(pathname: string): RoutePolicy | undefined {
  return routePolicies.find(({ path }) => matchesRoute(pathname, path));
}

export function canAccessRoute(
  pathname: string,
  session: AuthorizationClaims | null,
): boolean {
  if (
    session &&
    hasAnyRole(session.roles, [appRoles.superAdmin]) &&
    !isSuperAdminAllowedRoute(pathname)
  ) {
    return false;
  }

  const policy = getRoutePolicy(pathname);
  if (!policy) return false;

  if (policy.anyOf?.length) {
    return policy.anyOf.some((requirement) => isAuthorized(session, requirement));
  }

  return isAuthorized(session, {
    roles: policy.roles,
    permissions: policy.permissions,
  });
}

function isSuperAdminAllowedRoute(pathname: string): boolean {
  return superAdminAllowedRoutes.some((path) =>
    path === ROUTES.basicData.root || path === ROUTES.basicData.geographicalInformation
      ? pathname === path
      : matchesRoute(pathname, path),
  );
}

