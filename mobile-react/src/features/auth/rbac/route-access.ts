import { ROUTES } from '@/src/core/constants/routes';
import {
  isAuthorized,
  type AuthorizationClaims,
  type AuthorizationRequirement,
} from '@/src/features/auth/rbac/authorization';
import { permissions, type PermissionString } from '@/src/features/auth/rbac/permissions';
import { appRoles, hasAnyRole } from '@/src/features/auth/rbac/roles';

export interface RoutePolicy {
  path: string;
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  anyOf?: readonly AuthorizationRequirement[];
}

export const BASIC_DATA_VIEW_PERMISSIONS = [
  permissions.ViewCountries,
  permissions.ViewStates,
  permissions.ViewDistricts,
  permissions.ViewAddressTypes,
] as const;

// More-specific routes must precede their parent route.
export const routePolicies: readonly RoutePolicy[] = [
  {
    path: ROUTES.superAdminDashboard,
    roles: [appRoles.superAdmin],
  },
  {
    path: ROUTES.tenantManagement,
    roles: [appRoles.superAdmin],
  },
  {
    path: ROUTES.administration.rolePermissionsRoot,
    permissions: [permissions.ViewRoles],
  },
  {
    path: ROUTES.administration.roles,
    permissions: [permissions.ViewRoles],
  },
  {
    path: ROUTES.administration.root,
    anyOf: [
      { permissions: [permissions.ViewUsers] },
      { permissions: [permissions.ViewRoles] },
    ],
  },
  {
    path: ROUTES.basicData.geographicalInformation,
    permissions: BASIC_DATA_VIEW_PERMISSIONS,
  },
  {
    path: ROUTES.basicData.organizationalStructure,
    roles: [appRoles.admin],
  },
  {
    path: ROUTES.basicData.root,
    anyOf: [
      { permissions: BASIC_DATA_VIEW_PERMISSIONS },
      { roles: [appRoles.admin] },
    ],
  },
  { path: ROUTES.home },
  { path: ROUTES.settings, roles: [appRoles.admin, appRoles.superAdmin] },
  { path: ROUTES.modal },
];

const superAdminAllowedRoutes = [
  ROUTES.home,
  ROUTES.settings,
  ROUTES.superAdminDashboard,
  ROUTES.tenantManagement,
] as const;

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
    !superAdminAllowedRoutes.some((path) => matchesRoute(pathname, path))
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
