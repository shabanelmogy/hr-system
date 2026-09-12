import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, AppText } from '@/src/shared/components';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const requirements = [
    { label: t('auth.passwordLength'), met: password.length >= 8 },
    { label: t('auth.passwordUppercase'), met: /[A-Z]/.test(password) },
    { label: t('auth.passwordLowercase'), met: /[a-z]/.test(password) },
    { label: t('auth.passwordNumber'), met: /\d/.test(password) },
    { label: t('auth.passwordSymbol'), met: /[^A-Za-z0-9]/.test(password) },
  ];
  const metCount = requirements.filter(({ met }) => met).length;
  const strength = password.length === 0 ? 0 : Math.max(1, Math.ceil((metCount / 5) * 4));
  const strengthColor = strength <= 1
    ? theme.colors.danger
    : strength === 2
      ? theme.colors.warning
      : strength === 3
        ? theme.colors.secondary
        : theme.colors.success;
  const strengthLabel = strength <= 1
    ? t('auth.passwordWeak')
    : strength === 2
      ? t('auth.passwordFair')
      : strength === 3
        ? t('auth.passwordGood')
        : t('auth.passwordStrong');

  return (
    <View accessibilityLiveRegion="polite" style={styles.root}>
      <View style={[styles.strengthHeader, { direction }]}>
        <AppText color="muted" variant="caption">
          {t('auth.passwordStrength')}
        </AppText>
        <AppText style={{ color: strengthColor }} variant="caption" weight="700">
          {strengthLabel}
        </AppText>
      </View>
      <View style={[styles.strengthBars, { direction }]}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              {
                backgroundColor: level <= strength ? strengthColor : theme.colors.surfaceMuted,
                borderRadius: theme.radius.full,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.requirements}>
        {requirements.map((requirement) => (
          <View key={requirement.label} style={[styles.requirement, { direction }]}>
            <AppIcon
              color={requirement.met ? theme.colors.success : theme.colors.textMuted}
              name={requirement.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={17}
            />
            <AppText color={requirement.met ? 'success' : 'muted'} variant="caption">
              {requirement.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 5,
  },
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirement: {
    width: '48%',
    minWidth: 135,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
