import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName, AppText } from '@/src/shared/components';

interface OnboardingVisualProps {
  accentIcon: AppIconName;
  caption: string;
  icon: AppIconName;
  metrics: readonly { icon: AppIconName; label: string }[];
}

export function OnboardingVisual({
  accentIcon,
  caption,
  icon,
  metrics,
}: OnboardingVisualProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.visual,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}>
      <View style={[styles.visualHeader, { direction }]}>
        <View
          style={[
            styles.brandIcon,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md },
          ]}>
          <AppIcon color={theme.colors.onPrimary} name={icon} size={42} />
        </View>
        <View style={styles.caption}>
          <AppIcon color={theme.colors.secondary} name={accentIcon} size={24} />
          <AppText color="muted" variant="bodySmall" weight="700">
            {caption}
          </AppText>
        </View>
      </View>

      <View style={[styles.metrics, { direction }]}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metric,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
              },
            ]}>
            <AppIcon color={theme.colors.primary} name={metric.icon} size={20} />
            <AppText align="center" numberOfLines={2} variant="caption" weight="700">
              {metric.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  visual: {
    width: '100%',
    minHeight: 210,
    justifyContent: 'space-between',
    gap: 22,
    borderWidth: 1,
    padding: 20,
  },
  visualHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  brandIcon: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center' },
  caption: { flex: 1, minWidth: 0, gap: 8 },
  metrics: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  metric: {
    minHeight: 70,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    padding: 7,
  },
});
