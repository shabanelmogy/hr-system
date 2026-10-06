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

export const themePaletteOrder: readonly ThemePalette[] = ['green', 'orange', 'blue', 'monochrome'];
export const defaultPalette: ThemePalette = 'green';

interface MobilePaletteSource {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  accent: string;
  success: string;
  warning: string;
  onWarning: string;
  danger: string;
  onDanger: string;
  onSolid: string;
  border: string;
  disabled: string;
  overlay: string;
  shadow: string;
  /** Status "info" color; defaults to `secondary` when a palette does not set it. */
  info?: string;
  onInfo?: string;
}

const greenLight: MobilePaletteSource = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF4F1',
  text: '#172026',
  textMuted: '#5C6970',
  primary: '#0F766E',
  onPrimary: '#FFFFFF',
  secondary: '#2563EB',
  onSecondary: '#FFFFFF',
  accent: '#A21CAF',
  success: '#15803D',
  warning: '#B45309',
  onWarning: '#FFFFFF',
  danger: '#DC2626',
  onDanger: '#FFFFFF',
  onSolid: '#FFFFFF',
  border: '#D4E1DE',
  disabled: '#9AA5AB',
  overlay: 'rgba(15, 23, 42, 0.48)',
  shadow: '#000000',
};

const greenDark: MobilePaletteSource = {
  background: '#101514',
  surface: '#18201E',
  surfaceMuted: '#21302C',
  text: '#F5F7F8',
  textMuted: '#A8B8B4',
  primary: '#5EEAD4',
  onPrimary: '#0D2E2B',
  secondary: '#93C5FD',
  onSecondary: '#101514',
  accent: '#F0ABFC',
  success: '#4ADE80',
  warning: '#FBBF24',
  onWarning: '#101514',
  danger: '#F87171',
  onDanger: '#101514',
  onSolid: '#101514',
  border: '#334540',
  disabled: '#6F7A80',
  overlay: 'rgba(0, 0, 0, 0.64)',
  shadow: '#000000',
};

/**
 * The green palette uses an olive second brand color so the whole identity stays in
 * the green family (owner decision 2026-10-06). Info stays blue so it never reads as
 * success. Other palettes spread the base objects above, not these.
 */
const greenBrandLight: MobilePaletteSource = {
  ...greenLight,
  secondary: '#4D7C0F',
  onSecondary: '#FFFFFF',
  info: '#2563EB',
  onInfo: '#FFFFFF',
};

const greenBrandDark: MobilePaletteSource = {
  ...greenDark,
  secondary: '#A3E635',
  onSecondary: '#101514',
  info: '#93C5FD',
  onInfo: '#101514',
};

const orangeLight: MobilePaletteSource = {
  ...greenLight,
  background: '#FAF7F4',
  surfaceMuted: '#FCEDE3',
  primary: '#C2410C',
  // Warm coffee brown instead of blue (owner decision 2026-10-06); info stays blue.
  secondary: '#78350F',
  info: '#0369A1',
  onInfo: '#FFFFFF',
  accent: '#7C3AED',
  warning: '#B45309',
  border: '#E8D9D0',
};

const orangeDark: MobilePaletteSource = {
  ...greenDark,
  background: '#171310',
  surface: '#211A16',
  surfaceMuted: '#32231A',
  primary: '#FDBA74',
  onPrimary: '#431407',
  secondary: '#D6BFA8',
  info: '#7DD3FC',
  onInfo: '#101514',
  accent: '#C4B5FD',
  border: '#49372C',
};

const blueLight: MobilePaletteSource = {
  ...greenLight,
  background: '#F4F7FB',
  surfaceMuted: '#E8F0FA',
  primary: '#1D4ED8',
  secondary: '#0F766E',
  accent: '#C026D3',
  border: '#D4DEEC',
};

const blueDark: MobilePaletteSource = {
  ...greenDark,
  background: '#10141B',
  surface: '#181E28',
  surfaceMuted: '#202B3B',
  primary: '#93C5FD',
  onPrimary: '#102A56',
  secondary: '#5EEAD4',
  accent: '#F0ABFC',
  border: '#334156',
};

const monochromeLight: MobilePaletteSource = {
  ...greenLight,
  background: '#F5F5F5',
  surfaceMuted: '#ECECEC',
  text: '#111111',
  textMuted: '#5E5E5E',
  primary: '#171717',
  secondary: '#525252',
  accent: '#737373',
  border: '#D4D4D4',
  disabled: '#A3A3A3',
};

const monochromeDark: MobilePaletteSource = {
  ...greenDark,
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
};

function toSemantic(source: MobilePaletteSource): SemanticColors {
  return {
    background: source.background,
    foreground: source.text,
    surface: source.surface,
    surfaceForeground: source.text,
    muted: source.surfaceMuted,
    mutedForeground: source.textMuted,
    primary: source.primary,
    primaryForeground: source.onPrimary,
    secondary: source.surfaceMuted,
    secondaryForeground: source.text,
    accent: source.surfaceMuted,
    accentForeground: source.text,
    brand2: source.secondary,
    brand2Foreground: source.onSecondary,
    brand3: source.accent,
    brand3Foreground: source.onSolid,
    success: source.success,
    successForeground: source.onSolid,
    warning: source.warning,
    warningForeground: source.onWarning,
    destructive: source.danger,
    destructiveForeground: source.onDanger,
    info: source.info ?? source.secondary,
    infoForeground: source.onInfo ?? source.onSecondary,
    border: source.border,
    input: source.border,
    ring: source.primary,
    disabled: source.disabled,
    overlay: source.overlay,
    shadow: source.shadow,
  };
}

export const palettes: Record<ThemePalette, Record<ResolvedThemeMode, SemanticColors>> = {
  green: { light: toSemantic(greenBrandLight), dark: toSemantic(greenBrandDark) },
  orange: { light: toSemantic(orangeLight), dark: toSemantic(orangeDark) },
  blue: { light: toSemantic(blueLight), dark: toSemantic(blueDark) },
  monochrome: { light: toSemantic(monochromeLight), dark: toSemantic(monochromeDark) },
};

/** Chart series order: primary brand first, then the supporting brand and status colors. */
export function chartColors(colors: SemanticColors): readonly string[] {
  return [colors.primary, colors.brand2, colors.brand3, colors.success, colors.warning];
}
