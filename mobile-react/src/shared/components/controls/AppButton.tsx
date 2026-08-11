import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';
import { AppText } from '@/src/shared/components/typography/AppText';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface AppButtonProps extends Omit<PressableProps, 'children'> {
  variant?: AppButtonVariant;
  icon?: AppIconName;
  loading?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  children,
  variant = 'primary',
  icon,
  loading = false,
  fullWidth = false,
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
    danger: theme.colors.danger,
  };
  const foregroundMap: Record<AppButtonVariant, string> = {
    primary: theme.colors.onPrimary,
    secondary: '#FFFFFF',
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
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
          backgroundColor: backgroundMap[variant],
          borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
          borderRadius: theme.radius.sm,
          opacity: isDisabled ? 0.55 : state.pressed ? 0.82 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      <View style={[styles.content, { direction }]}>
        {loading ? (
          <ActivityIndicator color={foregroundMap[variant]} size="small" />
        ) : icon ? (
          <AppIcon color={foregroundMap[variant]} name={icon} size={19} />
        ) : null}
        <AppText align="center" color="default" style={{ color: foregroundMap[variant] }} weight="700">
          {children}
        </AppText>
      </View>
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
