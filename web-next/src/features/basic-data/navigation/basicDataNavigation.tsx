import CategoryIcon from "@mui/icons-material/Category";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import type { ReactNode } from "react";
import { appRoutes, type AppPath } from "@/config/routes";
import { isAuthorized } from "@/lib/auth/authorization";
import { permissions, type PermissionString } from "@/lib/auth/permissions";
import type { SessionClaims } from "@/lib/auth/session";

export interface BasicDataNavigationItem {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  href: AppPath;
  icon: ReactNode;
  permissions: readonly PermissionString[];
  children?: readonly BasicDataNavigationItem[];
}

const geographicDataItems: readonly BasicDataNavigationItem[] = [
  { id: "countries", titleKey: "menu.countries", descriptionKey: "menu.countriesDescription", href: appRoutes.basicData.countries, icon: <PublicIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
  { id: "states", titleKey: "menu.states", descriptionKey: "menu.statesDescription", href: appRoutes.basicData.states, icon: <LocationCityIcon fontSize="small" />, permissions: [permissions.ViewStates] },
  { id: "districts", titleKey: "menu.districts", descriptionKey: "menu.districtsDescription", href: appRoutes.basicData.districts, icon: <MapIcon fontSize="small" />, permissions: [permissions.ViewDistricts] },
  { id: "address-types", titleKey: "menu.addressTypes", descriptionKey: "menu.addressTypesDescription", href: appRoutes.basicData.addressTypes, icon: <CategoryIcon fontSize="small" />, permissions: [permissions.ViewAddressTypes] },
  { id: "country-report", titleKey: "menu.countryReport", descriptionKey: "menu.countryReportDescription", href: appRoutes.basicData.countryReport, icon: <AssessmentRoundedIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
  { id: "global-presence", titleKey: "menu.globalPresence", descriptionKey: "menu.globalPresenceDescription", href: appRoutes.basicData.globalPresence, icon: <TravelExploreRoundedIcon fontSize="small" />, permissions: [permissions.ViewCountries] },
];

export const getBasicDataNavigation = (): readonly BasicDataNavigationItem[] => [
  {
    id: "geographic-data",
    titleKey: "menu.geographicData",
    descriptionKey: "menu.geographicDataDescription",
    href: appRoutes.basicData.index,
    icon: <MapIcon fontSize="small" />,
    permissions: [],
    children: geographicDataItems,
  },
];

export function getAuthorizedBasicDataNavigation(
  user: SessionClaims | null,
  items: readonly BasicDataNavigationItem[] = getBasicDataNavigation(),
): BasicDataNavigationItem[] {
  const visibleItems: BasicDataNavigationItem[] = [];

  for (const item of items) {
    const isGroup = Boolean(item.children);
    const children = item.children
      ? getAuthorizedBasicDataNavigation(user, item.children)
      : [];
    const itemAllowed =
      item.permissions.length === 0 ||
      isAuthorized(user, { permissions: item.permissions });

    if (isGroup && children.length > 0) visibleItems.push({ ...item, children });
    if (!isGroup && itemAllowed) visibleItems.push(item);
  }

  return visibleItems;
}
