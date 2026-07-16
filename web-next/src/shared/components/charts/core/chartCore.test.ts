import { describe, expect, it } from "vitest";

import { getBarChartLayout } from "./layout";
import { clamp, getFiniteExtent, getSafeScaleMax, normalizeValue, safePercentage } from "./numeric";

describe("chart numeric helpers", () => {
  it("keeps percentages finite and inside the chart range", () => {
    expect(safePercentage(50, 0, 100)).toBe(50);
    expect(safePercentage(150, 0, 100)).toBe(100);
    expect(safePercentage(-10, 0, 100)).toBe(0);
    expect(safePercentage(10, 10, 10)).toBe(0);
    expect(Number.isFinite(safePercentage(Number.NaN))).toBe(true);
  });

  it("normalizes constant series without producing NaN", () => {
    expect(normalizeValue(7, 7, 7)).toBe(0.5);
    expect(clamp(Number.NaN, 0, 1)).toBe(0);
  });

  it("ignores non-finite values when calculating chart bounds", () => {
    expect(getFiniteExtent([])).toBeNull();
    expect(getFiniteExtent([Number.NaN, 4, -2, Number.POSITIVE_INFINITY])).toEqual({ min: -2, max: 4 });
    expect(getSafeScaleMax(0, -5, Number.NaN)).toBe(1);
    expect(getSafeScaleMax(4, 12)).toBe(12);
  });
});

describe("bar chart orientation", () => {
  it("maps visual orientation to the inverse Recharts layout contract", () => {
    expect(getBarChartLayout("vertical")).toBe("horizontal");
    expect(getBarChartLayout("horizontal")).toBe("vertical");
  });
});
