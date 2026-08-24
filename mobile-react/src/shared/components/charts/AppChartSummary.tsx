import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppCard } from '@/src/shared/components/surfaces/AppCard';
import { AppText } from '@/src/shared/components/typography/AppText';
import type { AppChartSummaryItem } from './types';

interface AppChartSummaryProps {
  items: readonly AppChartSummaryItem[];
}

export function AppChartSummary({ items }: AppChartSummaryProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <AppCard
          accessibilityLabel={`${item.label}: ${item.value}`}
          accessible
          key={item.key}
          padding="sm"
          style={[styles.item, { backgroundColor: theme.colors.surfaceMuted }]}>
          <AppText color="muted" numberOfLines={2} variant="caption">{item.label}</AppText>
          <AppText variant="titleSmall" weight="800">{item.value}</AppText>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  item: { flexBasis: '47%', flexGrow: 1, minHeight: 70, gap: 2, justifyContent: 'space-between' },
});
