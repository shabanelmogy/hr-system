import type { Theme } from "@mui/material/styles";

/**
 * Module families used to color navigation icons and launcher tiles.
 *
 * Each ERP module has its own icon color, defined per palette in @app/tokens
 * (`moduleColors`, exposed as `theme.palette.app.modules`), so every module looks
 * different while staying in harmony with the selected palette. Platform and
 * administration entries are not modules and use the muted text color.
 */
export const moduleAccentRoles = {
  platform: "muted",
  superAdmin: "muted",
  hr: "module",
  accounting: "module",
  crm: "module",
  referenceData: "module",
  reporting: "module",
} as const;

export type ModuleAccent = keyof typeof moduleAccentRoles;

export function isModuleAccent(value: string): value is ModuleAccent {
  return Object.prototype.hasOwnProperty.call(moduleAccentRoles, value);
}

/** Resolves a module key to its palette color; any other color string is returned as-is. */
export function resolveModuleAccent(color: string | undefined, theme: Theme): string | undefined {
  if (!color) return undefined;
  if (!isModuleAccent(color)) return color;
  if (moduleAccentRoles[color] === "muted") return theme.palette.text.secondary;
  // `modules` is missing until the app's copy of @app/tokens is refreshed (npm run sync:tokens);
  // fall back to the primary color instead of crashing.
  return theme.palette.app?.modules?.[color] ?? theme.palette.primary.main;
}

const moduleSequenceOrder = ["hr", "accounting", "crm", "referenceData", "reporting"] as const;

/**
 * Color for the `index`-th visible entry inside a section (owner decision 2026-10-07:
 * sub-module icons alternate so no two neighbours share a color).
 *
 * Cycles through the palette's module colors starting after the section's own color,
 * so the first entry also differs from its section header. With five colors, two
 * consecutive entries are never the same. Falls back to `resolveModuleAccent` when the
 * installed tokens do not provide module colors yet.
 */
export function resolveSequenceAccent(
  color: string | undefined,
  index: number,
  theme: Theme,
): string | undefined {
  if (!color || !isModuleAccent(color) || index < 0) return resolveModuleAccent(color, theme);
  const modules = theme.palette.app?.modules;
  const sequence = modules
    ? moduleSequenceOrder.map((key) => modules[key]).filter((value): value is string => Boolean(value))
    : [];
  if (sequence.length < 2) return resolveModuleAccent(color, theme);
  const start = moduleSequenceOrder.indexOf(color as (typeof moduleSequenceOrder)[number]);
  const offset = start < 0 ? 0 : start + 1;
  return sequence[(offset + index) % sequence.length];
}
