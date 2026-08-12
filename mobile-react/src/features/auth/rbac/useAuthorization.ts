import { useMemo } from 'react';

import { useAuth } from '@/src/features/auth/context/AuthProvider';
import {
  getAuthorizationState,
  type PermissionMatchMode,
} from '@/src/features/auth/rbac/authorization';
import type { PermissionString } from '@/src/features/auth/rbac/permissions';
import { canAccessRoute } from '@/src/features/auth/rbac/route-access';

export interface UseAuthorizationOptions {
  allowedRoles?: readonly string[];
  requiredPermissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
}

export function useAuthorization({
  allowedRoles,
  requiredPermissions,
  permissionMode = 'any',
}: UseAuthorizationOptions = {}) {
  const { session, status } = useAuth();

  const state = useMemo(
    () =>
      getAuthorizationState(session, status === 'loading', {
        roles: allowedRoles,
        permissions: requiredPermissions,
        permissionMode,
      }),
    [allowedRoles, permissionMode, requiredPermissions, session, status],
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
