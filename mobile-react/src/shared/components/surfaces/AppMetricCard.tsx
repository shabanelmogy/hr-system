import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppCard, type AppCardProps } from '@/src/shared/components/surfaces/AppCard';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppMetricCardProps extends Omit<AppCardProps, 'children' | 'style'> {
  icon: AppIconName;
  label: string;
  value: ReactNode;
  color?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppMetricCard({
  icon,
  label,
  value,
  color,
  subtitle,
  style,
  ...cardProps
}: AppMetricCardProps) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const resolvedColor = color ?? theme.colors.primary;

  return (
    <AppCard {...cardProps} style={[styles.card, style]}>
      <View style={[styles.header, { direction }]}>
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
          ]}>
          <AppIcon color={resolvedColor} name={icon} size={23} />
        </View>
        <AppText color="muted" numberOfLines={2} style={styles.label} variant="bodySmall">
          {label}
        </AppText>
      </View>
      <AppText variant="display">{value}</AppText>
      {subtitle ? (
        <AppText color="muted" variant="caption">
          {subtitle}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
