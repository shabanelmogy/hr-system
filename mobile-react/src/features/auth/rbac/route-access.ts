import { ROUTES } from '@/src/core/constants/routes';
import {
  isAuthorized,
  type AuthorizationClaims,
} from '@/src/features/auth/rbac/authorization';
import { appRoles, hasAnyRole } from '@/src/features/auth/rbac/roles';
import {
  routePolicies,
  superAdminAllowedRoutes,
  type RoutePolicy,
} from '@/src/features/auth/rbac/route-manifest';

export { BASIC_DATA_VIEW_PERMISSIONS, routePolicies } from './route-manifest';

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
