import { describe, expect, it } from "vitest";
import type { CountryListItem } from "../../types/Country";
import {
  getTotalStatesCount,
  prepareCurrencyData,
  prepareStatesCoverageData,
  prepareStatesData,
  prepareTimelineData,
} from "./chartDataUtils";

const makeCountry = (
  id: number,
  overrides: Partial<CountryListItem> = {},
): CountryListItem => ({
  id,
  nameAr: `دولة ${id}`,
  nameEn: `Country ${id}`,
  alpha2Code: null,
  alpha3Code: null,
  phoneCode: null,
  currencyCode: null,
  statesCount: 0,
  createdOn: "2026-01-01T00:00:00Z",
  updatedOn: null,
  isDeleted: false,
  ...overrides,
});

describe("country chart page adapters", () => {
  it("groups currencies and sorts the visible page by frequency", () => {
    const countries = [
      makeCountry(1, { currencyCode: "EGP" }),
      makeCountry(2, { currencyCode: "USD" }),
      makeCountry(3, { currencyCode: "EGP" }),
      makeCountry(4),
    ];

    expect(prepareCurrencyData(countries)).toEqual([
      { name: "EGP", value: 2 },
      { name: "USD", value: 1 },
    ]);
  });

  it("uses the active language for country labels", () => {
    const countries = [makeCountry(1, { nameAr: "مصر", nameEn: "Egypt", statesCount: 3 })];

    expect(prepareStatesData(countries, "en")[0]?.name).toBe("Egypt");
    expect(prepareStatesData(countries, "ar-EG")[0]?.name).toBe("مصر");
  });

  it("builds an honest with/without-states distribution for the visible page", () => {
    const countries = [
      makeCountry(1, { statesCount: 2 }),
      makeCountry(2, { statesCount: 0 }),
      makeCountry(3, { statesCount: 1 }),
    ];

    expect(prepareStatesCoverageData(countries, {
      withStates: "With",
      withoutStates: "Without",
    })).toEqual([
      { name: "With", value: 2 },
      { name: "Without", value: 1 },
    ]);
    expect(getTotalStatesCount(countries)).toBe(3);
  });

  it("ignores invalid timestamps instead of breaking the chart view", () => {
    const countries = [
      makeCountry(1, { createdOn: "2026-01-15T00:00:00Z" }),
      makeCountry(2, { createdOn: "not-a-date" }),
      makeCountry(3, { createdOn: "2026-02-01T00:00:00Z" }),
    ];

    expect(prepareTimelineData(countries)).toEqual([
      { month: "2026-01", count: 1, cumulative: 1 },
      { month: "2026-02", count: 1, cumulative: 2 },
    ]);
  });
});
