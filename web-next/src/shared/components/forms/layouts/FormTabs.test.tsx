import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FormTabs } from "./FormTabs";

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return actual;
});

describe("FormTabs", () => {
  it("exposes tab and panel ARIA relationships and keeps mounted panels by default", () => {
    const html = renderToStaticMarkup(
      <FormTabs
        label="Tenant sections"
        tabs={[
          { value: "identity", label: "Identity", content: <span>Identity content</span> },
          { value: "contact", label: "Contact", content: <span>Contact content</span>, hasError: true, errorLabel: "Contact has errors" },
        ]}
        value="identity"
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain("Identity content");
    expect(html).toContain("Contact content");
    expect(html).toContain("Contact has errors");
  });

  it("omits inactive panels when keepMounted is false", () => {
    const html = renderToStaticMarkup(
      <FormTabs
        keepMounted={false}
        label="Tenant sections"
        tabs={[
          { value: "identity", label: "Identity", content: <span>Identity content</span> },
          { value: "contact", label: "Contact", content: <span>Contact content</span> },
        ]}
        value="identity"
        onChange={() => undefined}
      />,
    );

    expect(html).toContain("Identity content");
    expect(html).not.toContain("Contact content");
  });
});
