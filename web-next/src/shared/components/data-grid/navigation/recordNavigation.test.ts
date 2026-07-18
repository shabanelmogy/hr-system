import { describe, expect, it } from "vitest";
import { getActiveRecordIndex, getPageForRecord } from "./recordNavigation";

describe("record navigation", () => {
  it("tracks the selected row in the filtered grid", () => {
    const filteredIds = [2, 4, 8];

    expect(getActiveRecordIndex(filteredIds, 4, 0, 5)).toBe(1);
    expect(getActiveRecordIndex(filteredIds, 3, 0, 5)).toBe(0);
  });

  it("falls back to the first record on the current page", () => {
    const ids = Array.from({ length: 12 }, (_, index) => index + 1);

    expect(getActiveRecordIndex(ids, 2, 1, 5)).toBe(5);
    expect(getActiveRecordIndex(ids, undefined, 2, 5)).toBe(10);
  });

  it("returns an empty position for an empty grid", () => {
    expect(getActiveRecordIndex([], undefined, 0, 5)).toBe(-1);
  });

  it("maps records to pages without a zero-page-size failure", () => {
    expect(getPageForRecord(11, 5)).toBe(2);
    expect(getPageForRecord(3, 0)).toBe(3);
  });
});
