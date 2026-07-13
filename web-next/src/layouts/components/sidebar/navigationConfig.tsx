// navigationConfig.tsx
import { getAdvancedToolsConfig } from "./configs/advancedToolsConfig";
import { getBasicDataConfig } from "./configs/basicDataConfig";
import { getUsersAndRolesConfig } from "./configs/usersAndRolesConfig";
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
  // Full navigation configuration
  const fullConfig: NavigationConfig = [
    getBasicDataConfig(),
    getExtrasConfig(),
    getUsersAndRolesConfig(),
    getAdvancedToolsConfig(),
  ];

  // Filter the configuration based on user permissions
  return filterNavigationConfig(fullConfig, userRoles, userPermissions);
};
