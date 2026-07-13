"use client";

import { useMemo } from "react";
import type { PermissionString } from "@/lib/auth/permissions";
import { useSession } from "@/lib/auth/SessionContext";

interface UsePageGuardOptions {
  /** At least one of these permissions is required (OR semantics). */
  requiredPermissions?: PermissionString[];
  /** At least one of these roles is required (OR semantics). */
  allowedRoles?: string[];
}

interface UsePageGuardResult {
  /** True when the session is still loading — render a skeleton/spinner. */
  isLoading: boolean;
  /** True when the user is authenticated and passes all checks. */
  allowed: boolean;
}

/**
 * Gate an entire page behind a permission/role check.
 * Prevents API calls from firing when the user lacks access.
 *
 * @example
 * const { allowed, isLoading } = usePageGuard({ requiredPermissions: [permissions.ViewUsers] });
 * if (isLoading) return <MyLoadingIndicator />;
 * if (!allowed) return <ForbiddenPage />;
 */
export function usePageGuard({
  requiredPermissions = [],
  allowedRoles = [],
}: UsePageGuardOptions = {}): UsePageGuardResult {
  const { user, isLoading, hasRole, hasPermission } = useSession();

  const allowed = useMemo(() => {
    if (isLoading || !user) return false;
    return hasRole(allowedRoles) && hasPermission(requiredPermissions);
  }, [isLoading, user, hasRole, hasPermission, allowedRoles, requiredPermissions]);

  return { isLoading, allowed };
}

export default usePageGuard;
