import { describe, expect, it, vi } from "vitest";
import { invalidateQueryKeys } from "./useInvalidatingMutation";

describe("invalidateQueryKeys", () => {
  it("invalidates every declared stable query key", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateQueryKeys(
      { invalidateQueries },
      [["countries"], ["countries", "page", { pageNumber: 1 }]],
    );

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ["countries"] });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["countries", "page", { pageNumber: 1 }],
    });
  });
});
