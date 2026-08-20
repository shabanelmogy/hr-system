"use client";

import { useCallback, useMemo } from "react";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type PermissionModule,
  type PermissionString,
} from "@/lib/auth/permissions";
import { useSession } from "@/lib/auth/SessionContext";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

const EMPTY_PERMISSIONS: readonly PermissionString[] = [];
const EMPTY_ROLES: readonly string[] = [];

export const usePermissions = () => {
  const { user } = useSession();
  const { isReadOnly } = useAppReadOnly();
  const userPermissions = user?.permissions ?? EMPTY_PERMISSIONS;
  const userRoles = user?.roles ?? EMPTY_ROLES;
  const isAuthenticated = user !== null;

  const checkPermission = useCallback(
    (permission: PermissionString): boolean => {
      return isAuthenticated && hasPermission(userPermissions, permission);
    },
    [userPermissions, isAuthenticated]
  );

  const checkAnyPermission = useCallback(
    (permissions: readonly PermissionString[]): boolean => {
      return isAuthenticated && hasAnyPermission(userPermissions, permissions);
    },
    [userPermissions, isAuthenticated]
  );

  const checkAllPermissions = useCallback(
    (permissions: readonly PermissionString[]): boolean => {
      return isAuthenticated && hasAllPermissions(userPermissions, permissions);
    },
    [userPermissions, isAuthenticated]
  );

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userPermissions,
    userRoles,
    isAuthenticated,
    isReadOnly,
  };
};

// Simplified Countries permissions hook
export const useCountriesPermissions = () => {
  const { hasPermission } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission("Countries:View"),
    canCreate: hasPermission("Countries:Create"),
    canEdit: hasPermission("Countries:Edit"),
    canDelete: hasPermission("Countries:Delete"),
    canRestore: hasPermission("Countries:Delete"),
  }), [hasPermission]);
};

// Simplified States permissions hook
export const useStatesPermissions = () => {
  const { hasPermission, isReadOnly } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission("States:View"),
    canCreate: !isReadOnly && hasPermission("States:Create"),
    canEdit: !isReadOnly && hasPermission("States:Edit"),
    canDelete: !isReadOnly && hasPermission("States:Delete"),
  }), [hasPermission, isReadOnly]);
};

// Generic module permissions hook
export const useModulePermissions = (module: PermissionModule) => {
  const { hasPermission, isReadOnly } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission(`${module}:View` as PermissionString),
    canCreate: !isReadOnly && hasPermission(`${module}:Create` as PermissionString),
    canEdit: !isReadOnly && hasPermission(`${module}:Edit` as PermissionString),
    canDelete: !isReadOnly && hasPermission(`${module}:Delete` as PermissionString),
  }), [hasPermission, isReadOnly, module]);
};

export default usePermissions;
