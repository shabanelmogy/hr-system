import ApartmentIcon from "@mui/icons-material/Apartment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  NavigationSectionId,
  NavigationTitles,
  UserRoles,
} from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getSuperAdminConfig = () =>
  createNavSection(
    NavigationSectionId.SUPER_ADMIN,
    NavigationTitles.SUPER_ADMIN,
    createColoredIcon(<AdminPanelSettingsIcon />, "superAdmin"),
    [
      createNavItem(
        NavigationTitles.SUPER_ADMIN_DASHBOARD,
        createColoredIcon(<DashboardIcon />, "superAdmin"),
        appRoutes.platform.superAdmin.dashboard,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.TENANT_MANAGEMENT,
        createColoredIcon(<ApartmentIcon />, "superAdmin"),
        appRoutes.platform.superAdmin.tenants,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.TENANT_ADMIN_MANAGEMENT,
        createColoredIcon(<ManageAccountsIcon />, "superAdmin"),
        appRoutes.platform.superAdmin.tenantAdmins,
        [UserRoles.SUPER_ADMIN],
      ),
      createNavItem(
        NavigationTitles.GLOBAL_GEOGRAPHY,
        createColoredIcon(<MapIcon />, "superAdmin"),
        undefined,
        [UserRoles.SUPER_ADMIN],
        undefined,
        [
          createNavItem(
            NavigationTitles.COUNTRIES,
            createColoredIcon(<PublicIcon />, "superAdmin"),
            appRoutes.modules.referenceData.geography.countries,
            [UserRoles.SUPER_ADMIN],
            [permissions.ViewCountries],
          ),
          createNavItem(
            NavigationTitles.STATES,
            createColoredIcon(<LocationCityIcon />, "superAdmin"),
            appRoutes.modules.referenceData.geography.states,
            [UserRoles.SUPER_ADMIN],
            [permissions.ViewStates],
          ),
          createNavItem(
            NavigationTitles.DISTRICTS,
            createColoredIcon(<MapIcon />, "superAdmin"),
            appRoutes.modules.referenceData.geography.districts,
            [UserRoles.SUPER_ADMIN],
            [permissions.ViewDistricts],
          ),
        ],
      ),
    ],
    [UserRoles.SUPER_ADMIN],
  );
