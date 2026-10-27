import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/src/core/constants/routes';
import { canAccessRoute, useAuth } from '@/src/platform/auth';
import { OfflineOperationsPolicyScreen } from '@/src/platform/offline-operations';
import { SystemLocalizationsScreen, CompanyLocalizationsScreen } from '@/src/platform/tenant-administration/company-localizations';
import { CompanyGeographicScopeScreen } from '@/src/platform/tenant-administration/company-geographic-scope';
import { ErrorLogSettingsScreen } from '@/src/platform/tools/error-logs';
import { LocalizationManagementScreen } from '@/src/platform/tools/localization';
import { AppFormTabs, ConfirmationDialog } from '@/src/shared/components';
import { discardUnsavedChanges, hasBusyUnsavedChanges, hasUnsavedChanges } from '@/src/shared/contexts/unsaved-changes-registry';
import { systemSettingsLinks } from './SystemSettingsLinks';

function SettingsPanel({ route }: { route: string }) {
  switch (route) {
    case ROUTES.systemUiTexts: return <SystemLocalizationsScreen/>;
    case ROUTES.errorLogSettings: return <ErrorLogSettingsScreen />;
    case ROUTES.administration.companyLocalizations: return <CompanyLocalizationsScreen />;
    case ROUTES.administration.offlineOperations: return <OfflineOperationsPolicyScreen />;
    case ROUTES.basicData.companyGeographicScope: return <CompanyGeographicScopeScreen />;
    case ROUTES.advancedTools.localizationApi: return <LocalizationManagementScreen />;
  }
}

/** Composes independent existing editors; the Shell supplies device-only preferences. */
export function SettingsTabs({ preferences }: { preferences: ReactNode }) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const visible = systemSettingsLinks.filter((link) => canAccessRoute(link.route, session));
  const tabs = [...visible.map((link) => ({ value: link.route, label: t(link.titleKey), icon: link.icon, content: <SettingsPanel route={link.route} /> })),
    { value: 'device-preferences', label: t('settings.devicePreferences'), icon: 'phone-portrait-outline' as const, content: preferences }];
  const [selected, setSelected] = useState(tabs[0].value);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const active = tabs.find((tab) => tab.value === selected)?.value ?? tabs[0].value;
  const change = (next: string) => {
    if (next === active || !tabs.some((tab) => tab.value === next) || hasBusyUnsavedChanges()) return;
    if (hasUnsavedChanges()) { setPendingTab(next); return; }
    setSelected(next);
  };
  return <>
    <AppFormTabs label={t('navigation.settings')} tabs={tabs} value={active} onChange={change} keepMounted={false} fillAvailable />
    <ConfirmationDialog visible={pendingTab !== null} title={t('discardChanges.title')}
      description={t('discardChanges.description')} confirmLabel={t('discardChanges.confirm')}
      onCancel={() => setPendingTab(null)} onConfirm={() => {
        if (!pendingTab) return;
        if (!discardUnsavedChanges()) return;
        setSelected(pendingTab);
        setPendingTab(null);
      }} />
  </>;
}
