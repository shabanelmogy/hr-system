import Sync from "@mui/icons-material/Sync";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MyOverlayLoader from "./MyOverlayLoader";

describe("MyOverlayLoader", () => {
  it("exposes the active operation as an accessible status", () => {
    const html = renderToStaticMarkup(
      <MyOverlayLoader open message="Saving country..." />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Saving country..."');
  });

  it("renders a caller-provided icon", () => {
    const html = renderToStaticMarkup(
      <MyOverlayLoader open customIcon={<Sync data-testid="custom-icon" />} />,
    );

    expect(html).toContain("custom-icon");
  });
});
