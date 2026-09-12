import AddTaskIcon from "@mui/icons-material/AddTask";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ApiIcon from "@mui/icons-material/Api";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import { appRoutes } from "@/config/routes";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";
import { permissions } from "@/lib/auth/permissions";

export const getAdvancedToolsConfig = () => {
  const sectionIcon = createColoredIcon(<HealthAndSafetyIcon />, "#7b1fa2");

  const advancedToolsItems = [
    createNavItem(
      "advancedTools.trackChanges",
      createColoredIcon(<AddTaskIcon />, "#8e24aa"),
      appRoutes.advancedTools.trackChanges,
      undefined,
      [permissions.ViewChangeLogs],
    ),
    createNavItem(
      "advancedTools.localizationApi",
      createColoredIcon(<TranslateIcon />, "#ba68c8"),
      appRoutes.advancedTools.localizationApi,
      undefined,
      [permissions.ViewLocalizations],
    ),
    createNavItem(
      "advancedTools.healthCheck",
      createColoredIcon(<HealthAndSafetyIcon />, "#9c27b0"),
      appRoutes.advancedTools.healthCheck,
      ["admin"],
    ),
    createNavItem(
      "advancedTools.apiEndPoints",
      createColoredIcon(<ApiIcon />, "#352F36FF"),
      appRoutes.advancedTools.apiEndpoints,
      ["admin"],
    ),
    createNavItem(
      "advancedTools.hangfireDashboard",
      createColoredIcon(<WorkHistoryIcon />, "#ba68c8"),
      appRoutes.advancedTools.hangfireDashboard,
      undefined,
      [permissions.ViewHangfireDashboard],
    ),
  ];

  return createNavSection(
    "advancedTools",
    "advancedTools.title",
    sectionIcon,
    advancedToolsItems,
  );
};
