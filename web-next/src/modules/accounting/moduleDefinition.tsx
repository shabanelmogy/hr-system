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
  createColoredIcon(<AccountBalanceRoundedIcon />, "accounting"),
  [
    createNavItem("menu.fiscalYears", createColoredIcon(<CalendarMonthRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.fiscalYears, undefined, [permissions.ViewFiscalYears]),
    createNavItem("menu.accountingSettings", createColoredIcon(<SettingsRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.accountingSettings, undefined, [permissions.ViewAccountingSettings]),
    createNavItem(
      "menu.currencies",
      createColoredIcon(<PaidRoundedIcon />, "accounting"),
      appRoutes.modules.accounting.ledgerSetup.currencies,
      undefined,
      [permissions.ViewCurrencies],
    ),
    createNavItem("menu.chartOfAccounts", createColoredIcon(<AccountTreeRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.accounts, undefined, [permissions.ViewAccounts]),
    createNavItem("menu.hierarchyLevels", createColoredIcon(<SchemaRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.hierarchyLevels, undefined, [permissions.ViewAccountHierarchyLevels]),
    createNavItem("menu.dimensions", createColoredIcon(<SchemaRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.dimensions, undefined, [permissions.ViewDimensionDefinitions, permissions.ViewDimensionValues, permissions.ViewAccountDimensionPolicies]),
    createNavItem("menu.books", createColoredIcon(<MenuBookRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.books, undefined, [permissions.ViewBooks]),
    createNavItem("menu.journals", createColoredIcon(<MenuBookRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.journals, undefined, [permissions.ViewJournalDefinitions]),
    createNavItem("menu.exchangeRates", createColoredIcon(<CurrencyExchangeRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.exchangeRates, undefined, [permissions.ViewExchangeRateTypes, permissions.ViewExchangeRates]),
    createNavItem("menu.accountDetermination", createColoredIcon(<RuleRoundedIcon />, "accounting"), appRoutes.modules.accounting.ledgerSetup.accountDetermination, undefined, [permissions.ViewAccountMappings, permissions.ViewPostingProfiles]),
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
  accentColor: "accounting",
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
