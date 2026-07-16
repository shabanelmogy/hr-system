import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import EntityCard from "./EntityCard";

describe("EntityCard", () => {
  it("uses logical badge positions and includes reduced-motion styles", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme({ direction: "rtl" })}>
        <EntityCard
          title="Country"
          endBadge={<span>Quality</span>}
          startBadge={<span>New</span>}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("inset-inline-end:12px");
    expect(html).toContain("inset-inline-start:50px");
    expect(html).toContain("prefers-reduced-motion: reduce");
  });
});
