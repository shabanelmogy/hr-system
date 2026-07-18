import { renderToStaticMarkup } from "react-dom/server";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import Timeline from "./Timeline";

describe("Timeline", () => {
  it("uses one keyboard-operable event control and logical RTL positioning", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme({ direction: "rtl" })}>
        <Timeline
          title="Activity"
          data={[
            {
              id: "activity-1",
              date: "2026-07-18",
              title: "Updated policy",
              status: "success",
            },
            {
              id: "activity-2",
              date: "2026-07-17",
              title: "Published report",
              status: "info",
            },
          ]}
          onItemClick={() => undefined}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("<button");
    expect(html).not.toContain('role="button"');
    expect(html).toContain("border-inline-start:4px");
    expect(html).toContain("inset-inline-start:19px");
  });

  it("keeps non-interactive timelines free of button semantics", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <Timeline
          title="Activity"
          data={[
            {
              id: "activity-1",
              title: "Updated policy",
              status: "info",
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="button"');
  });
});
