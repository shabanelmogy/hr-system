/**
 * One accent color per module family, used for navigation icons and launcher tiles.
 *
 * Every page inside a module shares its module's accent, so the sidebar reads as a few
 * calm color groups instead of a different color per item. Each accent has a light-mode
 * value (Tailwind 600, readable on white) and a dark-mode value (Tailwind 400, readable
 * on dark surfaces).
 */
export const moduleAccents = {
  platform: { light: "#475569", dark: "#94A3B8" }, // slate: administration, tools
  superAdmin: { light: "#B45309", dark: "#FBBF24" }, // amber: tenant-wide control
  hr: { light: "#4F46E5", dark: "#818CF8" }, // indigo
  accounting: { light: "#059669", dark: "#34D399" }, // emerald
  crm: { light: "#7C3AED", dark: "#A78BFA" }, // violet
  referenceData: { light: "#0891B2", dark: "#22D3EE" }, // cyan
  reporting: { light: "#0284C7", dark: "#38BDF8" }, // sky
} as const;

export type ModuleAccent = keyof typeof moduleAccents;

export function isModuleAccent(value: string): value is ModuleAccent {
  return Object.prototype.hasOwnProperty.call(moduleAccents, value);
}

/** Resolves a module accent key for the current mode; any other color string is returned as-is. */
export function resolveModuleAccent(
  color: string | undefined,
  mode: "light" | "dark",
): string | undefined {
  if (!color) return undefined;
  return isModuleAccent(color) ? moduleAccents[color][mode] : color;
}
