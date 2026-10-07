import { createTheme } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { getDesignTokens } from "@/theme/theme";
import { getColorPalette, resolveChartColors } from "./chartUtils";

const themeFor = (palette: "green" | "orange" | "blue" | "monochrome", mode: "light" | "dark" = "light") =>
  createTheme(getDesignTokens(mode, "ltr", palette));

describe("chart palettes follow the active theme", () => {
  it("starts the default series with the palette primary and keeps hues distinct", () => {
    for (const palette of ["green", "orange", "blue", "monochrome"] as const) {
      const theme = themeFor(palette);
      const series = getColorPalette("primary", theme);
      expect(series[0]).toBe(theme.palette.primary.main);
      expect(new Set(series.map((color) => color.toLowerCase())).size).toBe(series.length);
      expect(series.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("changes when the palette changes", () => {
    expect(getColorPalette("primary", themeFor("green"))).not.toEqual(getColorPalette("primary", themeFor("orange")));
  });

  it("builds status ramps from the status color and resolves names and arrays", () => {
    const theme = themeFor("blue", "dark");
    expect(getColorPalette("success", theme)[0]).toBe(theme.palette.success.main);
    expect(resolveChartColors("secondary", theme)[0]).toBe(theme.palette.app?.brand2?.main);
    expect(resolveChartColors(["#123456"], theme)).toEqual(["#123456"]);
  });
});
