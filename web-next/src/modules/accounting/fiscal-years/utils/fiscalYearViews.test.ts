import { describe, expect, it } from "vitest";
import { getFiscalYearViews, isFiscalYearView } from "./fiscalYearViews";

describe("Fiscal Year view policy", () => {
  it("allows only grid/cards and optionally report, regardless of permission", () => {
    expect(getFiscalYearViews(false)).toEqual(["grid", "cards"]);
    expect(getFiscalYearViews(true)).toEqual(["grid", "cards", "report"]);
    expect(isFiscalYearView("report", false)).toBe(false);
    expect(isFiscalYearView("report", true)).toBe(true);

    for (const view of ["import", "export", "chart"]) {
      expect(isFiscalYearView(view, false)).toBe(false);
      expect(isFiscalYearView(view, true)).toBe(false);
    }
  });
});
