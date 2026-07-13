// advancedToolsConfig.tsx
import AddTaskIcon from "@mui/icons-material/AddTask";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ApiIcon from "@mui/icons-material/Api";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { appRoutes } from "@/config/routes";
import { NavigationColors, NavigationTitles, NavigationSectionId, UserRoles } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";
import { permissions } from "@/lib/auth/permissions";

export const getAdvancedToolsConfig = () => {
  const sectionIcon = createColoredIcon(<HealthAndSafetyIcon />, NavigationColors.PURPLE);

  const advancedToolsItems = [
    createNavItem(NavigationTitles.TRACK_CHANGES, createColoredIcon(<AddTaskIcon />, NavigationColors.LIGHT_PURPLE), appRoutes.advancedTools.trackChanges, undefined, [permissions.ViewChangeLogs]),
    createNavItem(NavigationTitles.LOCALIZATION_API, createColoredIcon(<TranslateIcon />, NavigationColors.PINK), appRoutes.advancedTools.localizationApi, undefined, [permissions.ViewLocalizations]),
    createNavItem(NavigationTitles.HEALTH_CHECK, createColoredIcon(<HealthAndSafetyIcon />, NavigationColors.DARK_PURPLE), appRoutes.advancedTools.healthCheck, [UserRoles.ADMIN]),
    createNavItem(NavigationTitles.API_ENDPOINTS, createColoredIcon(<ApiIcon />, NavigationColors.DARK_GRAY), appRoutes.advancedTools.apiEndpoints, [UserRoles.ADMIN]),
    createNavItem(NavigationTitles.HANGFIRE_DASHBOARD, createColoredIcon(<TranslateIcon />, NavigationColors.PINK), appRoutes.advancedTools.hangfireDashboard, [UserRoles.ADMIN]),
  ];

  return createNavSection(NavigationSectionId.ADVANCED_TOOLS, NavigationTitles.ADVANCED_TOOLS_TITLE, sectionIcon, advancedToolsItems);
};
