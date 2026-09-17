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
      appRoutes.modules.reporting.crystalReports,
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
    entryCandidates: [appRoutes.modules.reporting.crystalReports],
    navigation: [{
      id: navigation.id,
      titleKey: navigation.title,
      entries: [{
        titleKey: "menu.crystalReportsManagement",
        path: appRoutes.modules.reporting.crystalReports,
        requiredPermissions: [permissions.ManageCrystalReportAccess],
      }],
    }],
    routePrefixes: [appRoutes.modules.reporting.crystalReports],
  }],
};
