import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { spacing, useAppTheme } from '@/src/core/theme';
import { AppText } from '@/src/shared/components/typography/AppText';
import { getChartColor } from './chart-colors';
import type { AppChartDatum } from './types';

interface AppRingChartProps {
  centerLabel: string;
  data: readonly AppChartDatum[];
  emptyLabel: string;
  valueFormatter?: (value: number) => string;
}

const segmentCount = 48;
const segmentWidth = 5;
const segmentHeight = 12;

export function AppRingChart({
  centerLabel,
  data,
  emptyLabel,
  valueFormatter = String,
}: AppRingChartProps) {
  const { theme } = useAppTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const visible = data.filter((item) => item.value > 0);
  const total = visible.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    return <AppText align="center" color="muted" variant="bodySmall">{emptyLabel}</AppText>;
  }

  const items = visible.map((item, index) => ({
    ...item,
    color: getChartColor(theme.colors, index, item.color),
  }));
  const summary = items
    .map((item) => `${item.label}: ${valueFormatter(item.value)}`)
    .join(', ');
  const accessibilitySummary = `${centerLabel}: ${valueFormatter(total)}. ${summary}`;
  const ringSize = Math.min(176, Math.max(144, viewportWidth - 96));
  const ringCenter = ringSize / 2;
  const ringRadius = ringSize * 0.4;
  const centerSize = ringSize * 0.58;

  let cumulativeValue = 0;
  const thresholds = items.map((item) => {
    cumulativeValue += item.value;
    return cumulativeValue;
  });

  return (
    <View accessibilityLabel={accessibilitySummary} accessible style={styles.root}>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.ring, { height: ringSize, width: ringSize }]}>
        {Array.from({ length: segmentCount }, (_, index) => {
          const target = ((index + 0.5) / segmentCount) * total;
          const matchingIndex = thresholds.findIndex((threshold) => target <= threshold);
          const itemIndex = matchingIndex === -1 ? items.length - 1 : matchingIndex;
          const angle = (index / segmentCount) * Math.PI * 2 - Math.PI / 2;

          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor: items[itemIndex].color,
                  borderRadius: theme.radius.full,
                  left: ringCenter + ringRadius * Math.cos(angle) - segmentWidth / 2,
                  top: ringCenter + ringRadius * Math.sin(angle) - segmentHeight / 2,
                  transform: [{ rotate: `${(angle * 180) / Math.PI + 90}deg` }],
                },
              ]}
            />
          );
        })}
        <View
          style={[
            styles.center,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.full,
              height: centerSize,
              left: (ringSize - centerSize) / 2,
              top: (ringSize - centerSize) / 2,
              width: centerSize,
            },
          ]}>
          <AppText variant="titleSmall" weight="800">{valueFormatter(total)}</AppText>
          <AppText align="center" color="muted" numberOfLines={2} variant="caption">
            {centerLabel}
          </AppText>
        </View>
      </View>
      <View style={styles.legend}>
        {items.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View
              accessible={false}
              importantForAccessibility="no"
              style={[
                styles.dot,
                { backgroundColor: item.color, borderRadius: theme.radius.full },
              ]}
            />
            <AppText numberOfLines={2} style={styles.legendLabel} variant="caption">
              {item.label}
            </AppText>
            <AppText color="muted" variant="caption" weight="700">
              {valueFormatter(item.value)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.sm, width: '100%' },
  ring: { position: 'relative' },
  segment: { height: segmentHeight, position: 'absolute', width: segmentWidth },
  center: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    padding: spacing.sm,
    position: 'absolute',
  },
  legend: { gap: spacing.xs, width: '100%' },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  legendLabel: { flex: 1 },
  dot: { height: 10, width: 10 },
});
