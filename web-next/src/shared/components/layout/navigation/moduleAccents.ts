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
  return theme.palette.app.modules[color] ?? theme.palette.primary.main;
}
