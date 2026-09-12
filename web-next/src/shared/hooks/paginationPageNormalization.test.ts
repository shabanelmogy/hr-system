import { describe, expect, it } from "vitest";
import { clampPaginationPage } from "./usePagination";
import { getEffectivePaginationPage } from "./usePaginationV2";

describe("pagination page normalization", () => {
  it("keeps a page clamped after a shrink when the total grows again", () => {
    let page = 8;

    page = clampPaginationPage(page, 3);
    expect(page).toBe(3);

    expect(clampPaginationPage(page, 8)).toBe(3);
  });

  it("preserves V2's onItemsChange switch", () => {
    expect(getEffectivePaginationPage(8, 3, true)).toBe(3);
    expect(getEffectivePaginationPage(8, 3, false)).toBe(8);
    expect(getEffectivePaginationPage(8, 0, true)).toBe(8);
  });
});
