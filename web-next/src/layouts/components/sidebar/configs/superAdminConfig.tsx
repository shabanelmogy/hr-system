import ApartmentIcon from "@mui/icons-material/Apartment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import { appRoutes } from "@/config/routes";
import {
  NavigationColors,
  NavigationSectionId,
  NavigationTitles,
  UserRoles,
} from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getSuperAdminConfig = () =>
  createNavSection(
    NavigationSectionId.SUPER_ADMIN,
    NavigationTitles.SUPER_ADMIN,
    createColoredIcon(<AdminPanelSettingsIcon />, NavigationColors.PURPLE),
    [
      createNavItem(
        NavigationTitles.SUPER_ADMIN_DASHBOARD,
        createColoredIcon(<DashboardIcon />, NavigationColors.PURPLE),
        appRoutes.superAdmin.dashboard,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.TENANT_MANAGEMENT,
        createColoredIcon(<ApartmentIcon />, NavigationColors.LIGHT_PURPLE),
        appRoutes.superAdmin.tenants,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.TENANT_ADMIN_MANAGEMENT,
        createColoredIcon(<ManageAccountsIcon />, NavigationColors.PURPLE),
        appRoutes.superAdmin.tenantAdmins,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.GLOBAL_GEOGRAPHY,
        createColoredIcon(<MapIcon />, NavigationColors.LIGHT_PURPLE),
        undefined,
        [UserRoles.SUPER_ADMIN],
        undefined,
        [
          createNavItem(
            NavigationTitles.COUNTRIES,
            createColoredIcon(<PublicIcon />, NavigationColors.PURPLE),
            appRoutes.superAdmin.geography.countries,
            [UserRoles.SUPER_ADMIN],
          ),
          createNavItem(
            NavigationTitles.STATES,
            createColoredIcon(<LocationCityIcon />, NavigationColors.PURPLE),
            appRoutes.superAdmin.geography.states,
            [UserRoles.SUPER_ADMIN],
          ),
          createNavItem(
            NavigationTitles.DISTRICTS,
            createColoredIcon(<MapIcon />, NavigationColors.PURPLE),
            appRoutes.superAdmin.geography.districts,
            [UserRoles.SUPER_ADMIN],
          ),
        ],
      ),
    ],
    [UserRoles.SUPER_ADMIN],
  );
