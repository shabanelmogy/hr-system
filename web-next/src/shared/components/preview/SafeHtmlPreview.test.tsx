import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SafeHtmlPreview } from "./SafeHtmlPreview";

describe("safe server HTML preview", () => {
  it("keeps the existing opaque inert default and restrictive CSP", () => {
    const html = renderToStaticMarkup(<SafeHtmlPreview html="<p>Sample</p>" title="Preview" />);
    expect(html).toContain('sandbox=""'); expect(html).toContain('inert=""'); expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Content-Security-Policy"); expect(html).not.toContain("allow-scripts"); expect(html).not.toContain("allow-same-origin");
  });
  it("permits accessible scrolling for deactivated history while preserving the sandbox/CSP", () => {
    const html = renderToStaticMarkup(<SafeHtmlPreview html="<p>History</p><a>Deactivated</a>" title="History" scrollable />);
    expect(html).toContain('sandbox=""'); expect(html).toContain('tabindex="0"'); expect(html).not.toContain('inert=""');
    expect(html).toContain("pointer-events:auto"); expect(html).toContain("Content-Security-Policy");
  });
});
