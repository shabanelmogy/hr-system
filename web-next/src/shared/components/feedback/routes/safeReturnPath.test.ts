import { describe, expect, it } from "vitest";
import { safeReturnPath } from "./safeReturnPath";

describe("safeReturnPath", () => {
  it("keeps valid application-relative paths", () => {
    expect(safeReturnPath("/basic-data/countries?view=grid")).toBe(
      "/basic-data/countries?view=grid",
    );
  });

  it("rejects external, protocol-relative, and missing paths", () => {
    expect(safeReturnPath("https://example.com")).toBe("/");
    expect(safeReturnPath("//example.com")).toBe("/");
    expect(safeReturnPath(undefined)).toBe("/");
  });
});
