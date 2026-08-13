import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { type AppLanguage, useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppText } from '@/src/shared/components';

const languages: readonly {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  writingDirection: 'ltr' | 'rtl';
}[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', writingDirection: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', writingDirection: 'rtl' },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View accessibilityLabel={t('onboarding.languageTitle')} style={styles.options}>
      {languages.map((option) => {
        const selected = language === option.code;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option.code}
            onPress={() => setLanguage(option.code)}
            style={({ pressed }) => [
              styles.option,
              compact ? styles.optionCompact : null,
              {
                direction: option.writingDirection,
                backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.78 : 1,
              },
            ]}>
            <View
              style={[
                styles.languageMark,
                compact ? styles.languageMarkCompact : null,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceMuted,
                  borderRadius: theme.radius.sm,
                },
              ]}>
              <AppText
                align="center"
                style={{
                  color: selected ? theme.colors.onPrimary : theme.colors.text,
                  writingDirection: option.writingDirection,
                }}
                variant={compact ? 'label' : 'titleSmall'}>
                {option.code === 'ar' ? 'ع' : 'EN'}
              </AppText>
            </View>
            <AppText
              align="center"
              numberOfLines={1}
              style={[
                { writingDirection: option.writingDirection },
                compact ? styles.languageLabelCompact : null,
              ]}
              variant="label"
              weight="800">
              {option.nativeLabel}
            </AppText>
            {selected ? (
              <AppIcon color={theme.colors.primary} name="checkmark-circle" size={compact ? 20 : 23} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { width: '100%', flexDirection: 'row', gap: 12 },
  option: {
    minHeight: 118,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    padding: 12,
  },
  optionCompact: {
    minHeight: 60,
    flexDirection: 'row',
    gap: 6,
    padding: 8,
  },
  languageMark: { minWidth: 54, height: 44, alignItems: 'center', justifyContent: 'center' },
  languageMarkCompact: { minWidth: 36, height: 36 },
  languageLabelCompact: { flex: 1, minWidth: 0 },
});
