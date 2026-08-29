import { describe, expect, it } from "vitest";
import { getNextDistrictMockData } from "./districtMockData";

describe("getNextDistrictMockData", () => {
  it("keeps the generated district tied to the selected state", () => {
    expect(getNextDistrictMockData(new Set(), 7, () => 0)).toEqual({
      nameAr: "مدينة نصر",
      nameEn: "Nasr City",
      code: "NSR",
      stateId: 7,
    });
  });
});
