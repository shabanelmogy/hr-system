import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContextBadge } from "./ContextBadge";

describe("ContextBadge", () => {
  it("renders a compact active value while keeping the scope in its accessible name", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <ContextBadge
          icon={<ApartmentRoundedIcon />}
          label="Current tenant"
          value="Northwind"
        />
      </ThemeProvider>,
    );

    expect(html).toContain('aria-label="Current tenant: Northwind"');
    expect(html).toContain("Northwind");
    expect(html).not.toContain("ContextBadge-copy");
  });

  it("keeps the full context in the accessible name for icon-only triggers", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <ContextBadge
          expandable
          icon={<ApartmentRoundedIcon />}
          iconOnly
          label="Current tenant"
          onClick={() => undefined}
          value="Northwind"
        />
      </ThemeProvider>,
    );

    expect(html).toContain('aria-label="Current tenant: Northwind"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).not.toContain("ContextBadge-copy");
  });
});
