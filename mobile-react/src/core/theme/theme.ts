import type { Theme as NavigationTheme } from 'expo-router/react-navigation';
import {
  createMobileColors,
  getTheme,
  layout as tokenLayout,
  radius as tokenRadius,
  spacing as tokenSpacing,
  textStyles,
  type MobileColors,
  type ResolvedThemeMode as TokenResolvedThemeMode,
  type ThemePalette as TokenThemePalette,
} from '@app/tokens';

/**
 * Design values come from @app/tokens (packages/tokens), the single source shared with
 * web-next. This module keeps the exact exports and shapes the app already uses, so no
 * screen changes. Add new design values in packages/tokens, never here.
 */

export const spacing = tokenSpacing;
export const radius = tokenRadius;

export const typography = {
  caption: textStyles.caption.fontSize,
  bodySmall: textStyles.bodySmall.fontSize,
  body: textStyles.body.fontSize,
  titleSmall: textStyles.titleSmall.fontSize,
  title: textStyles.title.fontSize,
  display: textStyles.display.fontSize,
} as const;

export const layout = tokenLayout;

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = TokenResolvedThemeMode;
export type ThemePalette = TokenThemePalette;
export type AppColors = MobileColors;

export interface AppTheme {
  colors: AppColors;
  isDark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  layout: typeof layout;
}

function createTheme(palette: ThemePalette, mode: ResolvedThemeMode): AppTheme {
  return {
    colors: createMobileColors(getTheme(palette, mode).colors),
    isDark: mode === 'dark',
    radius,
    spacing,
    typography,
    layout,
  };
}

export const themeCatalog: Record<ThemePalette, Record<ResolvedThemeMode, AppTheme>> = {
  orange: { light: createTheme('orange', 'light'), dark: createTheme('orange', 'dark') },
  green: { light: createTheme('green', 'light'), dark: createTheme('green', 'dark') },
  blue: { light: createTheme('blue', 'light'), dark: createTheme('blue', 'dark') },
  monochrome: { light: createTheme('monochrome', 'light'), dark: createTheme('monochrome', 'dark') },
};

// Kept for callers that only need the default light/dark pair.
export const themes = themeCatalog.green;

export const themePaletteOrder: readonly ThemePalette[] = [
  'orange',
  'green',
  'blue',
  'monochrome',
];

export function getAppTheme(palette: ThemePalette, mode: ResolvedThemeMode): AppTheme {
  return themeCatalog[palette][mode];
}

export function createNavigationTheme(theme: AppTheme): NavigationTheme {
  return {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };
}
