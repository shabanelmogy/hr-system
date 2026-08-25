import CategoryIcon from "@mui/icons-material/Category";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
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
  { id: "address-types", titleKey: "menu.addressTypes", descriptionKey: "menu.addressTypesDescription", href: appRoutes.basicData.addressTypes, icon: <CategoryIcon fontSize="small" />, permissions: [permissions.ViewAddressTypes] },
];

const organizationalStructureItems: readonly BasicDataNavigationItem[] = [
  {
    id: "company-geographic-scope",
    titleKey: "menu.companyGeographicScope",
    descriptionKey: "menu.companyGeographicScopeDescription",
    href: appRoutes.basicData.companyGeographicScope,
    icon: <PublicIcon fontSize="small" />,
    permissions: [permissions.ViewCompanyGeographicScope],
  },
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
  {
    id: "organizational-structure",
    titleKey: "menu.organizationalStructure",
    descriptionKey: "menu.organizationalStructureDescription",
    href: appRoutes.basicData.index,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [],
    children: organizationalStructureItems,
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
