/**
 * Non-color scales. Values in pixels (React Native units); the CSS build
 * converts them to rem where appropriate (16px = 1rem).
 * Spacing, radius, typography sizes and line heights come from the HR mobile
 * app (`theme.ts`, `AppText.tsx`); the rest completes the system.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 48,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: (typeof fontWeight)[keyof typeof fontWeight];
}

export const textStyles = {
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  titleSmall: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 31, fontWeight: '700' },
  display: { fontSize: 30, lineHeight: 38, fontWeight: '800' },
} as const satisfies Record<string, TextStyleToken>;

export type TextVariant = keyof typeof textStyles;

/**
 * Font families. Arabic and Latin share one family so mixed text keeps the
 * same rhythm. The native app bundles the files (assets/fonts) and loads one family per
 * weight with expo-font; the web app self-hosts them (public/fonts + src/fonts.css).
 */
export const fontFamily = {
  sans: 'IBM Plex Sans Arabic',
  mono: 'IBM Plex Mono',
} as const;

export const fontStack = {
  sans: '"IBM Plex Sans Arabic", "Segoe UI", Tahoma, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/** Elevation levels. `native` feeds React Native shadow props; `css` feeds box-shadow. */
export const elevation = {
  none: { css: 'none', native: { shadowOpacity: 0, shadowRadius: 0, shadowOffsetY: 0, elevation: 0 } },
  sm: { css: '0 1px 2px 0 rgb(0 0 0 / 0.06)', native: { shadowOpacity: 0.06, shadowRadius: 2, shadowOffsetY: 1, elevation: 1 } },
  md: { css: '0 4px 12px -2px rgb(0 0 0 / 0.10)', native: { shadowOpacity: 0.1, shadowRadius: 8, shadowOffsetY: 4, elevation: 3 } },
  lg: { css: '0 12px 32px -8px rgb(0 0 0 / 0.18)', native: { shadowOpacity: 0.18, shadowRadius: 16, shadowOffsetY: 8, elevation: 8 } },
} as const;

export const motion = {
  duration: { fast: 120, normal: 200, slow: 320 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  },
} as const;

export const layout = {
  contentMaxWidth: 960,
  wideContentMaxWidth: 1280,
  overlayMaxWidth: 520,
  sidebarWidth: 272,
  sidebarCollapsedWidth: 72,
  /** Minimum touch/click target (WCAG 2.5.8 recommends 24; platforms recommend 44-48). */
  touchTarget: 44,
  controlHeight: { sm: 36, md: 44, lg: 52 },
} as const;

/** Viewport breakpoints (min-width), shared by web media queries and native useWindowDimensions. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  drawer: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  tooltip: 80,
} as const;

/** Icon names are shared by meaning; each platform maps them to its icon set. */
export const iconSize = { sm: 16, md: 20, lg: 24, xl: 32 } as const;
