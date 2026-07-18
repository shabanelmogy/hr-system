import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MySimpleLoader from "./MySimpleLoader";

describe("MySimpleLoader", () => {
  it("exposes a labeled loading status", () => {
    const html = renderToStaticMarkup(<MySimpleLoader label="Loading profile" />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Loading profile"');
  });
});
