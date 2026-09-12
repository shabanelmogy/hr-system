import { describe, expect, it } from "vitest";
import {
  createDistrictImportDuplicateTracker,
  registerDistrictImportValues,
} from "./districtImportDuplicates";

describe("District import duplicate tracking", () => {
  it("compares each unique field only with the same field", () => {
    const tracker = createDistrictImportDuplicateTracker();

    expect(registerDistrictImportValues(tracker, 1, {
      nameAr: "المعادي",
      nameEn: "Maadi",
      code: "MAA",
    })).toBe(false);
    expect(registerDistrictImportValues(tracker, 1, {
      nameAr: "الزمالك",
      nameEn: "Zamalek",
      code: "MAADI",
    })).toBe(false);
  });

  it("rejects case-insensitive duplicates within the same field and State", () => {
    const tracker = createDistrictImportDuplicateTracker();

    expect(registerDistrictImportValues(tracker, 1, {
      nameAr: "المعادي",
      nameEn: "Maadi",
      code: "MAA",
    })).toBe(false);
    expect(registerDistrictImportValues(tracker, 1, {
      nameAr: "الزمالك",
      nameEn: " maadi ",
      code: "ZAM",
    })).toBe(true);
  });

  it("allows the same values under a different State", () => {
    const tracker = createDistrictImportDuplicateTracker();
    const district = { nameAr: "المعادي", nameEn: "Maadi", code: "MAA" };

    expect(registerDistrictImportValues(tracker, 1, district)).toBe(false);
    expect(registerDistrictImportValues(tracker, 2, district)).toBe(false);
  });
});
