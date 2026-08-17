import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { AppText } from '@/src/shared/components/typography/AppText';

export interface AppPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  compact?: boolean;
}

export function AppPageHeader({
  title,
  subtitle,
  action,
  compact = false,
}: AppPageHeaderProps) {
  const { direction } = useLocalization();

  return (
    <View style={[styles.container, compact && styles.compactContainer, { direction }]}>
      <View style={styles.text}>
        <AppText numberOfLines={1} variant="titleSmall">
          {title}
        </AppText>
        {!compact ? (
          <AppText color="muted" numberOfLines={1} variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  compactContainer: {
    marginBottom: 8,
  },
});
