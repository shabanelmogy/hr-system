import { Pressable, type PressableProps, StyleSheet } from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppIcon, type AppIconName } from '@/src/shared/components/icons/AppIcon';

interface AppIconButtonProps extends Omit<PressableProps, 'children'> {
  icon: AppIconName;
  label: string;
  size?: number;
}

export function AppIconButton({ icon, label, size = 20, disabled, style, ...props }: AppIconButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      style={(state) => [
        styles.button,
        {
          backgroundColor: state.pressed ? theme.colors.surfaceMuted : 'transparent',
          borderRadius: theme.radius.full,
          opacity: disabled ? 0.5 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      <AppIcon color={theme.colors.text} name={icon} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
