import { describe, expect, it } from "vitest";
import {
  createAddressTypeImportDuplicateTracker,
  registerAddressTypeImportValues,
} from "./addressTypeImport";

describe("Address Type import duplicate tracking", () => {
  it("allows distinct Arabic and English names", () => {
    const tracker = createAddressTypeImportDuplicateTracker();

    expect(registerAddressTypeImportValues(tracker, {
      nameAr: "المنزل",
      nameEn: "Home",
    })).toBe(false);
    expect(registerAddressTypeImportValues(tracker, {
      nameAr: "العمل",
      nameEn: "Work",
    })).toBe(false);
  });

  it("rejects normalized duplicates in either name field", () => {
    const tracker = createAddressTypeImportDuplicateTracker();

    registerAddressTypeImportValues(tracker, {
      nameAr: "المنزل",
      nameEn: "Home",
    });

    expect(registerAddressTypeImportValues(tracker, {
      nameAr: "العمل",
      nameEn: " home ",
    })).toBe(true);
  });
});
