import { describe, expect, it } from "vitest";
import { clampPage } from "./pagination";

describe("table pagination", () => {
  it("clamps the page after rows are removed", () => {
    expect(clampPage(4, 10, 12)).toBe(1);
  });

  it("returns the first page for empty data", () => {
    expect(clampPage(3, 10, 0)).toBe(0);
  });

  it("keeps a valid page unchanged", () => {
    expect(clampPage(1, 10, 25)).toBe(1);
  });
});
