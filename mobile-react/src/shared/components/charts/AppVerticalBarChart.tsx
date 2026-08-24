import { StyleSheet, View } from 'react-native';

import { spacing, useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';
import { getChartColor } from './chart-colors';
import type { AppChartDatum } from './types';

interface AppVerticalBarChartProps {
  data: readonly AppChartDatum[];
  emptyLabel: string;
  valueFormatter?: (value: number) => string;
}

export function AppVerticalBarChart({
  data,
  emptyLabel,
  valueFormatter = String,
}: AppVerticalBarChartProps) {
  const { theme } = useAppTheme();
  const maximum = Math.max(0, ...data.map((item) => item.value));

  if (data.length === 0 || maximum <= 0) {
    return <AppText align="center" color="muted" variant="bodySmall">{emptyLabel}</AppText>;
  }

  const summary = data
    .map((item) => `${item.label}: ${valueFormatter(item.value)}`)
    .join(', ');

  return (
    <View accessibilityLabel={summary} accessible style={styles.root}>
      <View accessible={false} importantForAccessibility="no" style={styles.plot}>
        {data.map((item, index) => {
          const value = valueFormatter(item.value);
          const height = `${Math.max(6, (item.value / maximum) * 100)}%` as `${number}%`;

          return (
            <View key={item.key} style={styles.column}>
              <AppText numberOfLines={1} variant="caption" weight="700">{value}</AppText>
              <View
                style={[
                  styles.track,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: getChartColor(theme.colors, index, item.color),
                      borderRadius: theme.radius.sm,
                      height,
                    },
                  ]}
                />
              </View>
              <AppText align="center" numberOfLines={2} style={styles.label} variant="caption">
                {item.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  plot: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 160,
    width: '100%',
  },
  column: { alignItems: 'center', flex: 1, gap: spacing.xs, minWidth: 0 },
  track: { height: 104, justifyContent: 'flex-end', maxWidth: 38, overflow: 'hidden', width: '100%' },
  bar: { minHeight: 6, width: '100%' },
  label: { width: '100%' },
});
