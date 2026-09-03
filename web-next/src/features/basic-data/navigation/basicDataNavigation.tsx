import CategoryIcon from "@mui/icons-material/Category";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import type { ReactNode } from "react";
import { appRoutes, type AppPath } from "@/config/routes";
import { isAuthorized } from "@/lib/auth/authorization";
import { permissions, type PermissionString } from "@/lib/auth/permissions";
import type { SessionClaims } from "@/lib/auth/session";

export interface BasicDataNavigationItem {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  href?: AppPath;
  icon: ReactNode;
  permissions: readonly PermissionString[];
  children?: readonly BasicDataNavigationItem[];
}

const geographicDataItems: readonly BasicDataNavigationItem[] = [
  { id: "address-types", titleKey: "menu.addressTypes", descriptionKey: "menu.addressTypesDescription", href: appRoutes.basicData.addressTypes, icon: <CategoryIcon fontSize="small" />, permissions: [permissions.ViewAddressTypes] },
];

const organizationalStructureItems: readonly BasicDataNavigationItem[] = [
  {
    id: "organizational-structure-branches",
    titleKey: "organizationalStructure.resources.branches",
    descriptionKey: "organizationalStructure.routeDescriptions.branches",
    href: appRoutes.basicData.organizationalStructure.branches,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-departments",
    titleKey: "organizationalStructure.resources.departments",
    descriptionKey: "organizationalStructure.routeDescriptions.departments",
    href: appRoutes.basicData.organizationalStructure.departments,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-divisions",
    titleKey: "organizationalStructure.resources.divisions",
    descriptionKey: "organizationalStructure.routeDescriptions.divisions",
    href: appRoutes.basicData.organizationalStructure.divisions,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-job-titles",
    titleKey: "organizationalStructure.resources.job-titles",
    descriptionKey: "organizationalStructure.routeDescriptions.job-titles",
    href: appRoutes.basicData.organizationalStructure.jobTitles,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-job-levels",
    titleKey: "organizationalStructure.resources.job-levels",
    descriptionKey: "organizationalStructure.routeDescriptions.job-levels",
    href: appRoutes.basicData.organizationalStructure.jobLevels,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-positions",
    titleKey: "organizationalStructure.resources.positions",
    descriptionKey: "organizationalStructure.routeDescriptions.positions",
    href: appRoutes.basicData.organizationalStructure.positions,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-job-descriptions",
    titleKey: "organizationalStructure.resources.job-descriptions",
    descriptionKey: "organizationalStructure.routeDescriptions.job-descriptions",
    href: appRoutes.basicData.organizationalStructure.jobDescriptions,
    icon: <BusinessRoundedIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-cost-centers",
    titleKey: "organizationalStructure.resources.cost-centers",
    descriptionKey: "organizationalStructure.routeDescriptions.cost-centers",
    href: appRoutes.basicData.organizationalStructure.costCenters,
    icon: <AccountBalanceWalletIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
  {
    id: "organizational-structure-currencies",
    titleKey: "organizationalStructure.resources.currencies",
    descriptionKey: "organizationalStructure.routeDescriptions.currencies",
    href: appRoutes.basicData.organizationalStructure.currencies,
    icon: <PaidIcon fontSize="small" />,
    permissions: [permissions.ViewOrganizationalStructure],
  },
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
    icon: <MapIcon fontSize="small" />,
    permissions: [],
    children: geographicDataItems,
  },
  {
    id: "organizational-structure",
    titleKey: "menu.organizationalStructure",
    descriptionKey: "menu.organizationalStructureDescription",
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
