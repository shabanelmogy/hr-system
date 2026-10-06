/**
 * Color palettes, extracted from the HR mobile app (`src/core/theme/theme.ts`)
 * and renamed to one canonical semantic vocabulary shared by web (shadcn/ui)
 * and mobile (React Native).
 *
 * Naming rule: shadcn names keep their shadcn meaning (`secondary`, `accent`,
 * `muted` are quiet surfaces). The mobile app's strong "secondary" and
 * "accent" brand colors become `brand2` and `brand3`.
 */
export interface SemanticColors {
    /** Page background. */
    background: string;
    /** Default text on background. */
    foreground: string;
    /** Raised surfaces: cards, sheets, popovers, table rows. */
    surface: string;
    surfaceForeground: string;
    /** Quiet surfaces: section fills, hover rows, chips, skeletons. */
    muted: string;
    mutedForeground: string;
    /** Main brand/action color. */
    primary: string;
    primaryForeground: string;
    /** Quiet button / secondary action (shadcn meaning). */
    secondary: string;
    secondaryForeground: string;
    /** Hover/active highlight for menus and list items (shadcn meaning). */
    accent: string;
    accentForeground: string;
    /** Second brand color (mobile "secondary"): info, links, secondary charts. */
    brand2: string;
    brand2Foreground: string;
    /** Third brand color (mobile "accent"): highlights, badges, charts. */
    brand3: string;
    brand3Foreground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    destructive: string;
    destructiveForeground: string;
    info: string;
    infoForeground: string;
    border: string;
    input: string;
    ring: string;
    disabled: string;
    overlay: string;
    shadow: string;
}
export type ThemePalette = 'green' | 'orange' | 'blue' | 'monochrome';
export type ResolvedThemeMode = 'light' | 'dark';
export type ThemeMode = ResolvedThemeMode | 'system';
export declare const themePaletteOrder: readonly ThemePalette[];
export declare const defaultPalette: ThemePalette;
export declare const palettes: Record<ThemePalette, Record<ResolvedThemeMode, SemanticColors>>;
/** Chart series order: primary brand first, then the supporting brand and status colors. */
export declare function chartColors(colors: SemanticColors): readonly string[];
