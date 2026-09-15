import { describe, expect, it } from "vitest";
import {
  isSafeAppUrl,
  normalizeSeverity,
} from "./notificationPresentation";

describe("notification presentation", () => {
  it("normalizes the current numeric severity contract", () => {
    expect(normalizeSeverity(1)).toBe("info");
    expect(normalizeSeverity(2)).toBe("success");
    expect(normalizeSeverity(3)).toBe("warning");
    expect(normalizeSeverity(4)).toBe("critical");
  });

  it("only permits application-relative action URLs", () => {
    expect(isSafeAppUrl("/basic-data/countries")).toBe(true);
    expect(isSafeAppUrl("//example.com/path")).toBe(false);
    expect(isSafeAppUrl("https://example.com/path")).toBe(false);
    expect(isSafeAppUrl(null)).toBe(false);
  });
});
