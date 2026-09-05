import { describe, expect, it } from "vitest";

import { fiscalYearKeys } from "@/features/finance/fiscal-years";
import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
  realtimeResources,
} from "./realtimeQueryRegistry";

describe("realtime query registry", () => {
  it("invalidates the complete Fiscal Years query family", () => {
    expect(isKnownRealtimeResource(realtimeResources.fiscalYears)).toBe(true);
    expect(getRealtimeQueryKeys(realtimeResources.fiscalYears)).toEqual([
      fiscalYearKeys.all,
    ]);
  });

  it("includes Fiscal Years when reconnect invalidates stable prefixes", () => {
    expect(getAllRealtimeQueryKeys()).toContainEqual(fiscalYearKeys.all);
  });
});
