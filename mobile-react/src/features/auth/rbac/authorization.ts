import {
  hasAllPermissions,
  hasAnyPermission,
  type PermissionString,
} from '@/src/features/auth/rbac/permissions';
import { hasAnyRole } from '@/src/features/auth/rbac/roles';

export type PermissionMatchMode = 'any' | 'all';

export interface AuthorizationRequirement {
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
}

export type AuthorizationState =
  | 'loading'
  | 'unauthenticated'
  | 'forbidden'
  | 'authorized';

export interface AuthorizationClaims {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export function isAuthorized(
  session: AuthorizationClaims | null,
  {
    roles = [],
    permissions = [],
    permissionMode = 'any',
  }: AuthorizationRequirement = {},
): boolean {
  if (!session) return false;

  const rolesAllowed = roles.length === 0 || hasAnyRole(session.roles, roles);
  const permissionsAllowed =
    permissions.length === 0 ||
    (permissionMode === 'all'
      ? hasAllPermissions(session.permissions, permissions)
      : hasAnyPermission(session.permissions, permissions));

  return rolesAllowed && permissionsAllowed;
}

export function getAuthorizationState(
  session: AuthorizationClaims | null,
  isSessionLoading: boolean,
  requirement: AuthorizationRequirement = {},
): AuthorizationState {
  if (!session) return isSessionLoading ? 'loading' : 'unauthenticated';
  return isAuthorized(session, requirement) ? 'authorized' : 'forbidden';
}
