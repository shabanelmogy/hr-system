import type { PaletteMode } from "@mui/material";
import { createTheme, darken, lighten, type Theme } from "@mui/material/styles";
import { getDesignTokens } from "@/theme/theme";

/**
 * Named chart palettes. The names resolve against the active MUI theme, so every chart
 * follows the selected palette (green / orange / blue / monochrome) and light/dark mode.
 *
 * - `primary`, `secondary`, `rainbow`: categorical series (distinct hues) taken from the
 *   palette's chart, brand and module colors, starting at primary / brand 2 / brand 3.
 * - `success`, `warning`, `error`, `info`, `neutral`: tonal ramps of one status color.
 */
export const COLOR_PALETTES = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  neutral: "neutral",
  rainbow: "rainbow",
} as const;

export type ChartPaletteName = keyof typeof COLOR_PALETTES;
export type ChartColors =
  | readonly string[]
  | { readonly light: readonly string[]; readonly dark: readonly string[] }
  | ChartPaletteName;

const isChartPaletteName = (value: string): value is ChartPaletteName => value in COLOR_PALETTES;
const isColorArray = (colors: ChartColors): colors is readonly string[] => Array.isArray(colors);
const toFiniteNumber = (value: unknown): number => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const unique = (colors: readonly (string | undefined)[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const color of colors) {
    if (!color) continue;
    const key = color.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(color);
  }
  return result;
};

/** Distinct hues of the active palette: chart series first, then module colors. */
const categoricalSeries = (theme: Theme): string[] => {
  const { palette } = theme;
  const app = palette.app;
  return unique([
    ...(app?.chart ?? [palette.primary.main, palette.secondary.main]),
    ...Object.values(app?.modules ?? {}),
    palette.info.main,
    palette.error.main,
  ]);
};

const rotateTo = (colors: string[], first: string | undefined): string[] => {
  const index = first ? colors.findIndex((color) => color.toLowerCase() === first.toLowerCase()) : -1;
  return index <= 0 ? colors : [...colors.slice(index), ...colors.slice(0, index)];
};

// Positive steps move toward the background (lighter in light mode, darker in dark
// mode); negative steps move away from it.
const rampSteps = [0, 0.25, 0.45, -0.2, 0.6, -0.35, 0.15, 0.7] as const;

const tonalRamp = (base: string, theme: Theme): string[] => {
  const towardBackground = theme.palette.mode === "dark" ? darken : lighten;
  const awayFromBackground = theme.palette.mode === "dark" ? lighten : darken;
  return rampSteps.map((step) =>
    step === 0 ? base : step > 0 ? towardBackground(base, step) : awayFromBackground(base, -step),
  );
};

/**
 * Colors of a named chart palette in the active theme. Passing only a mode (older callers)
 * resolves against the default palette; pass the MUI theme so charts follow the selection.
 */
export const getColorPalette = (paletteName: ChartPaletteName, themeOrMode: Theme | PaletteMode): string[] => {
  const theme = typeof themeOrMode === "string" ? createTheme(getDesignTokens(themeOrMode)) : themeOrMode;
  const { palette } = theme;
  switch (paletteName) {
    case "primary":
      return rotateTo(categoricalSeries(theme), palette.primary.main);
    case "secondary":
      return rotateTo(categoricalSeries(theme), palette.app?.brand2?.main ?? palette.secondary.main);
    case "rainbow":
      return rotateTo(categoricalSeries(theme), palette.app?.brand3?.main ?? palette.secondary.main);
    case "neutral":
      return tonalRamp(palette.text.secondary, theme);
    default:
      return tonalRamp(palette[paletteName].main, theme);
  }
};

export const resolveChartColors = (colors: ChartColors, theme: Theme): readonly string[] => {
  if (isColorArray(colors)) return colors;
  if (typeof colors === "string") {
    return getColorPalette(isChartPaletteName(colors) ? colors : "primary", theme);
  }
  return colors[theme.palette.mode];
};

export const formatNumber = (
  value: unknown,
  locale = "en-US",
  options: Intl.NumberFormatOptions = {},
): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(toFiniteNumber(value));

export const formatPercentage = (value: unknown, decimals = 1): string =>
  `${toFiniteNumber(value).toFixed(decimals)}%`;

export const formatCurrency = (value: unknown, currency = "USD", locale = "en-US"): string =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(toFiniteNumber(value));
