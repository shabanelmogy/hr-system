import { describe, expect, it } from "vitest";
import { getInputConstraints } from "./inputConstraints";

describe("getInputConstraints", () => {
  it("keeps zero as the default minimum for number fields", () => {
    expect(getInputConstraints("number")).toEqual({ min: 0 });
  });

  it("supports explicit numeric bounds", () => {
    expect(getInputConstraints("number", -10, 25)).toEqual({
      min: -10,
      max: 25,
    });
  });

  it("supports string bounds for date-like fields", () => {
    expect(getInputConstraints("date", "2026-01-01", "2026-12-31")).toEqual({
      min: "2026-01-01",
      max: "2026-12-31",
    });
  });

  it("does not add bounds when they are not configured", () => {
    expect(getInputConstraints("text")).toEqual({});
  });
});
