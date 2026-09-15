import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

const fiscalYearsNavigation = createNavSection(
  "finance",
  "menu.finance",
  createColoredIcon(<AccountBalanceRoundedIcon />, "#7b1fa2"),
  [
    createNavItem(
      "menu.fiscalYears",
      createColoredIcon(<CalendarMonthRoundedIcon />, "#8e24aa"),
      appRoutes.finance.fiscalYears,
      undefined,
      [permissions.ViewFiscalYears],
    ),
  ],
  undefined,
  [permissions.ViewFiscalYears],
);

export const accountingModuleDefinition: FrontendModuleDefinition = {
  navigation: [fiscalYearsNavigation],
  code: "acc",
  name: "Accounting",
  icon: <AccountBalanceRoundedIcon />,
  tone: "success",
  accentColor: "#10B981",
  requiredDependencies: [],
  optionalDependencies: [],
  translationNamespace: "module-accounting",
  loadTranslations: async (language) => (
    language === "ar"
      ? (await import("./locales/ar.json")).default
      : (await import("./locales/en.json")).default
  ),
  submodules: [
    {
      code: "fiscal-years",
      name: "Fiscal years",
      icon: <CalendarMonthRoundedIcon />,
      tone: "success",
      requiredPermissions: [permissions.ViewFiscalYears],
      entryCandidates: [appRoutes.finance.fiscalYears],
      navigation: [{
        id: fiscalYearsNavigation.id,
        titleKey: fiscalYearsNavigation.title,
        entries: [{
          titleKey: "menu.fiscalYears",
          path: appRoutes.finance.fiscalYears,
          requiredPermissions: [permissions.ViewFiscalYears],
        }],
      }],
      routePrefixes: [appRoutes.finance.fiscalYears],
    },
  ],
};
