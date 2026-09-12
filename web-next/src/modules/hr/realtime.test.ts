import { describe, expect, it } from "vitest";
import { fiscalYearKeys } from "./finance";
import { getRealtimeQueryKeys } from "@/platform/realtime";
import { hrRealtimeResources, registerHrRealtimeResources } from "./realtime";

describe("HR realtime registrations", () => {
  it("registers Fiscal Years invalidation with the platform registry", () => {
    registerHrRealtimeResources();
    expect(getRealtimeQueryKeys(hrRealtimeResources.fiscalYears)).toEqual([fiscalYearKeys.all]);
  });

  it("registers dependent geographic query roots from the HR module", () => {
    registerHrRealtimeResources();
    expect(getRealtimeQueryKeys(hrRealtimeResources.states)).toEqual([
      ["states"],
      ["countries"],
      ["districts"],
    ]);
  });
});
