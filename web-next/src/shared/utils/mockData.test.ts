import { describe, expect, it } from "vitest";
import { getNextMockSample } from "./mockData";

describe("getNextMockSample", () => {
  it("does not repeat a sample until the set is exhausted", () => {
    const used = new Set<number>();
    const first = getNextMockSample(["first", "second"], used, () => 0);
    const second = getNextMockSample(["first", "second"], used, () => 0);

    expect(first).toBe("first");
    expect(second).toBe("second");
    expect(used.size).toBe(2);
  });

  it("starts a new cycle after every sample has been used", () => {
    const used = new Set<number>([0, 1]);

    expect(getNextMockSample(["first", "second"], used, () => 0)).toBe("first");
    expect(used.size).toBe(1);
  });
});
