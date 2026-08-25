import { useMemo } from 'react';

import { useAuth } from '@/src/features/auth/context/AuthProvider';
import {
  getAuthorizationState,
  type PermissionMatchMode,
} from '@/src/features/auth/rbac/authorization';
import type { PermissionString } from '@/src/features/auth/rbac/permissions';
import { canAccessRoute } from '@/src/features/auth/rbac/route-access';
import { appRoles, hasAnyRole } from '@/src/features/auth/rbac/roles';

export interface UseAuthorizationOptions {
  allowedRoles?: readonly string[];
  requiredPermissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
  /** Platform-owned actions may be performed by a super administrator even when
   * the tenant permission claim is intentionally absent from that session. */
  allowSuperAdmin?: boolean;
}

export function useAuthorization({
  allowedRoles,
  requiredPermissions,
  permissionMode = 'any',
  allowSuperAdmin = false,
}: UseAuthorizationOptions = {}) {
  const { session, status } = useAuth();

  const state = useMemo(
    () => {
      if (session && allowSuperAdmin && hasAnyRole(session.roles, [appRoles.superAdmin])) {
        return 'authorized';
      }

      return getAuthorizationState(session, status === 'loading', {
        roles: allowedRoles,
        permissions: requiredPermissions,
        permissionMode,
      });
    },
    [allowSuperAdmin, allowedRoles, permissionMode, requiredPermissions, session, status],
  );

  return {
    state,
    allowed: state === 'authorized',
    isLoading: state === 'loading',
    isAuthenticated: session !== null,
    roles: session?.roles ?? [],
    permissions: session?.permissions ?? [],
  } as const;
}

export function useCanAccessRoute(pathname: string): boolean {
  const { session, status } = useAuth();
  return status === 'authenticated' && canAccessRoute(pathname, session);
}
