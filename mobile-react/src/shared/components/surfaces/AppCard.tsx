import type { PropsWithChildren } from 'react';
import { Pressable, type PressableProps, StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/src/core/theme';

interface AppCardProps extends ViewProps {
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
}

export function AppCard({
  children,
  onPress,
  accessibilityLabel,
  style,
  ...props
}: PropsWithChildren<AppCardProps>) {
  const { theme } = useAppTheme();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View {...props} style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.82,
  },
});
