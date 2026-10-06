import { chartColors, defaultPalette, palettes, themePaletteOrder, type ResolvedThemeMode, type SemanticColors, type ThemeMode, type ThemePalette } from './palettes.ts';
import { breakpoints, elevation, fontFamily, fontStack, fontWeight, iconSize, layout, motion, radius, spacing, textStyles, zIndex, type TextStyleToken, type TextVariant } from './scales.ts';
export * from './contrast.ts';
export * from './mui.ts';
export * from './native.ts';
export { breakpoints, chartColors, defaultPalette, elevation, fontFamily, fontStack, fontWeight, iconSize, layout, motion, palettes, radius, spacing, textStyles, themePaletteOrder, zIndex, };
export type { ResolvedThemeMode, SemanticColors, TextStyleToken, TextVariant, ThemeMode, ThemePalette };
/** One resolved theme — the object native components read and the CSS build serializes. */
export interface AppTheme {
    palette: ThemePalette;
    mode: ResolvedThemeMode;
    isDark: boolean;
    colors: SemanticColors;
    chart: readonly string[];
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
export declare function getTheme(palette?: ThemePalette, mode?: ResolvedThemeMode): AppTheme;
export declare function resolveMode(mode: ThemeMode, systemIsDark: boolean): ResolvedThemeMode;
/**
 * Tenant branding: a tenant may override the primary color only. The ring follows
 * the primary; everything else stays on the chosen palette so contrast checks still hold.
 */
export declare function withBrandPrimary(theme: AppTheme, primary: string, primaryForeground: string): AppTheme;
/** React Native shadow props for an elevation level (iOS shadow* + Android elevation). */
export declare function nativeShadow(level: keyof typeof elevation, color: string): {
    shadowColor: string;
    shadowOpacity: 0 | 0.06 | 0.1 | 0.18;
    shadowRadius: 0 | 2 | 16 | 8;
    shadowOffset: {
        width: number;
        height: 0 | 4 | 1 | 8;
    };
    elevation: 0 | 3 | 1 | 8;
};
