/**
 * One icon color per ERP module, chosen per palette so the set stays in harmony with
 * the palette's primary color (owner decision 2026-10-07: every module gets its own
 * color). The first module (HR) always uses the palette primary. Light values are
 * 600-700 shades (readable on white); dark values are 300 shades (readable on dark).
 * Platform/administration entries are not modules and use `mutedForeground` instead.
 *
 * `scripts/check-contrast.mjs` requires every value to reach 3:1 on the surface.
 */
import type { ResolvedThemeMode, ThemePalette } from './palettes.ts';

export type ModuleColorKey = 'hr' | 'accounting' | 'crm' | 'referenceData' | 'reporting';

export type ModuleColors = Record<ModuleColorKey, string>;

export const moduleColorOrder: readonly ModuleColorKey[] = [
  'hr',
  'accounting',
  'crm',
  'referenceData',
  'reporting',
];

export const moduleColors: Record<ThemePalette, Record<ResolvedThemeMode, ModuleColors>> = {
  green: {
    light: { hr: '#0F766E', accounting: '#4D7C0F', crm: '#7C3AED', referenceData: '#0369A1', reporting: '#B45309' },
    dark: { hr: '#5EEAD4', accounting: '#A3E635', crm: '#C4B5FD', referenceData: '#7DD3FC', reporting: '#FCD34D' },
  },
  orange: {
    light: { hr: '#C2410C', accounting: '#78350F', crm: '#BE123C', referenceData: '#0F766E', reporting: '#6D28D9' },
    dark: { hr: '#FDBA74', accounting: '#D6BFA8', crm: '#FDA4AF', referenceData: '#5EEAD4', reporting: '#C4B5FD' },
  },
  blue: {
    light: { hr: '#1D4ED8', accounting: '#0F766E', crm: '#BE185D', referenceData: '#4D7C0F', reporting: '#C2410C' },
    dark: { hr: '#93C5FD', accounting: '#5EEAD4', crm: '#F9A8D4', referenceData: '#BEF264', reporting: '#FDBA74' },
  },
  // Black & white: deep (800) tones in light mode so the set stays sober but every module
  // is still clearly distinct (owner feedback 2026-10-07: tinted greys looked identical).
  monochrome: {
    light: { hr: '#171717', accounting: '#115E59', crm: '#5B21B6', referenceData: '#3F6212', reporting: '#9A3412' },
    dark: { hr: '#FAFAFA', accounting: '#5EEAD4', crm: '#C4B5FD', referenceData: '#BEF264', reporting: '#FDBA74' },
  },
};
