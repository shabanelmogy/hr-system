import { describe, expect, it } from "vitest";
import {
  normalizeWorldMapCountryId,
  normalizeWorldMapMove,
} from "./worldMapUtils";

describe("normalizeWorldMapCountryId", () => {
  it.each([
    ["us", "US"],
    ["GBR", "GB"],
    ["840", "US"],
    ["032", "AR"],
  ])("normalizes %s to %s", (value, expected) => {
    expect(normalizeWorldMapCountryId(value)).toBe(expected);
  });

  it.each([undefined, null, "", "not-a-country", 9999])(
    "rejects an invalid country id: %j",
    (value) => {
      expect(normalizeWorldMapCountryId(value)).toBeNull();
    },
  );
});

describe("normalizeWorldMapMove", () => {
  it.each([undefined, null, {}, { coordinates: [] }, { coordinates: [10] }])(
    "rejects an invalid move payload: %j",
    (payload) => {
      expect(normalizeWorldMapMove(payload)).toBeNull();
    },
  );

  it("rejects non-finite coordinates and zoom values", () => {
    expect(
      normalizeWorldMapMove({ coordinates: [Number.NaN, 10], zoom: 1 }),
    ).toBeNull();
    expect(
      normalizeWorldMapMove({ coordinates: [10, 20], zoom: Number.POSITIVE_INFINITY }),
    ).toBeNull();
  });

  it("normalizes a valid move payload", () => {
    expect(
      normalizeWorldMapMove({ coordinates: [-30.5, 12.25], zoom: 1.75 }),
    ).toEqual({ center: [-30.5, 12.25], zoom: 1.75 });
  });

  it("clamps coordinates and zoom to supported map bounds", () => {
    expect(
      normalizeWorldMapMove({ coordinates: [220, -100], zoom: 99 }),
    ).toEqual({ center: [180, -90], zoom: 4 });
    expect(
      normalizeWorldMapMove({ coordinates: [-220, 100], zoom: 0 }),
    ).toEqual({ center: [-180, 90], zoom: 0.6 });
  });
});
