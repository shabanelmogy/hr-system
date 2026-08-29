import { describe, expect, it } from "vitest";
import { getNextAddressTypeMockData } from "./addressTypeMockData";

describe("getNextAddressTypeMockData", () => {
  it("returns a valid Address Type sample", () => {
    expect(getNextAddressTypeMockData(new Set(), () => 0)).toEqual({
      nameAr: "منزل",
      nameEn: "Home",
    });
  });

  it("does not repeat a sample until the cycle is exhausted", () => {
    const usedIndexes = new Set<number>();
    const first = getNextAddressTypeMockData(usedIndexes, () => 0);
    const second = getNextAddressTypeMockData(usedIndexes, () => 0);

    expect(second).not.toEqual(first);
  });
});
