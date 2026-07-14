import { describe, expect, it } from "vitest";
import { normalizeWorldMapMove } from "./worldMapUtils";

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
});
