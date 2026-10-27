"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import TuneIcon from "@mui/icons-material/Tune";
import { useTranslation } from "react-i18next";
import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { PlatformAuthTranslationScope } from "@/locales/scopes/PlatformAuthTranslationScope";
import { PlatformAdvancedToolsTranslationScope } from "@/locales/scopes/PlatformAdvancedToolsTranslationScope";
import { FormTabs } from "@/shared/components/forms/layouts";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { FeedbackState } from "@/shared/components/feedback/states";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { getAllowedSettingsTabs, type SettingsTabId } from "./settingsTabs";

const SystemLocalizations = dynamic(() => import("@/platform/company-localizations").then(m=>m.SystemLocalizationsPage), {loading:RouteLoading});
const ErrorLogSettings = dynamic(() => import("@/platform/error-logs").then((m) => m.ErrorLogSettingsPage), { loading: RouteLoading });
const CompanyLocalizations = dynamic(() => import("@/platform/company-localizations").then((m) => m.CompanyLocalizationsPage), { loading: RouteLoading });
const OfflineOperations = dynamic(() => import("@/platform/offline-operations").then((m) => m.OfflineOperationsPage), { loading: RouteLoading });
const CompanyGeography = dynamic(() => import("@/platform/company-geographic-scope").then((m) => m.CompanyGeographicScopePage), { loading: RouteLoading });
const LocalizationMessages = dynamic(() => import("@/platform/advanced-tools").then((m) => m.LocalizationPage), { loading: RouteLoading });

function SettingsPanel({ id }: { id: SettingsTabId }) {
  switch (id) {
    case "system-ui-texts": return <PlatformAuthTranslationScope><SystemLocalizations/></PlatformAuthTranslationScope>;
    case "error-logs": return <PlatformAdvancedToolsTranslationScope><ErrorLogSettings /></PlatformAdvancedToolsTranslationScope>;
    case "company-localizations": return <PlatformAuthTranslationScope><CompanyLocalizations /></PlatformAuthTranslationScope>;
    case "offline-operations": return <PlatformAuthTranslationScope><OfflineOperations /></PlatformAuthTranslationScope>;
    case "company-geography": return <PlatformAuthTranslationScope><CompanyGeography /></PlatformAuthTranslationScope>;
    case "localization-messages": return <PlatformAdvancedToolsTranslationScope><LocalizationMessages /></PlatformAdvancedToolsTranslationScope>;
  }
}

export function PlatformSettingsPage({ requestedTab }: { requestedTab?: string }) {
  const { user } = useSession();
  const { t } = useTranslation("core");
  const router = useRouter();
  const { requestDiscard } = useUnsavedChanges();
  const visible = getAllowedSettingsTabs(user);
  const selected = visible.find((tab) => tab.id === requestedTab) ?? visible[0];
  if (!selected) return <FeedbackState icon={<TuneIcon />} title={t("menu.settings")} description={t("settingsWorkspace.forbidden")} />;

  const changeTab = async (id: SettingsTabId) => {
    if (id === selected.id || !visible.some((tab) => tab.id === id) || !await requestDiscard()) return;
    router.replace(`${appRoutes.platform.settings}?tab=${id}`);
  };
  return <ContentWrapper fillAvailable>
    <PageHeader title={t("menu.settings")} subTitle={t("settingsWorkspace.description")} />
    <FormTabs label={t("menu.settings")} value={selected.id} onChange={(id) => void changeTab(id)} keepMounted={false}
      tabs={visible.map((tab) => ({ value: tab.id, label: t(tab.titleKey), content: <SettingsPanel id={tab.id} /> }))}
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
      panelSx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "auto" }} />
  </ContentWrapper>;
}
