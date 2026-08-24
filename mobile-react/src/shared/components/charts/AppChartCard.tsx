import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/src/shared/components/surfaces/AppCard';
import { AppText } from '@/src/shared/components/typography/AppText';

interface AppChartCardProps {
  title: string;
  subtitle?: string;
}

export function AppChartCard({ children, subtitle, title }: PropsWithChildren<AppChartCardProps>) {
  return (
    <AppCard padding="md" style={styles.card}>
      <View style={styles.header}>
        <AppText variant="label" weight="800">{title}</AppText>
        {subtitle ? <AppText color="muted" variant="caption">{subtitle}</AppText> : null}
      </View>
      {children}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: { gap: 2 },
});
