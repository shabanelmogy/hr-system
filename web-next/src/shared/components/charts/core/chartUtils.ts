import type { PaletteMode } from "@mui/material";

export const COLOR_PALETTES = {
  primary: {
    light: ["#1976d2", "#42a5f5", "#90caf9", "#e3f2fd", "#0d47a1", "#1565c0", "#1e88e5", "#64b5f6"],
    dark: ["#64b5f6", "#1e88e5", "#1565c0", "#0d47a1", "#e3f2fd", "#90caf9", "#42a5f5", "#1976d2"],
  },
  secondary: {
    light: ["#9c27b0", "#ba68c8", "#ce93d8", "#f3e5f5", "#4a148c", "#6a1b9a", "#8e24aa", "#ab47bc"],
    dark: ["#ab47bc", "#8e24aa", "#6a1b9a", "#4a148c", "#f3e5f5", "#ce93d8", "#ba68c8", "#9c27b0"],
  },
  success: {
    light: ["#2e7d32", "#4caf50", "#81c784", "#c8e6c9", "#1b5e20", "#388e3c", "#66bb6a", "#a5d6a7"],
    dark: ["#a5d6a7", "#66bb6a", "#388e3c", "#1b5e20", "#c8e6c9", "#81c784", "#4caf50", "#2e7d32"],
  },
  warning: {
    light: ["#ed6c02", "#ff9800", "#ffb74d", "#ffe0b2", "#e65100", "#f57c00", "#ff8f00", "#ffab00"],
    dark: ["#ffab00", "#ff8f00", "#f57c00", "#e65100", "#ffe0b2", "#ffb74d", "#ff9800", "#ed6c02"],
  },
  error: {
    light: ["#d32f2f", "#f44336", "#e57373", "#ffcdd2", "#b71c1c", "#c62828", "#e53935", "#ef5350"],
    dark: ["#ef5350", "#e53935", "#c62828", "#b71c1c", "#ffcdd2", "#e57373", "#f44336", "#d32f2f"],
  },
  info: {
    light: ["#0288d1", "#03a9f4", "#4fc3f7", "#b3e5fc", "#01579b", "#0277bd", "#0288d1", "#039be5"],
    dark: ["#039be5", "#0288d1", "#0277bd", "#01579b", "#b3e5fc", "#4fc3f7", "#03a9f4", "#0288d1"],
  },
  neutral: {
    light: ["#424242", "#616161", "#757575", "#9e9e9e", "#212121", "#424242", "#616161", "#757575"],
    dark: ["#757575", "#616161", "#424242", "#212121", "#9e9e9e", "#757575", "#616161", "#424242"],
  },
  rainbow: {
    light: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f"],
    dark: ["#f7dc6f", "#98d8c8", "#dda0dd", "#ffeaa7", "#96ceb4", "#45b7d1", "#4ecdc4", "#ff6b6b"],
  },
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

export const getColorPalette = (paletteName: ChartPaletteName, mode: PaletteMode = "light"): string[] =>
  [...COLOR_PALETTES[paletteName][mode]];

export const resolveChartColors = (colors: ChartColors, mode: PaletteMode): readonly string[] => {
  if (isColorArray(colors)) return colors;
  if (typeof colors === "string") {
    return isChartPaletteName(colors) ? getColorPalette(colors, mode) : getColorPalette("primary", mode);
  }
  return colors[mode];
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
