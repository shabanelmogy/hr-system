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
    canView: hasGlobalGeographyPermission(permissions.ViewCountries),
    canCreate: hasGlobalGeographyPermission(permissions.CreateCountries),
    canEdit: hasGlobalGeographyPermission(permissions.EditCountries),
    canDelete: hasGlobalGeographyPermission(permissions.ArchiveCountries),
    canRestore: hasGlobalGeographyPermission(permissions.RestoreCountries),
  }), [hasGlobalGeographyPermission]);
};

// Simplified States permissions hook
export const useStatesPermissions = () => {
  const { isReadOnly } = usePermissions();
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();
  
  return useMemo(() => ({
    canView: hasGlobalGeographyPermission(permissions.ViewStates),
    canCreate: !isReadOnly && hasGlobalGeographyPermission(permissions.CreateStates),
    canEdit: !isReadOnly && hasGlobalGeographyPermission(permissions.EditStates),
    canDelete: !isReadOnly && hasGlobalGeographyPermission(permissions.ArchiveStates),
    canRestore: !isReadOnly && hasGlobalGeographyPermission(permissions.RestoreStates),
  }), [hasGlobalGeographyPermission, isReadOnly]);
};

export const useDistrictsPermissions = () => {
  const { isReadOnly } = usePermissions();
  const { hasGlobalGeographyPermission } = useGlobalGeographyPermissions();

  return useMemo(() => ({
    canView: hasGlobalGeographyPermission(permissions.ViewDistricts),
    canCreate: !isReadOnly && hasGlobalGeographyPermission(permissions.CreateDistricts),
    canEdit: !isReadOnly && hasGlobalGeographyPermission(permissions.EditDistricts),
    canDelete: !isReadOnly && hasGlobalGeographyPermission(permissions.ArchiveDistricts),
    canRestore: !isReadOnly && hasGlobalGeographyPermission(permissions.RestoreDistricts),
  }), [hasGlobalGeographyPermission, isReadOnly]);
};

/** Global geography requires both the Super Admin role and the exact catalog permission. */
export const useGlobalGeographyPermissions = () => {
  const { hasPermission, userRoles } = usePermissions();
  const isSuperAdmin = userRoles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  const hasGlobalGeographyPermission = useCallback(
    (permission: PermissionString) => isSuperAdmin && hasPermission(permission),
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
  const { hasPermission, hasAllPermissions, isReadOnly } = usePermissions();

  return useMemo(
    () => ({
      canView: hasPermission(permissions.ViewRecruitment),
      canManageRequisitions: !isReadOnly && hasAllPermissions([permissions.CreateJobRequisitions, permissions.SubmitJobRequisitions, permissions.CancelJobRequisitions]),
      canApproveRequisitions: !isReadOnly && hasPermission(permissions.ReviewJobRequisitions),
      canManageOpenings: !isReadOnly && hasAllPermissions([permissions.CreateJobOpenings, permissions.OpenJobOpenings, permissions.PauseJobOpenings, permissions.CloseJobOpenings]),
      canManagePostings: !isReadOnly && hasAllPermissions([permissions.CreateJobPostings, permissions.EditJobPostings, permissions.PublishJobPostings, permissions.CloseJobPostings]),
      canManageCandidates: !isReadOnly && hasAllPermissions([permissions.CreateCandidates, permissions.EditCandidates]),
      canManageApplications: !isReadOnly && hasAllPermissions([permissions.CreateEmploymentApplications, permissions.MoveEmploymentApplications, permissions.RejectEmploymentApplications, permissions.WithdrawEmploymentApplications]),
      canEvaluateInterviews: !isReadOnly && hasPermission(permissions.EvaluateInterviews),
      canManageOffers: !isReadOnly && hasAllPermissions([permissions.CreateJobOffers, permissions.SubmitJobOffers, permissions.IssueJobOffers, permissions.RespondJobOffers]),
      canApproveOffers: !isReadOnly && hasPermission(permissions.ReviewJobOffers),
      canHire: !isReadOnly && hasPermission(permissions.HireCandidate),
    }),
    [hasAllPermissions, hasPermission, isReadOnly]
  );
};

export default usePermissions;
