"use client";

import type { ReactNode } from "react";
import { useAuthorization } from "@/lib/auth/useAuthorization";
import type { PermissionMatchMode } from "@/lib/auth/authorization";
import type { PermissionString } from "@/lib/auth/permissions";
import ForbiddenPage from "./ForbiddenPage";

export type AuthorizeViewProps = {
  children: ReactNode;
  /** Roles that are allowed to see the children. An empty array means any role is allowed. */
  allowedRoles?: readonly string[];
  /** One of these permissions is required (OR semantics). An empty array means no permission is required. */
  requiredPermissions?: readonly PermissionString[];
  /** Whether any or every listed permission is required. */
  permissionMode?: PermissionMatchMode;
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
  permissionMode = "any",
  fallback = null,
  showForbidden = false,
}: AuthorizeViewProps) {
  const { allowed, isLoading } = useAuthorization({
    allowedRoles,
    requiredPermissions,
    permissionMode,
  });

  if (isLoading) return <>{fallback}</>;
  if (!allowed) return showForbidden ? <ForbiddenPage /> : null;
  return <>{children}</>;
}
