import {
  getFrontendModuleDefinition,
  getFrontendModuleDefinitions,
} from "@/platform/modules";
import { getPlatformNavigation } from "@/platform/navigation";
import { getSuperAdminConfig } from "./configs/superAdminConfig";
import { filterNavigationConfig } from "./navigationUtils";
import type { NavigationConfig } from "./navigationTypes";

export const getNavigationConfig = (
  userRoles: readonly string[] = [],
  userPermissions: readonly string[] = [],
  activeModuleCode?: string | null,
): NavigationConfig => {
  const isSuperAdmin = userRoles.some(role => role.trim().toLowerCase() === "super_admin");
  const activeModuleNavigation = activeModuleCode
    ? getFrontendModuleDefinition(activeModuleCode)?.navigation ?? []
    : null;
  const fullConfig = isSuperAdmin
    ? [getSuperAdminConfig()]
    : activeModuleNavigation ?? [
        ...getPlatformNavigation(),
        ...getFrontendModuleDefinitions().flatMap(definition => definition.navigation ?? []),
      ];
  return filterNavigationConfig(fullConfig, userRoles, userPermissions);
};
