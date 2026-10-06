import { createTheme, ThemeProvider } from "@mui/material/styles";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDesignTokens } from "@/theme/theme";
import ThemePaletteSelector from "./ThemePaletteSelector";

const render = (value: "green" | "orange" | "blue" | "monochrome") =>
  renderToStaticMarkup(
    <ThemeProvider theme={createTheme(getDesignTokens("light", "ltr", value))}>
      <ThemePaletteSelector value={value} onChange={() => undefined} />
    </ThemeProvider>,
  );

describe("ThemePaletteSelector", () => {
  it("renders one radio per palette, in the shared mobile order", () => {
    const html = render("green");
    expect(html.match(/role="radio"/g)).toHaveLength(4);
    expect(html.indexOf("menu.palettes.green")).toBeLessThan(html.indexOf("menu.palettes.orange"));
    expect(html.indexOf("menu.palettes.blue")).toBeLessThan(html.indexOf("menu.palettes.monochrome"));
  });

  it("marks only the selected palette as checked", () => {
    const html = render("blue");
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-checked="true"[^>]*aria-label="menu\.palettes\.blue"/);
  });
});
