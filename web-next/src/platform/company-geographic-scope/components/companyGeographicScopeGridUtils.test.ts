import { describe, expect, it } from "vitest";
import type { CompanyCountryOption } from "../types/CompanyGeographicScope";
import {
  clearUnselectedOperatingCountry,
  ensureCountrySelected,
  filterCompanyCountries,
  normalizeCompanyCountryIds,
} from "./companyGeographicScopeGridUtils";

const countries: CompanyCountryOption[] = [
  {
    id: 1,
    nameAr: "مصر",
    nameEn: "Egypt",
    alpha2Code: "EG",
    alpha3Code: "EGY",
    isSelected: true,
    isDefault: true,
    isRegistrationCountry: true,
  },
  {
    id: 2,
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    alpha2Code: "SA",
    alpha3Code: "SAU",
    isSelected: false,
    isDefault: false,
    isRegistrationCountry: false,
  },
];

describe("company geographic scope grid utilities", () => {
  it("filters the complete catalog by localized name or ISO code", () => {
    expect(filterCompanyCountries(countries, "مصر").map((country) => country.id)).toEqual([1]);
    expect(filterCompanyCountries(countries, "sau").map((country) => country.id)).toEqual([2]);
    expect(filterCompanyCountries(countries, "  ")).toHaveLength(2);
  });

  it("normalizes Data Grid selection ids", () => {
    expect(normalizeCompanyCountryIds(new Set(["2", 1, 0, "invalid", 2]))).toEqual([2, 1]);
  });

  it("selects a country before it becomes the default without duplicating it", () => {
    expect(ensureCountrySelected([1], 2)).toEqual([1, 2]);
    expect(ensureCountrySelected([1, 2], 2)).toEqual([1, 2]);
  });

  it("clears default and registration values when they are removed from the operating selection", () => {
    expect(clearUnselectedOperatingCountry([1], 2)).toBe(0);
    expect(clearUnselectedOperatingCountry([1, 2], 2)).toBe(2);
  });
});
