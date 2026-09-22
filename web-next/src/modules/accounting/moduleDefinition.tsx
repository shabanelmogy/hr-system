import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
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
      appRoutes.modules.accounting.fiscalYears,
      undefined,
      [permissions.ViewFiscalYears],
    ),
  ],
  undefined,
  [permissions.ViewFiscalYears],
);

const ledgerSetupNavigation = createNavSection(
  "ledger-setup",
  "menu.ledgerSetup",
  createColoredIcon(<AccountBalanceRoundedIcon />, "#059669"),
  [
    createNavItem(
      "menu.currencies",
      createColoredIcon(<PaidRoundedIcon />, "#10b981"),
      appRoutes.modules.accounting.ledgerSetup.currencies,
      undefined,
      [permissions.ViewAccountingSetup],
    ),
  ],
  undefined,
  [permissions.ViewAccountingSetup],
);

export const accountingModuleDefinition: FrontendModuleDefinition = {
  navigation: [fiscalYearsNavigation, ledgerSetupNavigation],
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
      entryCandidates: [appRoutes.modules.accounting.fiscalYears],
      navigation: [{
        id: fiscalYearsNavigation.id,
        titleKey: fiscalYearsNavigation.title,
        entries: [{
          titleKey: "menu.fiscalYears",
          path: appRoutes.modules.accounting.fiscalYears,
          requiredPermissions: [permissions.ViewFiscalYears],
        }],
      }],
      routePrefixes: [appRoutes.modules.accounting.fiscalYears],
    },
    {
      code: "ledger-setup",
      name: "Ledger setup",
      icon: <PaidRoundedIcon />,
      tone: "success",
      requiredPermissions: [permissions.ViewAccountingSetup],
      entryCandidates: [appRoutes.modules.accounting.ledgerSetup.currencies],
      navigation: [{
        id: ledgerSetupNavigation.id,
        titleKey: ledgerSetupNavigation.title,
        entries: [{
          titleKey: "menu.currencies",
          path: appRoutes.modules.accounting.ledgerSetup.currencies,
          requiredPermissions: [permissions.ViewAccountingSetup],
        }],
      }],
      routePrefixes: [appRoutes.modules.accounting.ledgerSetup.currencies],
    },
  ],
};
