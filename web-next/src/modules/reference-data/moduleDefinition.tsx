import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

const navigation = createNavSection(
  "referenceData",
  "menu.geographicData",
  createColoredIcon(<PublicRoundedIcon />, "#0891b2"),
  [
    createNavItem(
      "menu.addressTypes",
      createColoredIcon(<CategoryRoundedIcon />, "#06b6d4"),
      appRoutes.modules.referenceData.addressTypes,
      undefined,
      [permissions.ViewAddressTypes],
    ),
  ],
  undefined,
  [permissions.ViewAddressTypes],
);

export const referenceDataModuleDefinition: FrontendModuleDefinition = {
  navigation: [navigation],
  code: "reference-data",
  name: "ReferenceData",
  icon: <PublicRoundedIcon />,
  tone: "info",
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: "addresses",
    name: "Addresses",
    icon: <CategoryRoundedIcon />,
    tone: "info",
    requiredPermissions: [permissions.ViewAddressTypes],
    entryCandidates: [appRoutes.modules.referenceData.addressTypes],
    navigation: [{
      id: navigation.id,
      titleKey: navigation.title,
      entries: [{
        titleKey: "menu.addressTypes",
        path: appRoutes.modules.referenceData.addressTypes,
        requiredPermissions: [permissions.ViewAddressTypes],
      }],
    }],
    routePrefixes: [appRoutes.modules.referenceData.addressTypes],
  }],
};
