// usersAndRolesConfig.tsx
import ArchiveIcon from "@mui/icons-material/Archive";
import CategoryIcon from "@mui/icons-material/Category";
import { appRoutes } from "../../../../routes/appRoutes";
import { NavigationColors, NavigationTitles, NavigationSectionId, UserRoles } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getUsersAndRolesConfig = () => {
  const sectionIcon = createColoredIcon(<ArchiveIcon />, NavigationColors.PRIMARY_BLUE);
  const itemIcon = createColoredIcon(<CategoryIcon />, NavigationColors.SECONDARY_BLUE);

  const usersAndRolesItems = [
    createNavItem(NavigationTitles.ROLES_MANAGEMENT, itemIcon, appRoutes.auth.rolesPage, [UserRoles.ADMIN]),
    createNavItem(NavigationTitles.USERS_MANAGEMENT, itemIcon, appRoutes.auth.usersPage, [UserRoles.ADMIN]),
  ];

  return createNavSection(NavigationSectionId.USERS_AND_ROLES, NavigationTitles.ROLES_AND_USERS_MANAGEMENT, sectionIcon, usersAndRolesItems);
};