import { themePaletteOrder, type ThemePalette } from "@app/tokens";

/** Cookie that stores the user's color palette (same palette names as mobile). */
export const THEME_PALETTE_COOKIE = "themePalette";

export function parseThemePalette(value: string | undefined): ThemePalette | undefined {
  return themePaletteOrder.find((palette) => palette === value);
}
