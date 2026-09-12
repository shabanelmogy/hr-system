// usersAndRolesConfig.tsx
import ArchiveIcon from "@mui/icons-material/Archive";
import CategoryIcon from "@mui/icons-material/Category";
import EmailIcon from "@mui/icons-material/Email";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";

export const getUsersAndRolesConfig = () => {
  const sectionIcon = createColoredIcon(<ArchiveIcon />, "#4a6da7");
  const itemIcon = createColoredIcon(<CategoryIcon />, "#5c7cbc");

  const usersAndRolesItems = [
    createNavItem("menu.rolesManagement", itemIcon, appRoutes.auth.rolesPage, undefined, [permissions.ViewRoles]),
    createNavItem("menu.usersManagement", itemIcon, appRoutes.auth.usersPage, undefined, [permissions.ViewUsers]),
    createNavItem("menu.invitationsManagement", createColoredIcon(<EmailIcon />, "#5c7cbc"), appRoutes.auth.invitationsPage, undefined, [permissions.ViewUsers]),
    createNavItem("menu.crystalReportsManagement", createColoredIcon(<AssessmentIcon />, "#5c7cbc"), appRoutes.auth.crystalReportsPage, undefined, [permissions.ManageCrystalReportAccess]),
    createNavItem("menu.offlineOperations", createColoredIcon(<CloudOffRoundedIcon />, "#5c7cbc"), appRoutes.auth.offlineOperationsPage, undefined, [permissions.ManageOfflineOperations]),
  ];

  return createNavSection("usersAndRoles", "menu.rolesAndUsersManagement", sectionIcon, usersAndRolesItems);
};
