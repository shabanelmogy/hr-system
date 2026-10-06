/**
 * React Native adapter.
 *
 * `createMobileColors()` returns the color object in the exact shape and key names that
 * `mobile-react/src/core/theme/theme.ts` (`AppColors`) uses today, so the mobile app can
 * switch its source of truth to this package without touching any screen. Values are
 * identical to the original mobile palettes except: the orange light `warning`, which now
 * uses the standard amber so warnings stay distinguishable from the orange primary; and
 * the green and orange palette `secondary`, which is olive (green) and coffee brown
 * (orange) instead of blue (owner decision 2026-10-06); their `info` stays blue on web.
 */
import type { SemanticColors } from './palettes.ts';

export interface MobileColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  onPrimaryMuted: string;
  onSecondary: string;
  onWarning: string;
  onDanger: string;
  onSolid: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  disabled: string;
  overlay: string;
  shadow: string;
}

/** `#RRGGBB` (or `#RGB`) → `rgba(r, g, b, alpha)`. Other inputs are returned unchanged. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return color;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createMobileColors(colors: SemanticColors): MobileColors {
  return {
    background: colors.background,
    surface: colors.surface,
    surfaceMuted: colors.muted,
    text: colors.foreground,
    textMuted: colors.mutedForeground,
    primary: colors.primary,
    onPrimary: colors.primaryForeground,
    onPrimaryMuted: withAlpha(colors.primaryForeground, 0.14),
    onSecondary: colors.brand2Foreground,
    onWarning: colors.warningForeground,
    onDanger: colors.destructiveForeground,
    onSolid: colors.brand3Foreground,
    secondary: colors.brand2,
    accent: colors.brand3,
    success: colors.success,
    warning: colors.warning,
    danger: colors.destructive,
    border: colors.border,
    disabled: colors.disabled,
    overlay: colors.overlay,
    shadow: colors.shadow,
  };
}
