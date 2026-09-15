import ApiIcon from "@mui/icons-material/Api";
import ArchiveIcon from "@mui/icons-material/Archive";
import CategoryIcon from "@mui/icons-material/Category";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import EmailIcon from "@mui/icons-material/Email";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PublicIcon from "@mui/icons-material/Public";
import TranslateIcon from "@mui/icons-material/Translate";
import TuneIcon from "@mui/icons-material/Tune";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
  type NavigationConfig,
} from "@/shared/components/layout/navigation";

export function getPlatformNavigation(): NavigationConfig {
  const administrationIcon = createColoredIcon(<ArchiveIcon />, "#4a6da7");
  const administrationItemIcon = createColoredIcon(<CategoryIcon />, "#5c7cbc");

  const administration = createNavSection(
    "platform-administration",
    "menu.rolesAndUsersManagement",
    administrationIcon,
    [
      createNavItem(
        "menu.rolesManagement",
        administrationItemIcon,
        appRoutes.auth.rolesPage,
        undefined,
        [permissions.ViewRoles],
      ),
      createNavItem(
        "menu.usersManagement",
        administrationItemIcon,
        appRoutes.auth.usersPage,
        undefined,
        [permissions.ViewUsers],
      ),
      createNavItem(
        "menu.invitationsManagement",
        createColoredIcon(<EmailIcon />, "#5c7cbc"),
        appRoutes.auth.invitationsPage,
        undefined,
        [permissions.ViewUsers],
      ),
      createNavItem(
        "menu.offlineOperations",
        createColoredIcon(<CloudOffRoundedIcon />, "#5c7cbc"),
        appRoutes.auth.offlineOperationsPage,
      ),
      createNavItem(
        "menu.companyGeographicScope",
        createColoredIcon(<PublicIcon />, "#5c7cbc"),
        appRoutes.basicData.companyGeographicScope,
        undefined,
        [permissions.ViewCompanyGeographicScope],
      ),
    ],
  );

  const files = createNavSection(
    "platform-files",
    "menu.extras",
    createColoredIcon(<TuneIcon />, "#4a6da7"),
    [
      createNavItem(
        "menu.filemanager",
        createColoredIcon(<CloudDownloadIcon />, "#5c7cbc"),
        appRoutes.extras.filesManager,
      ),
    ],
  );

  const advancedTools = createNavSection(
    "platform-advanced-tools",
    "advancedTools.title",
    createColoredIcon(<HealthAndSafetyIcon />, "#7b1fa2"),
    [
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
    ],
  );

  return [administration, files, advancedTools];
}
