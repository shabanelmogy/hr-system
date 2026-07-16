"use client";

import { useMemo } from "react";
import { useSession } from "./SessionContext";
import {
  getAuthorizationState,
  type PermissionMatchMode,
} from "./authorization";
import type { PermissionString } from "./permissions";

export type UseAuthorizationOptions = {
  allowedRoles?: readonly string[];
  requiredPermissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
};

export function useAuthorization({
  allowedRoles,
  requiredPermissions,
  permissionMode = "any",
}: UseAuthorizationOptions = {}) {
  const { user, isLoading: isSessionLoading } = useSession();

  const state = useMemo(
    () =>
      getAuthorizationState(user, isSessionLoading, {
        roles: allowedRoles,
        permissions: requiredPermissions,
        permissionMode,
      }),
    [allowedRoles, isSessionLoading, permissionMode, requiredPermissions, user],
  );

  return {
    state,
    allowed: state === "authorized",
    isLoading: state === "loading",
    isAuthenticated: user !== null,
  } as const;
}
