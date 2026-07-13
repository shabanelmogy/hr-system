// navigationConfig.tsx
import { getAdvancedToolsConfig } from "./configs/advancedToolsConfig";
import { getAnalyticsConfig } from "./configs/analyticsConfig";
import { getBasicDataConfig } from "./configs/basicDataConfig";
import { getChatConfig } from "./configs/chatConfig";
import { getCommunicationConfig } from "./configs/communicationConfig";
import { getDocumentsConfig } from "./configs/documentsConfig";
import { getKanbanConfig } from "./configs/kanbanConfig";
import { getUsersAndRolesConfig } from "./configs/usersAndRolesConfig";
import { filterNavigationConfig } from "./navigationUtils";

// Import types and enums from separate file
import { getExtrasConfig } from "./configs/extrasConfig";
import {
  NavigationConfig,
} from './navigationTypes';

export const getNavigationConfig = (): NavigationConfig => {
  // Full navigation configuration
  const fullConfig: NavigationConfig = [
    getBasicDataConfig(),
    getExtrasConfig(),
    getUsersAndRolesConfig(),
    // getAnalyticsConfig(),
    // getCommunicationConfig(),
    // getDocumentsConfig(),
    // getKanbanConfig(),
    // getChatConfig(),
    getAdvancedToolsConfig(),
  ];

  // Filter the configuration based on user permissions
  return filterNavigationConfig(fullConfig);
};