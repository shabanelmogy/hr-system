import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/src/core/theme';
import { AppCard, type AppCardProps } from './AppCard';

export interface AppDataCardProps extends Omit<AppCardProps, 'style'> {
  /** Visual focus for the first/current record. This is not bulk selection. */
  active?: boolean;
  /** Controlled bulk-selection state for the record. */
  selected?: boolean;
  /** Starts a short themed success animation for this record. */
  flash?: boolean;
  /** Changes on every edit so repeated edits restart the animation. */
  flashToken?: string | number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shared card surface for data views. It keeps active, selected and edited
 * states visually distinct while preserving the regular AppCard API.
 */
export function AppDataCard({
  active = false,
  children,
  flash = false,
  flashToken,
  selected = false,
  style,
  ...cardProps
}: PropsWithChildren<AppDataCardProps>) {
  const { theme } = useAppTheme();
  const flashProgress = useRef(new Animated.Value(0)).current;
  const previousFlash = useRef<{ active: boolean; token?: string | number }>({ active: false });
  const hasMountedRef = useRef(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Do not replay a flash merely because this card was mounted after a
    // Grid/Cards view switch; only a later token change represents an edit.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (flash) previousFlash.current = { active: true, token: flashToken };
      return;
    }
    if (!flash) {
      previousFlash.current = { active: false };
      return;
    }

    if (previousFlash.current.active && Object.is(previousFlash.current.token, flashToken)) return;

    previousFlash.current = { active: true, token: flashToken };
    setIsFlashing(true);
    const duration = 1400;
    const animation = Animated.sequence([
      Animated.timing(flashProgress, { duration: Math.round(duration * 0.28), toValue: 1, useNativeDriver: false }),
      Animated.timing(flashProgress, { duration: Math.round(duration * 0.72), toValue: 0, useNativeDriver: false }),
    ]);
    flashProgress.stopAnimation();
    flashProgress.setValue(0);
    animation.start(({ finished }) => {
      if (finished) setIsFlashing(false);
    });

    return () => animation.stop();
  }, [flash, flashProgress, flashToken]);

  const flashBackground = flashProgress.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [
      theme.colors.surface,
      toRgba(theme.colors.success, 0.16),
      toRgba(theme.colors.success, 0.3),
      theme.colors.surface,
    ],
  });
  const activeBackground = selected
    ? toRgba(theme.colors.accent, 0.18)
    : active
      ? toRgba(theme.colors.secondary, 0.14)
      : theme.colors.surface;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        style,
        {
          backgroundColor: isFlashing ? flashBackground : activeBackground,
          borderColor: selected ? theme.colors.accent : active ? theme.colors.secondary : theme.colors.border,
          borderRadius: theme.radius.md,
          borderStartColor: selected ? theme.colors.accent : theme.colors.secondary,
          borderStartWidth: selected || active ? 3 : 1,
        },
      ]}>
      <AppCard
        {...cardProps}
        style={[styles.inner, style]}
        variant="outlined">
        {children}
      </AppCard>
    </Animated.View>
  );
}

function toRgba(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split('').map((value) => Number.parseInt(`${value}${value}`, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const value = Number.parseInt(hex, 16);
    return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  inner: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    width: '100%',
  },
});
