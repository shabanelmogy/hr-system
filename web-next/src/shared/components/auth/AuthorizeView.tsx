"use client";

import type { ReactNode } from "react";
import { useSession } from "@/lib/auth/SessionContext";
import type { PermissionString } from "@/lib/auth/permissions";
import ForbiddenPage from "./ForbiddenPage";

type AuthorizeViewProps = {
  children: ReactNode;
  /** Roles that are allowed to see the children. An empty array means any role is allowed. */
  allowedRoles?: string[];
  /** One of these permissions is required (OR semantics). An empty array means no permission is required. */
  requiredPermissions?: PermissionString[];
  /** Rendered while the session is loading. Defaults to null. */
  fallback?: ReactNode;
  /**
   * When true, renders a full-page ForbiddenPage instead of null when the user lacks access.
   * Keep false (default) for UI-element guards like action buttons.
   */
  showForbidden?: boolean;
};

export default function AuthorizeView({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  showForbidden = false,
}: AuthorizeViewProps) {
  const { user, isLoading, hasRole, hasPermission } = useSession();

  if (isLoading) return <>{fallback}</>;
  if (!user) return null;
  if (!hasRole(allowedRoles) || !hasPermission(requiredPermissions)) {
    return showForbidden ? <ForbiddenPage /> : null;
  }
  return <>{children}</>;
}
