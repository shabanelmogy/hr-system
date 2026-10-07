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
import { fontStack, type TextStyleToken } from './scales.ts';

export type MuiDirection = 'ltr' | 'rtl';

export interface MuiPaletteColor {
  main: string;
  contrastText: string;
}

// A type alias (not an interface) so it stays assignable to MUI's CSSProperties index signature.
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
  /** One icon color per ERP module (see modules.ts). */
  modules: Readonly<Record<string, string>>;
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
    background: { default: string; paper: string };
    text: { primary: string; secondary: string; disabled: string };
    divider: string;
    action: { disabled: string; disabledBackground: string; focus: string };
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
    button: MuiTypographyVariant & { textTransform: 'none' };
  };
  shape: { borderRadius: number };
  spacing: number;
  zIndex: { appBar: number; drawer: number; modal: number; snackbar: number; tooltip: number };
  transitions: {
    duration: { shortest: number; shorter: number; short: number; standard: number; complex: number };
    easing: { easeInOut: string; easeOut: string };
  };
  breakpoints?: { values: { xs: number; sm: number; md: number; lg: number; xl: number } };
}

function variant(token: TextStyleToken, htmlFontSize: number): MuiTypographyVariant {
  return {
    fontSize: `${+(token.fontSize / htmlFontSize).toFixed(4)}rem`,
    lineHeight: +(token.lineHeight / token.fontSize).toFixed(3),
    fontWeight: Number(token.fontWeight),
  };
}

export function createMuiThemeOptions(
  theme: AppTheme,
  direction: MuiDirection = 'ltr',
  config: CreateMuiThemeOptionsConfig = {},
): MuiThemeOptionsFromTokens {
  const c = theme.colors;
  const t = theme.text;
  const html = config.htmlFontSize ?? 16;
  const v = (token: TextStyleToken) => variant(token, html);

  const options: MuiThemeOptionsFromTokens = {
    direction,
    palette: {
      mode: theme.mode,
      primary: { main: c.primary, contrastText: c.primaryForeground },
      // MUI "secondary" is a strong accent color; map it to brand2, not to the quiet shadcn secondary.
      secondary: { main: c.brand2, contrastText: c.brand2Foreground },
      success: { main: c.success, contrastText: c.successForeground },
      warning: { main: c.warning, contrastText: c.warningForeground },
      error: { main: c.destructive, contrastText: c.destructiveForeground },
      info: { main: c.info, contrastText: c.infoForeground },
      background: { default: c.background, paper: c.surface },
      text: { primary: c.foreground, secondary: c.mutedForeground, disabled: c.disabled },
      divider: c.border,
      action: { disabled: c.disabled, disabledBackground: c.muted, focus: c.ring },
      app: {
        surface: c.surface,
        surfaceForeground: c.surfaceForeground,
        muted: c.muted,
        mutedForeground: c.mutedForeground,
        brand2: { main: c.brand2, contrastText: c.brand2Foreground },
        brand3: { main: c.brand3, contrastText: c.brand3Foreground },
        border: c.border,
        input: c.input,
        ring: c.ring,
        overlay: c.overlay,
        chart: theme.chart,
        modules: theme.modules,
      },
    },
    typography: {
      fontFamily: fontStack.sans,
      htmlFontSize: html,
      // Page-level headings are rare in ERP screens; h1-h3 reuse the display/title scale.
      h1: v(t.display),
      h2: v(t.display),
      h3: v(t.title),
      h4: v(t.title),
      h5: v(t.titleSmall),
      h6: v({ fontSize: 18, lineHeight: 24, fontWeight: '700' }),
      subtitle1: v({ fontSize: 16, lineHeight: 24, fontWeight: '600' }),
      subtitle2: v(t.label),
      body1: v(t.body),
      body2: v(t.bodySmall),
      caption: v(t.caption),
      button: { ...v(t.label), textTransform: 'none' },
    },
    shape: { borderRadius: theme.radius.md },
    // MUI spacing(n) = n * 4px, matching the token 4px grid (xs = 1, sm = 2, lg = 4, xxl = 6).
    spacing: theme.spacing.xs,
    // MUI defaults (1100/1200/1300/1400/1500) are kept relative to each other; tokens order them.
    zIndex: {
      appBar: 1100 + theme.zIndex.sticky,
      drawer: 1200 + theme.zIndex.drawer,
      modal: 1300 + theme.zIndex.modal,
      snackbar: 1400 + theme.zIndex.toast,
      tooltip: 1500 + theme.zIndex.tooltip,
    },
    transitions: {
      duration: {
        shortest: theme.motion.duration.fast,
        shorter: theme.motion.duration.fast,
        short: theme.motion.duration.normal,
        standard: theme.motion.duration.normal,
        complex: theme.motion.duration.slow,
      },
      easing: { easeInOut: theme.motion.easing.standard, easeOut: theme.motion.easing.emphasized },
    },
  };

  if (config.useTokenBreakpoints) {
    const b = theme.breakpoints;
    options.breakpoints = { values: { xs: 0, sm: b.sm, md: b.md, lg: b.lg, xl: b.xl } };
  }
  return options;
}
