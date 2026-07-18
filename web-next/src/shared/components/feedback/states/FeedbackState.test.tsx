import { renderToStaticMarkup } from "react-dom/server";
import { InfoOutlined } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { FeedbackState } from "./FeedbackState";

describe("FeedbackState", () => {
  it("renders a semantic status with a heading", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={createTheme()}>
        <FeedbackState
          icon={<InfoOutlined />}
          title="Nothing here"
          description="Add the first record."
        />
      </ThemeProvider>,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain("<h2");
    expect(html).toContain("Nothing here");
  });
});
