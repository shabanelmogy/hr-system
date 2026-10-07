import type { Theme as NavigationTheme } from 'expo-router/react-navigation';

import { appFontFaces, areAppFontsAvailable } from './fonts';
import {
  createMobileColors,
  defaultPalette as tokenDefaultPalette,
  getTheme,
  themePaletteOrder as tokenThemePaletteOrder,
  layout as tokenLayout,
  radius as tokenRadius,
  spacing as tokenSpacing,
  textStyles,
  type MobileColors,
  type ModuleColors,
  type ResolvedThemeMode as TokenResolvedThemeMode,
  type ThemePalette as TokenThemePalette,
} from '@app/tokens';

/** `#RRGGBB` + alpha → rgba(); use instead of hand-written hex alpha suffixes. */
export { withAlpha } from '@app/tokens';

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
export type AppModuleColors = ModuleColors;

export interface AppTheme {
  colors: AppColors;
  /** One icon color per ERP module, from the same palette as web (tokens `moduleColors`). */
  modules: AppModuleColors;
  isDark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  layout: typeof layout;
}

function createTheme(palette: ThemePalette, mode: ResolvedThemeMode): AppTheme {
  const tokens = getTheme(palette, mode);
  return {
    colors: createMobileColors(tokens.colors),
    modules: tokens.modules,
    isDark: mode === 'dark',
    radius,
    spacing,
    typography,
    layout,
  };
}

/** Same palettes, order and default as the web picker (all from @app/tokens). */
export const themePaletteOrder: readonly ThemePalette[] = tokenThemePaletteOrder;
export const defaultThemePalette: ThemePalette = tokenDefaultPalette;

export const themeCatalog = Object.fromEntries(
  themePaletteOrder.map((palette) => [
    palette,
    { light: createTheme(palette, 'light'), dark: createTheme(palette, 'dark') },
  ]),
) as Record<ThemePalette, Record<ResolvedThemeMode, AppTheme>>;

// Kept for callers that only need the default light/dark pair.
export const themes = themeCatalog[defaultThemePalette];

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
    fonts: areAppFontsAvailable()
      ? {
          regular: { fontFamily: appFontFaces.regular, fontWeight: 'normal' },
          medium: { fontFamily: appFontFaces.medium, fontWeight: 'normal' },
          bold: { fontFamily: appFontFaces.bold, fontWeight: 'normal' },
          heavy: { fontFamily: appFontFaces.bold, fontWeight: 'normal' },
        }
      : {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
  };
}

export type ModuleAccentKey = keyof AppModuleColors | 'platform';

const moduleSequenceOrder: readonly (keyof AppModuleColors)[] = [
  'hr',
  'accounting',
  'crm',
  'referenceData',
  'reporting',
];

/** Header icon color for a module: its own palette color, or muted for platform tools (same as web). */
export function getModuleAccent(theme: AppTheme, moduleKey: ModuleAccentKey | undefined): string {
  if (!moduleKey) return theme.colors.primary;
  if (moduleKey === 'platform') return theme.colors.textMuted;
  return theme.modules[moduleKey] ?? theme.colors.primary;
}

/**
 * Icon color for the `index`-th visible item under a module: cycles through the palette's
 * module colors starting after the module's own color, so neighbours never match (web does
 * the same in the sidebar).
 */
export function getModuleSequenceAccent(
  theme: AppTheme,
  moduleKey: ModuleAccentKey | undefined,
  index: number,
): string {
  const sequence = moduleSequenceOrder.map((key) => theme.modules[key]).filter(Boolean);
  if (sequence.length < 2) return getModuleAccent(theme, moduleKey);
  const start = moduleKey && moduleKey !== 'platform' ? moduleSequenceOrder.indexOf(moduleKey) + 1 : 0;
  return sequence[(start + index) % sequence.length];
}
