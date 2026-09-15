import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

const navigation = createNavSection(
  "reporting",
  "menu.crystalReportsManagement",
  createColoredIcon(<InsightsRoundedIcon />, "#0284c7"),
  [
    createNavItem(
      "menu.crystalReportsManagement",
      createColoredIcon(<AssessmentRoundedIcon />, "#0ea5e9"),
      appRoutes.auth.crystalReportsPage,
      undefined,
      [permissions.ManageCrystalReportAccess],
    ),
  ],
  undefined,
  [permissions.ManageCrystalReportAccess],
);

export const reportingModuleDefinition: FrontendModuleDefinition = {
  navigation: [navigation],
  code: "reporting",
  name: "Reporting",
  icon: <InsightsRoundedIcon />,
  tone: "info",
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: "analytics",
    name: "Analytics",
    icon: <AssessmentRoundedIcon />,
    tone: "info",
    requiredPermissions: [
      permissions.ViewCrystalReports,
      permissions.ManageCrystalReportAccess,
    ],
    entryCandidates: [appRoutes.auth.crystalReportsPage],
    navigation: [{
      id: navigation.id,
      titleKey: navigation.title,
      entries: [{
        titleKey: "menu.crystalReportsManagement",
        path: appRoutes.auth.crystalReportsPage,
        requiredPermissions: [permissions.ManageCrystalReportAccess],
      }],
    }],
    routePrefixes: [appRoutes.auth.crystalReportsPage],
  }],
};
