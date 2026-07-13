// Simplified permissions hook
import { useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/constants/appPermissions";

interface DecodedToken {
  [key: string]: any;
  Permissions?: string[];
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string[];
}

export const usePermissions = () => {
  const token = sessionStorage.getItem("token");
  
  const { userPermissions, userRoles, isAuthenticated } = useMemo(() => {
    if (!token) {
      return { userPermissions: [], userRoles: [], isAuthenticated: false };
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      return {
        userPermissions: decodedToken.Permissions || [],
        userRoles: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [],
        isAuthenticated: true,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { userPermissions: [], userRoles: [], isAuthenticated: false };
    }
  }, [token]);

  const checkPermission = useCallback(
    (permission: string): boolean => {
      return isAuthenticated && hasPermission(userPermissions, permission);
    },
    [userPermissions, isAuthenticated]
  );

  const checkAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return isAuthenticated && hasAnyPermission(userPermissions, permissions);
    },
    [userPermissions, isAuthenticated]
  );

  const checkAllPermissions = useCallback(
    (permissions: string[]): boolean => {
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
export const useModulePermissions = (module: string) => {
  const { hasPermission } = usePermissions();
  
  return useMemo(() => ({
    canView: hasPermission(`${module}:View`),
    canCreate: hasPermission(`${module}:Create`),
    canEdit: hasPermission(`${module}:Edit`),
    canDelete: hasPermission(`${module}:Delete`),
  }), [hasPermission, module]);
};

export default usePermissions;