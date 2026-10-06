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
  const administrationIcon = createColoredIcon(<ArchiveIcon />, "platform");
  const administrationItemIcon = createColoredIcon(<CategoryIcon />, "platform");

  const administration = createNavSection(
    "platform-administration",
    "menu.rolesAndUsersManagement",
    administrationIcon,
    [
      createNavItem(
        "menu.rolesManagement",
        administrationItemIcon,
        appRoutes.platform.administration.roles,
        undefined,
        [permissions.ViewRoles],
      ),
      createNavItem(
        "menu.usersManagement",
        administrationItemIcon,
        appRoutes.platform.administration.users,
        undefined,
        [permissions.ViewUsers],
      ),
      createNavItem(
        "menu.invitationsManagement",
        createColoredIcon(<EmailIcon />, "platform"),
        appRoutes.platform.administration.invitations,
        undefined,
        [permissions.ViewUserInvitations],
      ),
      createNavItem(
        "menu.offlineOperations",
        createColoredIcon(<CloudOffRoundedIcon />, "platform"),
        appRoutes.platform.administration.offlineOperations,
        undefined,
        [permissions.ViewOfflineOperations],
      ),
      createNavItem(
        "menu.companyGeographicScope",
        createColoredIcon(<PublicIcon />, "platform"),
        appRoutes.platform.companyGeographicScope,
        undefined,
        [permissions.ViewCompanyGeographicScope],
      ),
    ],
  );

  const files = createNavSection(
    "platform-files",
    "menu.extras",
    createColoredIcon(<TuneIcon />, "platform"),
    [
      createNavItem(
        "menu.filemanager",
        createColoredIcon(<CloudDownloadIcon />, "platform"),
        appRoutes.platform.files.manager,
      ),
    ],
  );

  const advancedTools = createNavSection(
    "platform-advanced-tools",
    "advancedTools.title",
    createColoredIcon(<HealthAndSafetyIcon />, "platform"),
    [
      createNavItem(
        "advancedTools.localizationApi",
        createColoredIcon(<TranslateIcon />, "platform"),
        appRoutes.platform.advancedTools.localizationApi,
        undefined,
        [permissions.ViewLocalizations],
      ),
      createNavItem(
        "advancedTools.healthCheck",
        createColoredIcon(<HealthAndSafetyIcon />, "platform"),
        appRoutes.platform.advancedTools.healthCheck,
        ["admin"],
      ),
      createNavItem(
        "advancedTools.apiEndPoints",
        createColoredIcon(<ApiIcon />, "platform"),
        appRoutes.platform.advancedTools.apiEndpoints,
        ["admin"],
      ),
      createNavItem(
        "advancedTools.hangfireDashboard",
        createColoredIcon(<WorkHistoryIcon />, "platform"),
        appRoutes.platform.advancedTools.hangfireDashboard,
        undefined,
        [permissions.ViewHangfireDashboard],
      ),
    ],
  );

  return [administration, files, advancedTools];
}
