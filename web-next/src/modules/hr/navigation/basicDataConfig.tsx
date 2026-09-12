// basicDataConfig.tsx
import CategoryIcon from "@mui/icons-material/Category";
import { appRoutes } from "@/config/routes";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";
import type { NavigationItem } from "@/shared/components/layout/navigation";
import {
  getBasicDataNavigation,
  type BasicDataNavigationItem,
} from "@/modules/hr/basic-data/navigation/basicDataNavigation";

function toSidebarItem(item: BasicDataNavigationItem): NavigationItem {
  const children = item.children?.map(toSidebarItem);
  return createNavItem(
    item.titleKey,
    createColoredIcon(item.icon, "#5c7cbc"),
    item.href,
    undefined,
    [...item.permissions],
    children,
  );
}

export const getBasicDataConfig = () => {
  return {
    ...createNavSection(
      "basic-data",
      "menu.basicData",
      createColoredIcon(<CategoryIcon />, "#4a6da7"),
      getBasicDataNavigation().map(toSidebarItem),
    ),
    path: appRoutes.basicData.index,
  };
};
