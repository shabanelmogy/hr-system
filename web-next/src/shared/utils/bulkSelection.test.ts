import { describe, expect, it } from "vitest";
import { normalizeBulkSelection } from "./bulkSelection";

describe("normalizeBulkSelection", () => {
  it("keeps unique eligible positive identifiers", () => {
    expect(normalizeBulkSelection([3, 2, 3, -1, 9], new Set([2, 3]), 100)).toEqual({
      ids: [3, 2],
      exceedsLimit: false,
    });
  });

  it("reports selections above the API batch limit without truncating them", () => {
    const ids = Array.from({ length: 101 }, (_, index) => index + 1);
    const result = normalizeBulkSelection(ids, new Set(ids), 100);

    expect(result.ids).toHaveLength(101);
    expect(result.exceedsLimit).toBe(true);
  });
});
