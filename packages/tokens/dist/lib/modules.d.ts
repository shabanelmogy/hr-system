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
export declare const moduleColorOrder: readonly ModuleColorKey[];
export declare const moduleColors: Record<ThemePalette, Record<ResolvedThemeMode, ModuleColors>>;
