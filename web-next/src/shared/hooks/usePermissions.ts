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

export const usePermissions = () => {
  const { user } = useSession();
  const { isReadOnly } = useAppReadOnly();
  const userPermissions = user?.permissions ?? [];
  const userRoles = user?.roles ?? [];
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
  const { hasPermission, isReadOnly } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission("Countries:View"),
    canCreate: !isReadOnly && hasPermission("Countries:Create"),
    canEdit: !isReadOnly && hasPermission("Countries:Edit"),
    canDelete: !isReadOnly && hasPermission("Countries:Delete"),
  }), [hasPermission, isReadOnly]);
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
