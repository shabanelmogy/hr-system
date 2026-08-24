import { describe, expect, it } from "vitest";
import {
  createStateImportDuplicateTracker,
  registerStateImportValues,
} from "./stateImportDuplicates";

describe("State import duplicate tracking", () => {
  it("compares each unique field only with the same field", () => {
    const tracker = createStateImportDuplicateTracker();

    expect(registerStateImportValues(tracker, 1, {
      nameAr: "دلتا",
      nameEn: "Delta",
      code: "DLT",
    })).toBe(false);
    expect(registerStateImportValues(tracker, 1, {
      nameAr: "القاهرة",
      nameEn: "Cairo",
      code: "DELTA",
    })).toBe(false);
  });

  it("rejects case-insensitive duplicates within the same field and country", () => {
    const tracker = createStateImportDuplicateTracker();

    expect(registerStateImportValues(tracker, 1, {
      nameAr: "دلتا",
      nameEn: "Delta",
      code: "DLT",
    })).toBe(false);
    expect(registerStateImportValues(tracker, 1, {
      nameAr: "القاهرة",
      nameEn: " delta ",
      code: "CAI",
    })).toBe(true);
  });

  it("allows the same values under a different country", () => {
    const tracker = createStateImportDuplicateTracker();
    const state = { nameAr: "دلتا", nameEn: "Delta", code: "DLT" };

    expect(registerStateImportValues(tracker, 1, state)).toBe(false);
    expect(registerStateImportValues(tracker, 2, state)).toBe(false);
  });
});
