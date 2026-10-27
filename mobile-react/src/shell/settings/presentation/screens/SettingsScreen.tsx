import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { type AppLanguage, useLocalization } from '@/src/core/localization';
import { useOnboarding } from '@/src/core/onboarding';
import { useMockDataPreferences } from '@/src/core/preferences';
import { clearApplicationCache } from '@/src/core/storage/app-cache';
import { type ThemeMode, useAppTheme } from '@/src/core/theme';
import { SettingsTabs } from '@/src/platform/navigation';
import {
  AppButton,
  AppCard,
  ConfirmationDialog,
  AppFormSection,
  AppScreen,
  AppPageHeader,
  AppSegmentedControl,
  AppSwitchField,
  AppThemePalettePicker,
} from '@/src/shared/components';

export function SettingsScreen() {
  const { t } = useTranslation();
  return <AppScreen edges={['left', 'right']} scroll={false} padded={false} keyboardAware={false} contentContainerStyle={styles.workspace}
    header={<AppPageHeader title={t('settings.title')} subtitle={t('settings.workspaceDescription')} />}>
    <SettingsTabs preferences={<DevicePreferences />} />
  </AppScreen>;
}

function DevicePreferences() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLocalization();
  const { mode, palette, setMode, setPalette, theme } = useAppTheme();
  const { isMockDataEnabled, setMockDataEnabled } = useMockDataPreferences();
  const { reset: resetOnboarding } = useOnboarding();
  const [resetDialogVisible, setResetDialogVisible] = useState(false);

  const languageOptions = [
    { label: t('settings.english'), value: 'en' },
    { label: t('settings.arabic'), value: 'ar' },
  ] as const;
  const themeOptions = [
    { label: t('settings.system'), value: 'system' },
    { label: t('settings.light'), value: 'light' },
    { label: t('settings.dark'), value: 'dark' },
  ] as const;

  const resetCache = async () => {
    await clearApplicationCache();
    setLanguage('en');
    setMode('system');
    setPalette('green');
    setMockDataEnabled(true);
    setResetDialogVisible(false);
    await resetOnboarding();
  };

  return (
    <AppScreen edges={['left', 'right']} contentContainerStyle={{ gap: theme.spacing.md }}>
      <AppPageHeader title={t('settings.devicePreferences')} subtitle={t('settings.subtitle')} />

      <AppCard padding="md">
        <AppFormSection divider={false} title={t('settings.language')} description={t('settings.languageHint')} icon="language-outline">
          <AppSegmentedControl<AppLanguage> label={t('settings.language')} onChange={setLanguage} options={languageOptions} value={language} />
        </AppFormSection>
      </AppCard>
      <AppCard padding="md" style={{ gap: theme.spacing.md }}>
        <AppFormSection title={t('settings.appearance')} description={t('settings.appearanceHint')} icon="color-palette-outline">
          <AppSegmentedControl<ThemeMode> label={t('settings.appearance')} onChange={setMode} options={themeOptions} value={mode} />
        </AppFormSection>
        <AppFormSection divider={false} title={t('settings.colorPalette')} description={t('settings.colorPaletteHint')} icon="brush-outline">
          <AppThemePalettePicker onChange={setPalette} value={palette} />
        </AppFormSection>
      </AppCard>
      <AppCard padding="md">
        <AppFormSection divider={false} title={t('settings.debugTools')} description={t('settings.debugToolsHint')} icon="refresh-circle-outline">
          {__DEV__ ? <AppSwitchField description={t('settings.mockDataHint')} icon="dice-outline" label={t('settings.mockData')}
            onValueChange={setMockDataEnabled} value={isMockDataEnabled} /> : null}
          <AppButton fullWidth icon="refresh-circle-outline" onPress={() => setResetDialogVisible(true)} variant="warning">
            {t('settings.resetCache')}
          </AppButton>
        </AppFormSection>
      </AppCard>

      <ConfirmationDialog
        confirmLabel={t('settings.resetCacheConfirm')}
        description={t('settings.resetCacheDescription')}
        icon="refresh-circle-outline"
        onCancel={() => setResetDialogVisible(false)}
        onConfirm={resetCache}
        title={t('settings.resetCacheTitle')}
        tone="warning"
        visible={resetDialogVisible}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  workspace: { flex: 1, minHeight: 0 },
});
