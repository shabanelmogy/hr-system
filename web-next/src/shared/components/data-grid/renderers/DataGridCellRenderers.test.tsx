import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderDate, renderNumber, renderProgress, renderUrl } from "./DataGridCellRenderers";

describe("generic data-grid renderers", () => {
  it("does not expose invalid dates or numbers", () => {
    expect(renderDate("not-a-date")).toBe("");
    expect(renderNumber()({ value: "not-a-number" })).toBe("");
  });

  it("rejects non-http links", () => {
    expect(renderToStaticMarkup(<>{renderUrl({ value: "javascript:alert(1)" })}</>)).toBe("");
    expect(renderToStaticMarkup(<>{renderUrl({ value: "https://example.com/report" })}</>)).toContain("https://example.com/report");
  });

  it("adds progress accessibility metadata", () => {
    const html = renderToStaticMarkup(<>{renderProgress({ value: 65 })}</>);

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="65"');
  });
});
