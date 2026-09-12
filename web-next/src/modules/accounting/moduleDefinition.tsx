import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import type { FrontendModuleDefinition } from "@/platform/modules";

export const accountingModuleDefinition: FrontendModuleDefinition = {
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
  // The backend Accounting module currently publishes no business submodules.
  // New accounting features are registered here without shell changes.
  submodules: [],
};
