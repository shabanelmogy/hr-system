// navigationConfig.tsx
import { getAdvancedToolsConfig } from "./configs/advancedToolsConfig";
import { getBasicDataConfig } from "./configs/basicDataConfig";
import { getUsersAndRolesConfig } from "./configs/usersAndRolesConfig";
import { getSuperAdminConfig } from "./configs/superAdminConfig";
import { getAttendanceConfig } from "./configs/attendanceConfig";
import { getRecruitmentConfig } from "./configs/recruitmentConfig";
import { getFinanceConfig } from "./configs/financeConfig";
import { filterNavigationConfig } from "./navigationUtils";

// Import types and enums from separate file
import { getExtrasConfig } from "./configs/extrasConfig";
import {
  NavigationConfig,
} from './navigationTypes';

export const getNavigationConfig = (
  userRoles: readonly string[] = [],
  userPermissions: readonly string[] = []
): NavigationConfig => {
  const isSuperAdmin = userRoles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  );

  // Full navigation configuration
  const fullConfig: NavigationConfig = isSuperAdmin
    ? [getSuperAdminConfig()]
    : [
        getBasicDataConfig(),
        getFinanceConfig(),
        getRecruitmentConfig(),
        getAttendanceConfig(),
        getExtrasConfig(),
        getUsersAndRolesConfig(),
        getAdvancedToolsConfig(),
      ];

  // Filter the configuration based on user permissions
  return filterNavigationConfig(fullConfig, userRoles, userPermissions);
};
