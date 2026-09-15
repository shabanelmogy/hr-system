import { describe, expect, it } from "vitest";
import { getNextCountryMockData } from "./countryMockData";

describe("getNextCountryMockData", () => {
  it("returns internally consistent country fields", () => {
    expect(getNextCountryMockData(new Set(), () => 0)).toEqual({
      nameAr: "مصر",
      nameEn: "Egypt",
      alpha2Code: "EG",
      alpha3Code: "EGY",
      phoneCode: "20",
      currencyCode: "EGP",
    });
  });

  it("skips samples already used in the current form session", () => {
    const usedIndexes = new Set<number>();
    const first = getNextCountryMockData(usedIndexes, () => 0);
    const second = getNextCountryMockData(usedIndexes, () => 0);

    expect(second.nameEn).not.toBe(first.nameEn);
    expect(usedIndexes.size).toBe(2);
  });
});
