import { describe, expect, it } from "vitest";
import { canPublishCrystalReportVersion, canRevalidateCrystalReportVersion } from "./lifecycle";

describe("managed Crystal report lifecycle actions", () => {
  it.each(["Pending", "Invalid", "NeedsRevalidation"] as const)(
    "does not allow publishing a %s version",
    (status) => {
      expect(canPublishCrystalReportVersion(status, true, false)).toBe(false);
    },
  );

  it("allows publishing only a valid non-archived version with permission", () => {
    expect(canPublishCrystalReportVersion("Valid", true, false)).toBe(true);
    expect(canPublishCrystalReportVersion("Valid", false, false)).toBe(false);
    expect(canPublishCrystalReportVersion("Valid", true, true)).toBe(false);
  });

  it("allows revalidation only for a non-archived report with upload capability", () => {
    expect(canRevalidateCrystalReportVersion(true, false)).toBe(true);
    expect(canRevalidateCrystalReportVersion(false, false)).toBe(false);
    expect(canRevalidateCrystalReportVersion(true, true)).toBe(false);
  });
});
