import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderPhoneCode } from "./CountryCellRenderers";

describe("country cell renderers", () => {
  it("normalizes an existing international prefix", () => {
    const html = renderToStaticMarkup(<>{renderPhoneCode({ value: "+20" } as never)}</>);

    expect(html).toContain("+20");
    expect(html).not.toContain("++20");
  });
});
