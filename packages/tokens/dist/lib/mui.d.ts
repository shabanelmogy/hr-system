/**
 * MUI adapter: turns one resolved AppTheme into ThemeOptions for
 * `createTheme()` in web-next (MUI + Emotion).
 *
 * The package does not depend on @mui/material. The returned object is plain
 * data whose shape matches MUI ThemeOptions, so web-next can call:
 *
 *   import { createTheme } from '@mui/material/styles';
 *   import { getTheme, createMuiThemeOptions } from '@app/tokens';
 *   const theme = createTheme(deepmerge(createMuiThemeOptions(getTheme('green', mode), direction), appComponentDefaults));
 *
 * Application-specific component defaults (for example scroll-lock policy)
 * stay in web-next; this adapter owns only design tokens.
 */
import type { AppTheme } from './index.ts';
export type MuiDirection = 'ltr' | 'rtl';
export interface MuiPaletteColor {
    main: string;
    contrastText: string;
}
export type MuiTypographyVariant = {
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
};
/** Tokens that MUI has no slot for; exposed as `palette.app` (see module augmentation in README). */
export interface MuiAppPalette {
    surface: string;
    surfaceForeground: string;
    muted: string;
    mutedForeground: string;
    brand2: MuiPaletteColor;
    brand3: MuiPaletteColor;
    border: string;
    input: string;
    ring: string;
    overlay: string;
    chart: readonly string[];
}
export interface CreateMuiThemeOptionsConfig {
    /**
     * Apply the token breakpoints (640/768/1024/1280). Default false: existing
     * web-next layouts are written against MUI's default breakpoints, so switching
     * them is a separate, reviewed change.
     */
    useTokenBreakpoints?: boolean;
    /** Root font size used to convert px to rem. Default 16. */
    htmlFontSize?: number;
}
export interface MuiThemeOptionsFromTokens {
    direction: MuiDirection;
    palette: {
        mode: 'light' | 'dark';
        primary: MuiPaletteColor;
        secondary: MuiPaletteColor;
        success: MuiPaletteColor;
        warning: MuiPaletteColor;
        error: MuiPaletteColor;
        info: MuiPaletteColor;
        background: {
            default: string;
            paper: string;
        };
        text: {
            primary: string;
            secondary: string;
            disabled: string;
        };
        divider: string;
        action: {
            disabled: string;
            disabledBackground: string;
            focus: string;
        };
        app: MuiAppPalette;
    };
    typography: {
        fontFamily: string;
        htmlFontSize: number;
        h1: MuiTypographyVariant;
        h2: MuiTypographyVariant;
        h3: MuiTypographyVariant;
        h4: MuiTypographyVariant;
        h5: MuiTypographyVariant;
        h6: MuiTypographyVariant;
        subtitle1: MuiTypographyVariant;
        subtitle2: MuiTypographyVariant;
        body1: MuiTypographyVariant;
        body2: MuiTypographyVariant;
        caption: MuiTypographyVariant;
        button: MuiTypographyVariant & {
            textTransform: 'none';
        };
    };
    shape: {
        borderRadius: number;
    };
    spacing: number;
    zIndex: {
        appBar: number;
        drawer: number;
        modal: number;
        snackbar: number;
        tooltip: number;
    };
    transitions: {
        duration: {
            shortest: number;
            shorter: number;
            short: number;
            standard: number;
            complex: number;
        };
        easing: {
            easeInOut: string;
            easeOut: string;
        };
    };
    breakpoints?: {
        values: {
            xs: number;
            sm: number;
            md: number;
            lg: number;
            xl: number;
        };
    };
}
export declare function createMuiThemeOptions(theme: AppTheme, direction?: MuiDirection, config?: CreateMuiThemeOptionsConfig): MuiThemeOptionsFromTokens;
