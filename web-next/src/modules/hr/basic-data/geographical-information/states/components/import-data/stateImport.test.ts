import { describe, expect, it } from "vitest";
import {
  createCountryLookupIndex,
  getCountryLookupState,
  resolveCountryId,
} from "./stateImport";

describe("State import country lookup", () => {
  const countries = [
    { id: 1, nameAr: "مصر", nameEn: "Egypt", isDeleted: false },
    { id: 2, nameAr: "السعودية", nameEn: "Saudi Arabia", isDeleted: false },
  ];

  it("resolves Arabic and English names case-insensitively", () => {
    const lookup = createCountryLookupIndex(countries);

    expect(resolveCountryId(lookup, " egypt ")).toBe(1);
    expect(resolveCountryId(lookup, "مصر")).toBe(1);
    expect(resolveCountryId(lookup, "SAUDI ARABIA")).toBe(2);
  });

  it.each([
    [{ canViewCountries: false, isPending: true, isError: false, countryCount: 0 }, "forbidden"],
    [{ canViewCountries: true, isPending: true, isError: false, countryCount: 0 }, "loading"],
    [{ canViewCountries: true, isPending: false, isError: true, countryCount: 0 }, "error"],
    [{ canViewCountries: true, isPending: false, isError: false, countryCount: 0 }, "empty"],
    [{ canViewCountries: true, isPending: false, isError: false, countryCount: 2 }, "ready"],
  ] as const)("represents dependency state explicitly", (input, expected) => {
    expect(getCountryLookupState(input)).toBe(expected);
  });
});
