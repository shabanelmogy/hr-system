import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { type AppLanguage, useLocalization } from '@/src/core/localization';
import { type ThemeMode, useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppIcon,
  AppScreen,
  AppSegmentedControl,
  AppText,
} from '@/src/shared/components';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, direction } = useLocalization();
  const { mode, setMode, theme } = useAppTheme();

  const languageOptions = [
    { label: t('settings.english'), value: 'en' },
    { label: t('settings.arabic'), value: 'ar' },
  ] as const;
  const themeOptions = [
    { label: t('settings.system'), value: 'system' },
    { label: t('settings.light'), value: 'light' },
    { label: t('settings.dark'), value: 'dark' },
  ] as const;

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
      </AppCard>

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
});
