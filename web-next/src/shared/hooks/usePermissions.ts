"use client";

import { useCallback, useMemo } from "react";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  permissions,
  type PermissionModule,
  type PermissionString,
} from "@/lib/auth/permissions";
import { useSession } from "@/lib/auth/SessionContext";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

const EMPTY_PERMISSIONS: readonly PermissionString[] = [];
const EMPTY_ROLES: readonly string[] = [];
const SUPER_ADMIN_ROLE = "super_admin";

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
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();
  
  return useMemo(() => ({
    canView: hasGlobalGeographyPermission("Countries:View"),
    canCreate: hasGlobalGeographyPermission("Countries:Create"),
    canEdit: hasGlobalGeographyPermission("Countries:Edit"),
    canDelete: hasGlobalGeographyPermission("Countries:Delete"),
    canRestore: hasGlobalGeographyPermission("Countries:Delete"),
  }), [hasGlobalGeographyPermission]);
};

// Simplified States permissions hook
export const useStatesPermissions = () => {
  const { isReadOnly } = usePermissions();
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();
  
  return useMemo(() => ({
    canView: hasGlobalGeographyPermission("States:View"),
    canCreate: !isReadOnly && hasGlobalGeographyPermission("States:Create"),
    canEdit: !isReadOnly && hasGlobalGeographyPermission("States:Edit"),
    canDelete: !isReadOnly && hasGlobalGeographyPermission("States:Delete"),
  }), [hasGlobalGeographyPermission, isReadOnly]);
};

export const useDistrictsPermissions = () => {
  const { isReadOnly } = usePermissions();
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();

  return useMemo(() => ({
    canView: hasGlobalGeographyPermission("Districts:View"),
    canCreate: !isReadOnly && hasGlobalGeographyPermission("Districts:Create"),
    canEdit: !isReadOnly && hasGlobalGeographyPermission("Districts:Edit"),
    canDelete: !isReadOnly && hasGlobalGeographyPermission("Districts:Delete"),
  }), [hasGlobalGeographyPermission, isReadOnly]);
};

/** Super Admin owns the shared catalog; tenant roles require explicit claims. */
export const useGlobalGeographyPermissions = () => {
  const { hasPermission, userRoles } = usePermissions();
  const isSuperAdmin = userRoles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  const hasGlobalGeographyPermission = useCallback(
    (permission: PermissionString) => isSuperAdmin || hasPermission(permission),
    [hasPermission, isSuperAdmin],
  );

  return { hasGlobalGeographyPermission };
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

// Recruitment permissions hook
export const useRecruitmentPermissions = () => {
  const { hasPermission, isReadOnly } = usePermissions();

  return useMemo(
    () => ({
      canView: hasPermission(permissions.ViewRecruitment),
      canManageRequisitions: !isReadOnly && hasPermission(permissions.ManageJobRequisitions),
      canApproveRequisitions: !isReadOnly && hasPermission(permissions.ApproveJobRequisitions),
      canManageOpenings: !isReadOnly && hasPermission(permissions.ManageJobOpenings),
      canManagePostings: !isReadOnly && hasPermission(permissions.ManageJobPostings),
      canManageCandidates: !isReadOnly && hasPermission(permissions.ManageCandidates),
      canManageApplications: !isReadOnly && hasPermission(permissions.ManageApplications),
      canEvaluateInterviews: !isReadOnly && hasPermission(permissions.EvaluateInterviews),
      canManageOffers: !isReadOnly && hasPermission(permissions.ManageJobOffers),
      canApproveOffers: !isReadOnly && hasPermission(permissions.ApproveJobOffers),
      canHire: !isReadOnly && hasPermission(permissions.HireCandidate),
    }),
    [hasPermission, isReadOnly]
  );
};

export default usePermissions;
