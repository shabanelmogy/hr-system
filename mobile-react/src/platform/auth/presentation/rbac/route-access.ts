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
  if (pathname.startsWith('/basic-data')) return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  if (pathname.startsWith('/recruitment')) return { moduleCode: 'hr', submoduleCode: 'recruitment' };
  if (pathname.startsWith('/workforce-planning') || pathname.startsWith('/finance')) return { moduleCode: 'hr', submoduleCode: 'workforce' };
  if (pathname.startsWith('/advanced-tools/localization-api')) return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  if (pathname.startsWith('/advanced-tools/track-changes') || pathname.startsWith('/advanced-tools/hangfire-dashboard')) return { moduleCode: 'hr', submoduleCode: 'analytics' };
  if (pathname.startsWith('/advanced-tools') || pathname.startsWith('/administration') || pathname.startsWith('/extras')) return { moduleCode: 'hr', submoduleCode: 'administration' };
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

