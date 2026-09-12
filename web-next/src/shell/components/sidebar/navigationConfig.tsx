import { getFrontendModuleDefinitions } from "@/platform/modules";
import { getSuperAdminConfig } from "./configs/superAdminConfig";
import { filterNavigationConfig } from "./navigationUtils";
import type { NavigationConfig } from "./navigationTypes";

export const getNavigationConfig = (userRoles: readonly string[] = [], userPermissions: readonly string[] = []): NavigationConfig => {
  const isSuperAdmin = userRoles.some(role => role.trim().toLowerCase() === "super_admin");
  const fullConfig = isSuperAdmin ? [getSuperAdminConfig()] : getFrontendModuleDefinitions().flatMap(definition => definition.navigation ?? []);
  return filterNavigationConfig(fullConfig, userRoles, userPermissions);
};
