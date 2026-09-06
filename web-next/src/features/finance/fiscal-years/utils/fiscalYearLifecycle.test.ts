import { describe, expect, it } from "vitest";
import { getAvailableFiscalYearLifecycleActions } from "./fiscalYearLifecycle";

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
});
