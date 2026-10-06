import { describe, expect, it } from "vitest";
import { canSetFiscalYearAsCurrent, getAvailableFiscalYearLifecycleActions } from "./fiscalYearLifecycle";

describe("Fiscal Year lifecycle presentation", () => {
  it.each([
    [1, ["open"]],
    [2, ["beginClosing"]],
    [3, ["close"]],
    [4, ["reopen", "lock"]],
    [5, ["reopen"]],
  ] as const)("maps status %s to its exact actions", (status, expected) => {
    expect(getAvailableFiscalYearLifecycleActions(status)).toEqual(expected);
  });

  it.each([
    [1, false],
    [2, true],
    [3, false],
    [4, false],
    [5, false],
  ] as const)("allows Set Current only for a non-current active Open year (status %s)", (status, expected) => {
    expect(canSetFiscalYearAsCurrent({ status, isDeleted: false, isCurrent: false })).toBe(expected);
  });

  it("rejects archived and already-current rows", () => {
    expect(canSetFiscalYearAsCurrent({ status: 2, isDeleted: true, isCurrent: false })).toBe(false);
    expect(canSetFiscalYearAsCurrent({ status: 2, isDeleted: false, isCurrent: true })).toBe(false);
  });
});
