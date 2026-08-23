// usersAndRolesConfig.tsx
import ArchiveIcon from "@mui/icons-material/Archive";
import CategoryIcon from "@mui/icons-material/Category";
import EmailIcon from "@mui/icons-material/Email";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { appRoutes } from "@/config/routes";
import { NavigationColors, NavigationTitles, NavigationSectionId } from "../navigationTypes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getUsersAndRolesConfig = () => {
  const sectionIcon = createColoredIcon(<ArchiveIcon />, NavigationColors.PRIMARY_BLUE);
  const itemIcon = createColoredIcon(<CategoryIcon />, NavigationColors.SECONDARY_BLUE);

  const usersAndRolesItems = [
    createNavItem(NavigationTitles.ROLES_MANAGEMENT, itemIcon, appRoutes.auth.rolesPage, undefined, [permissions.ViewRoles]),
    createNavItem(NavigationTitles.USERS_MANAGEMENT, itemIcon, appRoutes.auth.usersPage, undefined, [permissions.ViewUsers]),
    createNavItem(NavigationTitles.INVITATIONS_MANAGEMENT, createColoredIcon(<EmailIcon />, NavigationColors.SECONDARY_BLUE), appRoutes.auth.invitationsPage, undefined, [permissions.ViewUsers]),
    createNavItem(NavigationTitles.CRYSTAL_REPORTS_MANAGEMENT, createColoredIcon(<AssessmentIcon />, NavigationColors.SECONDARY_BLUE), appRoutes.auth.crystalReportsPage, undefined, [permissions.ManageCrystalReportAccess]),
  ];

  return createNavSection(NavigationSectionId.USERS_AND_ROLES, NavigationTitles.ROLES_AND_USERS_MANAGEMENT, sectionIcon, usersAndRolesItems);
};
