import type { Theme as NavigationTheme } from '@react-navigation/native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  full: 999,
} as const;

export const typography = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  titleSmall: 20,
  title: 24,
  display: 30,
} as const;

const greenLightColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF4F1',
  text: '#172026',
  textMuted: '#5C6970',
  primary: '#0F766E',
  onPrimary: '#FFFFFF',
  secondary: '#2563EB',
  accent: '#A21CAF',
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  border: '#D4E1DE',
  disabled: '#9AA5AB',
  overlay: 'rgba(15, 23, 42, 0.48)',
} as const;

const greenDarkColors = {
  background: '#101514',
  surface: '#18201E',
  surfaceMuted: '#21302C',
  text: '#F5F7F8',
  textMuted: '#A8B8B4',
  primary: '#5EEAD4',
  onPrimary: '#0D2E2B',
  secondary: '#93C5FD',
  accent: '#F0ABFC',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  border: '#334540',
  disabled: '#6F7A80',
  overlay: 'rgba(0, 0, 0, 0.64)',
} as const;

const orangeLightColors = {
  ...greenLightColors,
  background: '#FAF7F4',
  surfaceMuted: '#FCEDE3',
  primary: '#C2410C',
  secondary: '#0369A1',
  accent: '#7C3AED',
  warning: '#C2410C',
  border: '#E8D9D0',
} as const;

const orangeDarkColors = {
  ...greenDarkColors,
  background: '#171310',
  surface: '#211A16',
  surfaceMuted: '#32231A',
  primary: '#FDBA74',
  onPrimary: '#431407',
  secondary: '#7DD3FC',
  accent: '#C4B5FD',
  border: '#49372C',
} as const;

const blueLightColors = {
  ...greenLightColors,
  background: '#F4F7FB',
  surfaceMuted: '#E8F0FA',
  primary: '#1D4ED8',
  secondary: '#0F766E',
  accent: '#C026D3',
  border: '#D4DEEC',
} as const;

const blueDarkColors = {
  ...greenDarkColors,
  background: '#10141B',
  surface: '#181E28',
  surfaceMuted: '#202B3B',
  primary: '#93C5FD',
  onPrimary: '#102A56',
  secondary: '#5EEAD4',
  accent: '#F0ABFC',
  border: '#334156',
} as const;

const monochromeLightColors = {
  ...greenLightColors,
  background: '#F5F5F5',
  surfaceMuted: '#ECECEC',
  text: '#111111',
  textMuted: '#5E5E5E',
  primary: '#171717',
  secondary: '#525252',
  accent: '#737373',
  border: '#D4D4D4',
  disabled: '#A3A3A3',
} as const;

const monochromeDarkColors = {
  ...greenDarkColors,
  background: '#0A0A0A',
  surface: '#171717',
  surfaceMuted: '#262626',
  text: '#FAFAFA',
  textMuted: '#B5B5B5',
  primary: '#FAFAFA',
  onPrimary: '#111111',
  secondary: '#D4D4D4',
  accent: '#A3A3A3',
  border: '#3F3F3F',
  disabled: '#737373',
} as const;

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;
export type ThemePalette = 'orange' | 'green' | 'blue' | 'monochrome';
export type AppColors = { [Key in keyof typeof greenLightColors]: string };

export interface AppTheme {
  colors: AppColors;
  isDark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
}

function createTheme(colors: AppColors, isDark: boolean): AppTheme {
  return { colors, isDark, radius, spacing, typography };
}

export const themeCatalog: Record<ThemePalette, Record<ResolvedThemeMode, AppTheme>> = {
  orange: {
    light: createTheme(orangeLightColors, false),
    dark: createTheme(orangeDarkColors, true),
  },
  green: {
    light: createTheme(greenLightColors, false),
    dark: createTheme(greenDarkColors, true),
  },
  blue: {
    light: createTheme(blueLightColors, false),
    dark: createTheme(blueDarkColors, true),
  },
  monochrome: {
    light: createTheme(monochromeLightColors, false),
    dark: createTheme(monochromeDarkColors, true),
  },
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
