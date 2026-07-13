import { appRoutes } from "@/config/routes";
import type { SessionClaims } from "./session";
import { permissions, type PermissionString, hasPermission } from "./permissions";

export const UNAVAILABLE_ROUTE = "/route-unavailable";

export type RoutePolicy = {
  path: string;
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
};

const adminRole = "admin";
const rolePermissionsBase = appRoutes.auth.rolePermissionsPage("").replace(/\/$/, "");

export const routePolicies: readonly RoutePolicy[] = [
  { path: appRoutes.home },
  { path: appRoutes.profile },
  { path: appRoutes.changePassword },
  {
    path: rolePermissionsBase,
    permissions: [permissions.EditRoles],
  },
  { path: appRoutes.auth.rolesPage, permissions: [permissions.ViewRoles] },
  { path: appRoutes.auth.usersPage, permissions: [permissions.ViewUsers] },
  {
    path: appRoutes.basicData.countryReport,
    permissions: [permissions.ViewCountries],
  },
  {
    path: appRoutes.basicData.globalPresence,
    permissions: [permissions.ViewCountries],
  },
  {
    path: appRoutes.basicData.countries,
    permissions: [permissions.ViewCountries],
  },
  {
    path: appRoutes.basicData.states,
    permissions: [permissions.ViewStates],
  },
  {
    path: appRoutes.basicData.addressTypes,
    permissions: [permissions.ViewAddressTypes],
  },
  {
    path: appRoutes.basicData.districts,
    permissions: [permissions.ViewDistricts],
  },
  { path: appRoutes.extras.filesManager, roles: [adminRole] },
  {
    path: appRoutes.extras.appointments,
    permissions: [permissions.ViewUsers],
  },
  {
    path: appRoutes.advancedTools.trackChanges,
    permissions: [permissions.ViewChangeLogs],
  },
  {
    path: appRoutes.advancedTools.localizationApi,
    permissions: [permissions.ViewLocalizations],
  },
  { path: appRoutes.advancedTools.healthCheck, roles: [adminRole] },
  { path: appRoutes.advancedTools.apiEndpoints, roles: [adminRole] },
  { path: appRoutes.advancedTools.hangfireDashboard, roles: [adminRole] },
  { path: appRoutes.kpis },
  { path: appRoutes.trends },
  { path: appRoutes.healthPipeline },
  { path: appRoutes.attendanceTrends },
  { path: UNAVAILABLE_ROUTE },
];

const matchesRoute = (pathname: string, routePath: string) =>
  pathname === routePath ||
  (routePath !== appRoutes.home && pathname.startsWith(`${routePath}/`));

const includesIgnoreCase = (values: readonly string[], expected: string) => {
  const lowerExpected = expected.toLowerCase();
  return values.some((value) => value.toLowerCase() === lowerExpected);
};

export function canAccessRoute(pathname: string, session: SessionClaims): boolean {
  const rule = routePolicies.find(({ path }) => matchesRoute(pathname, path));
  if (!rule) return false;

  // If rule has no restrictions, allow access
  if (!rule.roles && !rule.permissions) return true;

  const hasRoles = rule.roles !== undefined;
  const hasPermissions = rule.permissions !== undefined;

  const matchesRole =
    rule.roles?.some((role) => includesIgnoreCase(session.roles, role)) ?? false;
  
  // Use optimized Set-based permission checker for consistency and performance
  const matchesPermission =
    rule.permissions?.some((permission) => hasPermission(session.permissions, permission)) ?? false;

  // If both roles and permissions are defined, require BOTH (AND logic for security)
  // If only one is defined, require that one (OR logic)
  if (hasRoles && hasPermissions) {
    return matchesRole && matchesPermission;
  }

  return matchesRole || matchesPermission;
}
