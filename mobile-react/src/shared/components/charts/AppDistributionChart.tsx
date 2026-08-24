import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';
import { getChartColor } from './chart-colors';
import type { AppChartDatum } from './types';

interface AppDistributionChartProps {
  data: readonly AppChartDatum[];
  emptyLabel: string;
}

export function AppDistributionChart({ data, emptyLabel }: AppDistributionChartProps) {
  const { theme } = useAppTheme();
  const visible = data.filter((item) => item.value > 0);
  const total = visible.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return <AppText align="center" color="muted" variant="bodySmall">{emptyLabel}</AppText>;
  }

  const items = visible.map((item, index) => ({
    ...item,
    color: getChartColor(theme.colors, index, item.color),
  }));
  const summary = items.map((item) => `${item.label}: ${item.value}`).join(', ');

  return (
    <View accessibilityLabel={summary} accessible style={styles.root}>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[
          styles.distribution,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
        ]}>
        {items.map((item) => (
          <View
            key={item.key}
            style={{ backgroundColor: item.color, flex: item.value, minWidth: 3 }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {items.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View
              accessible={false}
              importantForAccessibility="no"
              style={[styles.dot, { backgroundColor: item.color, borderRadius: theme.radius.full }]}
            />
            <AppText numberOfLines={1} style={styles.legendLabel} variant="caption">
              {item.label}
            </AppText>
            <AppText color="muted" variant="caption" weight="700">{item.value}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  distribution: { flexDirection: 'row', height: 18, overflow: 'hidden', width: '100%' },
  legend: { gap: 7 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  legendLabel: { flex: 1 },
  dot: { height: 10, width: 10 },
});
