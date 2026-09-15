import { describe, expect, it } from "vitest";
import { canUseCrystalReportFile, formatCrystalReportBytes } from "./files";

describe("crystal report file policy", () => {
  it("accepts only non-empty RPT files within the managed 10 MiB limit", () => {
    expect(canUseCrystalReportFile(new File(["rpt"], "Countries.rpt"))).toBe(true);
    expect(canUseCrystalReportFile(new File([], "Countries.rpt"))).toBe(false);
    expect(canUseCrystalReportFile(new File(["rpt"], "Countries.pdf"))).toBe(false);
    expect(canUseCrystalReportFile(new File([new Uint8Array(10 * 1024 * 1024 + 1)], "Countries.rpt"))).toBe(false);
  });

  it("formats bounded report sizes consistently", () => {
    expect(formatCrystalReportBytes(500)).toBe("500 B");
    expect(formatCrystalReportBytes(2048)).toBe("2.0 KB");
    expect(formatCrystalReportBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
