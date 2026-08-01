import CategoryIcon from "@mui/icons-material/Category";
import LanguageIcon from "@mui/icons-material/Language";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import type { ReactNode } from "react";
import { appRoutes, type AppPath } from "@/config/routes";
import { permissions, type PermissionString } from "@/lib/auth/permissions";

export interface BasicDataNavigationItem {
  id: string;
  titleKey: string;
  href: AppPath;
  icon: ReactNode;
  permissions: readonly PermissionString[];
  children?: readonly BasicDataNavigationItem[];
}

const geographicDataItems: readonly BasicDataNavigationItem[] = [
  { id: "countries", titleKey: "menu.countries", href: appRoutes.basicData.countries, icon: <PublicIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
  { id: "states", titleKey: "menu.states", href: appRoutes.basicData.states, icon: <LocationCityIcon fontSize="small" />, permissions: [permissions.ViewStates] },
  { id: "districts", titleKey: "menu.districts", href: appRoutes.basicData.districts, icon: <MapIcon fontSize="small" />, permissions: [permissions.ViewDistricts] },
  { id: "address-types", titleKey: "menu.addressTypes", href: appRoutes.basicData.addressTypes, icon: <CategoryIcon fontSize="small" />, permissions: [permissions.ViewAddressTypes] },
  { id: "country-report", titleKey: "menu.countryReport", href: appRoutes.basicData.countryReport, icon: <LanguageIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
  { id: "global-presence", titleKey: "menu.globalPresence", href: appRoutes.basicData.globalPresence, icon: <PublicIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
];

export const getBasicDataNavigation = (): readonly BasicDataNavigationItem[] => [
  {
    id: "geographic-data",
    titleKey: "menu.geographicData",
    href: appRoutes.basicData.index,
    icon: <MapIcon fontSize="small" />,
    permissions: [],
    children: geographicDataItems,
  },
];
