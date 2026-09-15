import { describe, expect, it } from "vitest";
import {
  createStateLookupIndex,
  getStateLookupState,
  resolveStateId,
} from "./districtImport";

describe("District import State lookup", () => {
  const states = [
    { id: 1, nameAr: "القاهرة", nameEn: "Cairo", code: "CAI", countryId: 1 },
    { id: 2, nameAr: "الجيزة", nameEn: "Giza", code: "GIZ", countryId: 1 },
  ];

  it("resolves Arabic and English State names case-insensitively", () => {
    const lookup = createStateLookupIndex(states);

    expect(resolveStateId(lookup, " cairo ")).toBe(1);
    expect(resolveStateId(lookup, "القاهرة")).toBe(1);
    expect(resolveStateId(lookup, "GIZA")).toBe(2);
  });

  it.each([
    [{ canViewStates: false, isPending: true, isError: false, stateCount: 0 }, "forbidden"],
    [{ canViewStates: true, isPending: true, isError: false, stateCount: 0 }, "loading"],
    [{ canViewStates: true, isPending: false, isError: true, stateCount: 0 }, "error"],
    [{ canViewStates: true, isPending: false, isError: false, stateCount: 0 }, "empty"],
    [{ canViewStates: true, isPending: false, isError: false, stateCount: 2 }, "ready"],
  ] as const)("represents the dependency state explicitly", (input, expected) => {
    expect(getStateLookupState(input)).toBe(expected);
  });
});
