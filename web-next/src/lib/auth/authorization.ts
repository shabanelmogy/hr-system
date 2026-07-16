import {
  hasAllPermissions,
  hasAnyPermission,
  type PermissionString,
} from "./permissions";

export type PermissionMatchMode = "any" | "all";

export type AuthorizationRequirement = {
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
};

export type AuthorizationState =
  | "loading"
  | "unauthenticated"
  | "forbidden"
  | "authorized";

type AuthorizationClaims = {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
};

const hasAnyRole = (userRoles: readonly string[], requiredRoles: readonly string[]) => {
  const normalizedRoles = new Set(userRoles.map((role) => role.toLowerCase()));
  return requiredRoles.some((role) => normalizedRoles.has(role.toLowerCase()));
};

export function isAuthorized(
  session: AuthorizationClaims | null,
  {
    roles = [],
    permissions = [],
    permissionMode = "any",
  }: AuthorizationRequirement = {},
): boolean {
  if (!session) return false;

  const rolesAllowed = roles.length === 0 || hasAnyRole(session.roles, roles);
  const permissionsAllowed =
    permissions.length === 0 ||
    (permissionMode === "all"
      ? hasAllPermissions(session.permissions, permissions)
      : hasAnyPermission(session.permissions, permissions));

  return rolesAllowed && permissionsAllowed;
}

export function getAuthorizationState(
  session: AuthorizationClaims | null,
  isSessionLoading: boolean,
  requirement: AuthorizationRequirement = {},
): AuthorizationState {
  if (!session) return isSessionLoading ? "loading" : "unauthenticated";
  return isAuthorized(session, requirement) ? "authorized" : "forbidden";
}
