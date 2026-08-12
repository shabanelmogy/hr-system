import type { ReactNode } from 'react';

import { AccessDeniedScreen } from '@/src/features/auth/rbac/AccessDeniedScreen';
import type { PermissionMatchMode } from '@/src/features/auth/rbac/authorization';
import type { PermissionString } from '@/src/features/auth/rbac/permissions';
import { useAuthorization } from '@/src/features/auth/rbac/useAuthorization';

export interface AuthorizeViewProps {
  children: ReactNode;
  allowedRoles?: readonly string[];
  requiredPermissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
  fallback?: ReactNode;
  showForbidden?: boolean;
}

export function AuthorizeView({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  permissionMode = 'any',
  fallback = null,
  showForbidden = false,
}: AuthorizeViewProps) {
  const { allowed, isLoading } = useAuthorization({
    allowedRoles,
    requiredPermissions,
    permissionMode,
  });

  if (isLoading) return <>{fallback}</>;
  if (!allowed) return showForbidden ? <AccessDeniedScreen /> : null;
  return <>{children}</>;
}
