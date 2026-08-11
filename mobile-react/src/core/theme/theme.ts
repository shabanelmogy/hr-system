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

const lightColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F4',
  text: '#172026',
  textMuted: '#5C6970',
  primary: '#0F766E',
  onPrimary: '#FFFFFF',
  secondary: '#2563EB',
  accent: '#A21CAF',
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  border: '#D9E0E4',
  disabled: '#9AA5AB',
  overlay: 'rgba(15, 23, 42, 0.48)',
} as const;

const darkColors = {
  background: '#101316',
  surface: '#181C20',
  surfaceMuted: '#22272B',
  text: '#F5F7F8',
  textMuted: '#A8B2B8',
  primary: '#5EEAD4',
  onPrimary: '#0D2E2B',
  secondary: '#93C5FD',
  accent: '#F0ABFC',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  border: '#333B40',
  disabled: '#6F7A80',
  overlay: 'rgba(0, 0, 0, 0.64)',
} as const;

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;
export type AppColors = { [Key in keyof typeof lightColors]: string };

export interface AppTheme {
  colors: AppColors;
  isDark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
}

export const themes: Record<ResolvedThemeMode, AppTheme> = {
  light: {
    colors: lightColors,
    isDark: false,
    radius,
    spacing,
    typography,
  },
  dark: {
    colors: darkColors,
    isDark: true,
    radius,
    spacing,
    typography,
  },
};

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
