import type { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  type ColorValue,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning' | 'danger';
type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

export interface AppButtonProps extends Omit<PressableProps, 'children'> {
  variant?: AppButtonVariant;
  icon?: AppIconName;
  loading?: boolean;
  fullWidth?: boolean;
  gradientColors?: GradientColors;
  pressedGradientColors?: GradientColors;
}

export function AppButton({
  children,
  variant = 'primary',
  icon,
  loading = false,
  fullWidth = false,
  gradientColors,
  pressedGradientColors,
  disabled,
  style,
  ...props
}: PropsWithChildren<AppButtonProps>) {
  const { theme } = useAppTheme();
  const { direction } = useLocalization();
  const isDisabled = disabled || loading;

  const backgroundMap: Record<AppButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    outline: 'transparent',
    ghost: 'transparent',
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };
  const foregroundMap: Record<AppButtonVariant, string> = {
    primary: theme.colors.onPrimary,
    secondary: '#FFFFFF',
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    warning: '#FFFFFF',
    danger: '#FFFFFF',
  };

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.button,
        {
          direction,
          backgroundColor: gradientColors ? 'transparent' : backgroundMap[variant],
          borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
          borderRadius: theme.radius.sm,
          overflow: gradientColors ? 'hidden' : undefined,
          opacity:
            isDisabled
              ? 0.55
              : state.pressed && !(gradientColors && pressedGradientColors)
                ? 0.82
                : 1,
          width: fullWidth ? '100%' : undefined,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      {(state) => (
        <>
          {gradientColors ? (
            <LinearGradient
              colors={state.pressed && pressedGradientColors ? pressedGradientColors : gradientColors}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={[styles.content, { direction }]}>
            {loading ? (
              <ActivityIndicator color={foregroundMap[variant]} size="small" />
            ) : icon ? (
              <AppIcon color={foregroundMap[variant]} name={icon} size={19} />
            ) : null}
            <AppText
              align="center"
              color="default"
              style={{ color: foregroundMap[variant] }}
              weight="700">
              {children}
            </AppText>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
