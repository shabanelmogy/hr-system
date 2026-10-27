import { appRoutes } from "@/config/routes";
import { canAccessRoute } from "@/lib/auth/route-access";
import type { SessionClaims } from "@/lib/auth/session";

export const settingsTabs = [
  {id:"system-ui-texts",titleKey:"menu.systemUiTexts",route:appRoutes.platform.superAdmin.systemUiTexts},
  { id: "error-logs", titleKey: "menu.errorLogSettings", route: appRoutes.platform.superAdmin.errorLogSettings },
  { id: "company-localizations", titleKey: "menu.companyLocalizations", route: appRoutes.platform.administration.companyLocalizations },
  { id: "offline-operations", titleKey: "menu.offlineOperations", route: appRoutes.platform.administration.offlineOperations },
  { id: "company-geography", titleKey: "menu.companyGeographicScope", route: appRoutes.platform.companyGeographicScope },
  { id: "localization-messages", titleKey: "menu.localizationMessages", route: appRoutes.platform.advancedTools.localizationApi },
] as const;

export type SettingsTabId = (typeof settingsTabs)[number]["id"];
export function getAllowedSettingsTabs(user: SessionClaims | null) {
  return user ? settingsTabs.filter((tab) => canAccessRoute(tab.route, user)) : [];
}
