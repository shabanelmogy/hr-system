import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';
import type { AppChartDatum } from './types';

interface AppHorizontalBarChartProps {
  data: readonly AppChartDatum[];
  emptyLabel: string;
  valueFormatter?: (value: number) => string;
}

export function AppHorizontalBarChart({
  data,
  emptyLabel,
  valueFormatter = String,
}: AppHorizontalBarChartProps) {
  const { theme } = useAppTheme();
  const maximum = Math.max(0, ...data.map((item) => item.value));

  if (data.length === 0 || maximum <= 0) {
    return <AppText align="center" color="muted" variant="bodySmall">{emptyLabel}</AppText>;
  }

  return (
    <View style={styles.chart}>
      {data.map((item) => {
        const value = valueFormatter(item.value);
        const width = `${Math.max(4, (item.value / maximum) * 100)}%` as `${number}%`;
        return (
          <View
            accessibilityLabel={`${item.label}: ${value}`}
            accessible
            key={item.key}
            style={styles.row}>
            <View style={styles.labels}>
              <AppText numberOfLines={1} style={styles.name} variant="caption">{item.label}</AppText>
              <AppText color="muted" variant="caption" weight="700">{value}</AppText>
            </View>
            <View
              accessible={false}
              importantForAccessibility="no"
              style={[
                styles.track,
                { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
              ]}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: item.color ?? theme.colors.primary,
                    borderRadius: theme.radius.full,
                    width,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: 10 },
  row: { gap: 4 },
  labels: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  name: { flex: 1 },
  track: { height: 10, overflow: 'hidden', width: '100%' },
  bar: { height: '100%' },
});
