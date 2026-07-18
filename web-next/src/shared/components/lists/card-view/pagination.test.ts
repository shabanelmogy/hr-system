import { describe, expect, it } from "vitest";
import { getCardPageCorrection, getCardPaginationState } from "./pagination";

describe("getCardPaginationState", () => {
  it("returns an empty range when no items exist", () => {
    expect(getCardPaginationState(0, 10, 0)).toEqual({
      pageCount: 1,
      page: 0,
      start: 0,
      end: 0,
    });
  });

  it("bounds stale page indexes after the item count shrinks", () => {
    expect(getCardPaginationState(8, 10, 23)).toEqual({
      pageCount: 3,
      page: 2,
      start: 21,
      end: 23,
    });
  });

  it("guards against invalid page-size and count values", () => {
    expect(getCardPaginationState(-3, 0, -5)).toEqual({
      pageCount: 1,
      page: 0,
      start: 0,
      end: 0,
    });
  });

  it("identifies when the parent page must be corrected", () => {
    expect(getCardPageCorrection(8, 2)).toBe(2);
    expect(getCardPageCorrection(2, 2)).toBeNull();
  });
});
