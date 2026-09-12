import { describe, expect, it } from "vitest";
import type { StateListItem } from "../../types/State";
import {
  prepareCountryData,
  prepareDistrictData,
  prepareTimelineData,
} from "./chartDataUtils";

const states: StateListItem[] = [
  {
    id: 1,
    nameAr: "القاهرة",
    nameEn: "Cairo",
    code: "CAI",
    countryId: 10,
    country: { id: 10, nameAr: "مصر", nameEn: "Egypt", isDeleted: false },
    districtsCount: 4,
    createdOn: "2026-01-05T00:00:00Z",
    updatedOn: null,
    isDeleted: false,
  },
  {
    id: 2,
    nameAr: "الجيزة",
    nameEn: "Giza",
    code: "GIZ",
    countryId: 10,
    country: { id: 10, nameAr: "مصر", nameEn: "Egypt", isDeleted: false },
    districtsCount: 2,
    createdOn: "2026-02-05T00:00:00Z",
    updatedOn: null,
    isDeleted: false,
  },
  {
    id: 3,
    nameAr: "دبي",
    nameEn: "Dubai",
    code: "DXB",
    countryId: 20,
    country: {
      id: 20,
      nameAr: "الإمارات",
      nameEn: "United Arab Emirates",
      isDeleted: false,
    },
    districtsCount: 0,
    createdOn: "not-a-date",
    updatedOn: null,
    isDeleted: false,
  },
];

describe("State chart data", () => {
  it("groups the loaded page by stable country id and active locale", () => {
    expect(prepareCountryData(states, "en")).toEqual([
      { name: "Egypt", value: 2 },
      { name: "United Arab Emirates", value: 1 },
    ]);
    expect(prepareCountryData(states, "ar")[0]?.name).toBe("مصر");
  });

  it("builds a localized top-district list from the loaded page", () => {
    expect(prepareDistrictData(states, "ar")).toEqual([
      { name: "القاهرة", value: 4 },
      { name: "الجيزة", value: 2 },
    ]);
  });

  it("ignores invalid dates and calculates a deterministic cumulative timeline", () => {
    expect(prepareTimelineData(states)).toEqual([
      { month: "2026-01", count: 1, cumulative: 1 },
      { month: "2026-02", count: 1, cumulative: 2 },
    ]);
  });
});
