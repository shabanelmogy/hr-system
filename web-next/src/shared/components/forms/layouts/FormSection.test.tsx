import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FormSection } from "./FormSection";

describe("shared section surfaces", () => {
  it("preserves the plain section divider and labelled content by default", () => {
    const html = renderToStaticMarkup(<FormSection title="Language"><span>Existing field</span></FormSection>);
    expect(html).toContain("MuiDivider-root");
    expect(html).toContain('aria-labelledby="');
    expect(html).toContain("Existing field");
  });
  it("composes an outlined surface without an extra divider and retains the action and description", () => {
    const html = renderToStaticMarkup(<FormSection variant="outlined" title="Policy" description="Current company" action={<button>Reset</button>}>
      <input aria-label="Existing control" />
    </FormSection>);
    expect(html).not.toContain("MuiDivider-root");
    expect(html).toContain("Current company");
    expect(html).toContain("Reset");
    expect(html).toContain('aria-label="Existing control"');
    const explicitDivider = renderToStaticMarkup(<FormSection variant="outlined" title="Policy" divider>Child</FormSection>);
    expect(explicitDivider).toContain("MuiDivider-root");
  });
});
