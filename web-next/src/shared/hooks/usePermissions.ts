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

export const usePermissions = () => {
  const { user } = useSession();
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
  }), [hasPermission]);
};

// Simplified States permissions hook
export const useStatesPermissions = () => {
  const { hasPermission } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission("States:View"),
    canCreate: hasPermission("States:Create"),
    canEdit: hasPermission("States:Edit"),
    canDelete: hasPermission("States:Delete"),
  }), [hasPermission]);
};

// Generic module permissions hook
export const useModulePermissions = (module: PermissionModule) => {
  const { hasPermission } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission(`${module}:View` as PermissionString),
    canCreate: hasPermission(`${module}:Create` as PermissionString),
    canEdit: hasPermission(`${module}:Edit` as PermissionString),
    canDelete: hasPermission(`${module}:Delete` as PermissionString),
  }), [hasPermission, module]);
};

export default usePermissions;
