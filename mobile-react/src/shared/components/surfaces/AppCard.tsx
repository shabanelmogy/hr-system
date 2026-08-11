import type { PropsWithChildren } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/src/core/theme';

export type AppCardVariant = 'outlined' | 'elevated' | 'filled';
export type AppCardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface AppCardProps extends Omit<ViewProps, 'style'> {
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
  variant?: AppCardVariant;
  padding?: AppCardPadding;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
}

export function AppCard({
  children,
  onPress,
  disabled = false,
  variant = 'outlined',
  padding = 'lg',
  style,
  pressedStyle,
  accessibilityState,
  ...props
}: PropsWithChildren<AppCardProps>) {
  const { theme } = useAppTheme();
  const paddingMap: Record<AppCardPadding, number> = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };
  const variantStyle: ViewStyle = variant === 'elevated'
    ? {
        backgroundColor: theme.colors.surface,
        borderColor: 'transparent',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0.3 : 0.12,
        shadowRadius: 8,
        elevation: 3,
      }
    : variant === 'filled'
      ? {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: 'transparent',
        }
      : {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        };
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    variantStyle,
    {
      borderRadius: theme.radius.md,
      opacity: disabled ? 0.55 : 1,
      padding: paddingMap[padding],
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        {...(props as PressableProps)}
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && !disabled ? styles.pressed : null,
          pressed && !disabled ? pressedStyle : null,
        ]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View {...props} accessibilityState={{ ...accessibilityState, disabled }} style={cardStyle}>
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
    transform: [{ scale: 0.995 }],
  },
});
