import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { type AppLanguage, useLocalization } from '@/src/core/localization';
import { useOnboarding } from '@/src/core/onboarding';
import { useMockDataPreferences } from '@/src/core/preferences';
import { clearApplicationCache } from '@/src/core/storage/app-cache';
import { type ThemeMode, useAppTheme } from '@/src/core/theme';
import {
  AppButton,
  AppCard,
  ConfirmationDialog,
  AppIcon,
  AppScreen,
  AppSegmentedControl,
  AppSwitchField,
  AppText,
  AppThemePalettePicker,
} from '@/src/shared/components';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, direction } = useLocalization();
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
    <AppScreen edges={['left', 'right']}>
      <View style={styles.heading}>
        <AppText variant="title">{t('settings.title')}</AppText>
        <AppText color="muted" variant="bodySmall">
          {t('settings.subtitle')}
        </AppText>
      </View>

      <AppCard style={styles.settingCard}>
        <View style={[styles.settingHeader, { direction }]}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.primary} name="language-outline" size={23} />
          </View>
          <View style={styles.settingText}>
            <AppText variant="label">{t('settings.language')}</AppText>
            <AppText color="muted" variant="bodySmall">
              {t('settings.languageHint')}
            </AppText>
          </View>
        </View>
        <AppSegmentedControl<AppLanguage>
          label={t('settings.language')}
          onChange={setLanguage}
          options={languageOptions}
          value={language}
        />
      </AppCard>

      <AppCard style={styles.settingCard}>
        <View style={[styles.settingHeader, { direction }]}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.secondary} name="color-palette-outline" size={23} />
          </View>
          <View style={styles.settingText}>
            <AppText variant="label">{t('settings.appearance')}</AppText>
            <AppText color="muted" variant="bodySmall">
              {t('settings.appearanceHint')}
            </AppText>
          </View>
        </View>
        <AppSegmentedControl<ThemeMode>
          label={t('settings.appearance')}
          onChange={setMode}
          options={themeOptions}
          value={mode}
        />
        <View style={[styles.paletteHeading, { direction }]}>
          <AppIcon color={theme.colors.primary} name="brush-outline" size={20} />
          <View style={styles.settingText}>
            <AppText variant="label">{t('settings.colorPalette')}</AppText>
            <AppText color="muted" variant="bodySmall">
              {t('settings.colorPaletteHint')}
            </AppText>
          </View>
        </View>
        <AppThemePalettePicker onChange={setPalette} value={palette} />
      </AppCard>

      <AppCard style={styles.settingCard}>
        <View style={[styles.settingHeader, { direction }]}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.warning} name="refresh-circle-outline" size={23} />
          </View>
          <View style={styles.settingText}>
            <AppText variant="label">{t('settings.debugTools')}</AppText>
            <AppText color="muted" variant="bodySmall">
              {t('settings.debugToolsHint')}
            </AppText>
          </View>
        </View>
        {__DEV__ ? (
          <AppSwitchField
            description={t('settings.mockDataHint')}
            icon="dice-outline"
            label={t('settings.mockData')}
            onValueChange={setMockDataEnabled}
            value={isMockDataEnabled}
          />
        ) : null}
        <AppButton
          fullWidth
          icon="refresh-circle-outline"
          onPress={() => setResetDialogVisible(true)}
          variant="warning">
          {t('settings.resetCache')}
        </AppButton>
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
  heading: {
    gap: 4,
    marginBottom: 24,
  },
  settingCard: {
    gap: 18,
    marginBottom: 14,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  paletteHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
