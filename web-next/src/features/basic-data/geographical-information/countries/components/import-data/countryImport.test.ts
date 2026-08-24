import { describe, expect, it } from "vitest";
import {
  createCountryImportDuplicateTracker,
  registerCountryImportValues,
} from "./countryImport";

describe("Country import duplicate tracking", () => {
  it("compares each unique field only with the same field", () => {
    const tracker = createCountryImportDuplicateTracker();

    expect(registerCountryImportValues(tracker, {
      nameAr: "مصر",
      nameEn: "Egypt",
      alpha2Code: "EG",
      alpha3Code: "EGY",
    })).toBe(false);
    expect(registerCountryImportValues(tracker, {
      nameAr: "EGYPT",
      nameEn: "Arab Republic",
      alpha2Code: "AR",
      alpha3Code: "ARB",
    })).toBe(false);
  });

  it("rejects case-insensitive duplicates in a matching field", () => {
    const tracker = createCountryImportDuplicateTracker();

    registerCountryImportValues(tracker, {
      nameAr: "مصر",
      nameEn: "Egypt",
      alpha2Code: "EG",
      alpha3Code: "EGY",
    });

    expect(registerCountryImportValues(tracker, {
      nameAr: "السعودية",
      nameEn: " egypt ",
      alpha2Code: "SA",
      alpha3Code: "SAU",
    })).toBe(true);
  });

  it("allows repeated blank optional alpha codes", () => {
    const tracker = createCountryImportDuplicateTracker();

    expect(registerCountryImportValues(tracker, {
      nameAr: "الأول",
      nameEn: "First",
      alpha2Code: null,
      alpha3Code: "",
    })).toBe(false);
    expect(registerCountryImportValues(tracker, {
      nameAr: "الثاني",
      nameEn: "Second",
      alpha2Code: "",
      alpha3Code: null,
    })).toBe(false);
  });
});
