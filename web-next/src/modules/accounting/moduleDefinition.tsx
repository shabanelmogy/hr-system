import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SchemaRoundedIcon from "@mui/icons-material/SchemaRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

const ledgerSetupNavigation = createNavSection(
  "ledger-setup",
  "menu.ledgerSetup",
  createColoredIcon(<AccountBalanceRoundedIcon />, "#059669"),
  [
    createNavItem("menu.fiscalYears", createColoredIcon(<CalendarMonthRoundedIcon />, "#8e24aa"), appRoutes.modules.accounting.ledgerSetup.fiscalYears, undefined, [permissions.ViewFiscalYears]),
    createNavItem("menu.accountingSettings", createColoredIcon(<SettingsRoundedIcon />, "#059669"), appRoutes.modules.accounting.ledgerSetup.accountingSettings, undefined, [permissions.ViewAccountingSetup]),
    createNavItem(
      "menu.currencies",
      createColoredIcon(<PaidRoundedIcon />, "#10b981"),
      appRoutes.modules.accounting.ledgerSetup.currencies,
      undefined,
      [permissions.ViewAccountingSetup],
    ),
    createNavItem("menu.chartOfAccounts", createColoredIcon(<AccountTreeRoundedIcon />, "#0ea5e9"), appRoutes.modules.accounting.ledgerSetup.accounts, undefined, [permissions.ViewAccounts]),
    createNavItem("menu.hierarchyLevels", createColoredIcon(<SchemaRoundedIcon />, "#2563eb"), appRoutes.modules.accounting.ledgerSetup.hierarchyLevels, undefined, [permissions.ViewAccounts]),
    createNavItem("menu.dimensions", createColoredIcon(<SchemaRoundedIcon />, "#7c3aed"), appRoutes.modules.accounting.ledgerSetup.dimensions, undefined, [permissions.ViewDimensions]),
    createNavItem("menu.books", createColoredIcon(<MenuBookRoundedIcon />, "#be123c"), appRoutes.modules.accounting.ledgerSetup.books, undefined, [permissions.ViewAccountingSetup]),
    createNavItem("menu.journals", createColoredIcon(<MenuBookRoundedIcon />, "#e11d48"), appRoutes.modules.accounting.ledgerSetup.journals, undefined, [permissions.ViewAccountingSetup]),
    createNavItem("menu.exchangeRates", createColoredIcon(<CurrencyExchangeRoundedIcon />, "#0891b2"), appRoutes.modules.accounting.ledgerSetup.exchangeRates, undefined, [permissions.ViewAccountingSetup]),
    createNavItem("menu.accountDetermination", createColoredIcon(<RuleRoundedIcon />, "#d97706"), appRoutes.modules.accounting.ledgerSetup.accountDetermination, undefined, [permissions.ViewAccountingSetup]),
  ],
  undefined,
  undefined,
);

export const accountingModuleDefinition: FrontendModuleDefinition = {
  navigation: [ledgerSetupNavigation],
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
      code: "ledger-setup",
      name: "Ledger setup",
      icon: <PaidRoundedIcon />,
      tone: "success",
      requiredPermissions: [],
      entryCandidates: [
        appRoutes.modules.accounting.ledgerSetup.index,
        appRoutes.modules.accounting.ledgerSetup.fiscalYears,
        appRoutes.modules.accounting.ledgerSetup.accountingSettings,
        appRoutes.modules.accounting.ledgerSetup.currencies,
        appRoutes.modules.accounting.ledgerSetup.accounts,
        appRoutes.modules.accounting.ledgerSetup.hierarchyLevels,
        appRoutes.modules.accounting.ledgerSetup.dimensions,
        appRoutes.modules.accounting.ledgerSetup.books,
        appRoutes.modules.accounting.ledgerSetup.journals,
        appRoutes.modules.accounting.ledgerSetup.exchangeRates,
        appRoutes.modules.accounting.ledgerSetup.accountDetermination,
      ],
      navigation: [{
        id: ledgerSetupNavigation.id,
        titleKey: ledgerSetupNavigation.title,
        entries: (ledgerSetupNavigation.items ?? []).map(item => ({ titleKey: item.title, path: item.path!, requiredPermissions: item.permissions ?? [] })),
      }],
      routePrefixes: [appRoutes.modules.accounting.ledgerSetup.index],
    },
  ],
};
