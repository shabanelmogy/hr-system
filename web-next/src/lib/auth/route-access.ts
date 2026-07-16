import { appRoutes } from "@/config/routes";
import type { SessionClaims } from "./session";
import { permissions, type PermissionString } from "./permissions";
import { isAuthorized } from "./authorization";

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

export function canAccessRoute(pathname: string, session: SessionClaims): boolean {
  const rule = routePolicies.find(({ path }) => matchesRoute(pathname, path));
  if (!rule) return false;
  return isAuthorized(session, {
    roles: rule.roles,
    permissions: rule.permissions,
  });
}
