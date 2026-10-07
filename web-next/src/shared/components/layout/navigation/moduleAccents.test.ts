import { createTheme } from "@mui/material/styles";
import { moduleColors } from "@app/tokens";
import { describe, expect, it } from "vitest";
import { getDesignTokens } from "@/theme/theme";
import { resolveModuleAccent, resolveSequenceAccent } from "./moduleAccents";

describe("resolveModuleAccent", () => {
  it("gives every module its own color from the active palette", () => {
    const green = createTheme(getDesignTokens("light", "ltr", "green"));
    const orangeDark = createTheme(getDesignTokens("dark", "ltr", "orange"));
    expect(resolveModuleAccent("hr", green)).toBe(moduleColors.green.light.hr);
    expect(resolveModuleAccent("accounting", orangeDark)).toBe(moduleColors.orange.dark.accounting);

    const modules = ["hr", "accounting", "crm", "referenceData", "reporting"] as const;
    const colors = modules.map((module) => resolveModuleAccent(module, green));
    expect(new Set(colors).size).toBe(modules.length);
  });

  it("uses the muted color for platform entries and passes other colors through", () => {
    const theme = createTheme(getDesignTokens("light"));
    expect(resolveModuleAccent("platform", theme)).toBe(theme.palette.text.secondary);
    expect(resolveModuleAccent("#123456", theme)).toBe("#123456");
    expect(resolveModuleAccent(undefined, theme)).toBeUndefined();
  });
});

describe("resolveSequenceAccent", () => {
  const theme = createTheme(getDesignTokens("light", "ltr", "blue"));

  it("never repeats a color between neighbouring entries or the section header", () => {
    for (const section of ["hr", "accounting", "crm", "referenceData", "reporting", "platform"]) {
      const colors = Array.from({ length: 12 }, (_, index) => resolveSequenceAccent(section, index, theme));
      colors.forEach((color, index) => {
        if (index > 0) expect(color).not.toBe(colors[index - 1]);
      });
      expect(colors[0]).not.toBe(resolveModuleAccent(section, theme));
    }
  });

  it("keeps the module color outside a sequence and passes raw colors through", () => {
    expect(resolveSequenceAccent("crm", -1, theme)).toBe(resolveModuleAccent("crm", theme));
    expect(resolveSequenceAccent("#123456", 3, theme)).toBe("#123456");
  });
});
