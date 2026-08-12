import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName, AppText } from '@/src/shared/components';

interface LoginFeature {
  description: string;
  icon: AppIconName;
  title: string;
}

export function LeftPanel() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const features: LoginFeature[] = [
    {
      icon: 'shield-checkmark-outline',
      title: t('auth.secureAccess'),
      description: t('auth.secureAccessDescription'),
    },
    {
      icon: 'finger-print-outline',
      title: t('auth.dataPrivacy'),
      description: t('auth.dataPrivacyDescription'),
    },
    {
      icon: 'stats-chart-outline',
      title: t('auth.analytics'),
      description: t('auth.analyticsDescription'),
    },
  ];

  return (
    <View style={[styles.panel, { direction, backgroundColor: theme.colors.primary }]}>
      <View
        pointerEvents="none"
        style={[
          styles.decorativeCircle,
          styles.circleTop,
          { backgroundColor: theme.colors.secondary },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.decorativeCircle,
          styles.circleBottom,
          { backgroundColor: theme.colors.accent },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.intro}>
          <AppText style={{ color: theme.colors.onPrimary }} variant="display">
            {t('auth.welcomeBack')}
          </AppText>
          <View style={[styles.underline, { backgroundColor: theme.colors.onPrimary }]} />
          <AppText style={{ color: theme.colors.onPrimary }} variant="bodySmall">
            {t('auth.loginToAccessYourAccount')}
          </AppText>
        </View>

        <View style={styles.features}>
          {features.map((feature) => (
            <View key={feature.title} style={[styles.feature, { direction }]}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: theme.colors.onPrimary,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppIcon color={theme.colors.primary} name={feature.icon} size={24} />
              </View>
              <View style={styles.featureCopy}>
                <AppText
                  style={{ color: theme.colors.onPrimary }}
                  variant="label"
                  weight="700">
                  {feature.title}
                </AppText>
                <AppText style={{ color: theme.colors.onPrimary }} variant="caption">
                  {feature.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <AppText style={{ color: theme.colors.onPrimary }} variant="caption">
          © {new Date().getFullYear()} {t('common.appName')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 0.9,
    minWidth: 330,
    minHeight: 560,
    overflow: 'hidden',
    padding: 32,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  intro: {
    gap: 10,
  },
  underline: {
    width: 62,
    height: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  features: {
    gap: 22,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    gap: 2,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.12,
  },
  circleTop: {
    top: -92,
    right: -74,
  },
  circleBottom: {
    bottom: -116,
    left: -92,
  },
});
