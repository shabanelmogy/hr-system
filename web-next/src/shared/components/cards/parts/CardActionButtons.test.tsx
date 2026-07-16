import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it, vi } from "vitest";
import { CardActionButtons } from "./CardActionButtons";

describe("CardActionButtons", () => {
  it("gives every icon-only action an accessible name", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <CardActionButtons
          actions={[
            {
              key: "view",
              title: "View details",
              color: "info",
              icon: createElement("span", null, "V"),
              onClick: vi.fn(),
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(html).toContain('aria-label="View details"');
  });
});
