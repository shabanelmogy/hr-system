import {
  chartColors,
  defaultPalette,
  palettes,
  themePaletteOrder,
  type ResolvedThemeMode,
  type SemanticColors,
  type ThemeMode,
  type ThemePalette,
} from './palettes.ts';
import {
  breakpoints,
  elevation,
  fontFamily,
  fontStack,
  fontWeight,
  iconSize,
  layout,
  motion,
  radius,
  spacing,
  textStyles,
  zIndex,
  type TextStyleToken,
  type TextVariant,
} from './scales.ts';

export * from './contrast.ts';
export * from './mui.ts';
export * from './native.ts';
export * from './modules.ts';
import { moduleColors, type ModuleColors } from './modules.ts';
export {
  breakpoints,
  chartColors,
  defaultPalette,
  elevation,
  fontFamily,
  fontStack,
  fontWeight,
  iconSize,
  layout,
  motion,
  palettes,
  radius,
  spacing,
  textStyles,
  themePaletteOrder,
  zIndex,
};
export type { ResolvedThemeMode, SemanticColors, TextStyleToken, TextVariant, ThemeMode, ThemePalette };

/** One resolved theme — the object native components read and the CSS build serializes. */
export interface AppTheme {
  palette: ThemePalette;
  mode: ResolvedThemeMode;
  isDark: boolean;
  colors: SemanticColors;
  chart: readonly string[];
  /** One icon color per ERP module for this palette and mode. */
  modules: ModuleColors;
  spacing: typeof spacing;
  radius: typeof radius;
  text: typeof textStyles;
  fontFamily: typeof fontFamily;
  elevation: typeof elevation;
  motion: typeof motion;
  layout: typeof layout;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
  iconSize: typeof iconSize;
}

export function getTheme(palette: ThemePalette = defaultPalette, mode: ResolvedThemeMode = 'light'): AppTheme {
  const colors = palettes[palette][mode];
  return {
    palette,
    mode,
    isDark: mode === 'dark',
    colors,
    chart: chartColors(colors),
    modules: moduleColors[palette][mode],
    spacing,
    radius,
    text: textStyles,
    fontFamily,
    elevation,
    motion,
    layout,
    breakpoints,
    zIndex,
    iconSize,
  };
}

export function resolveMode(mode: ThemeMode, systemIsDark: boolean): ResolvedThemeMode {
  return mode === 'system' ? (systemIsDark ? 'dark' : 'light') : mode;
}

/**
 * Tenant branding: a tenant may override the primary color only. The ring follows
 * the primary; everything else stays on the chosen palette so contrast checks still hold.
 */
export function withBrandPrimary(theme: AppTheme, primary: string, primaryForeground: string): AppTheme {
  const colors = { ...theme.colors, primary, primaryForeground, ring: primary };
  return { ...theme, colors, chart: chartColors(colors) };
}

/** React Native shadow props for an elevation level (iOS shadow* + Android elevation). */
export function nativeShadow(level: keyof typeof elevation, color: string) {
  const value = elevation[level].native;
  return {
    shadowColor: color,
    shadowOpacity: value.shadowOpacity,
    shadowRadius: value.shadowRadius,
    shadowOffset: { width: 0, height: value.shadowOffsetY },
    elevation: value.elevation,
  };
}
