import { describe, expect, it } from "vitest";
import { getRealtimeQueryKeys } from "@/platform/realtime";
import { hrRealtimeResources, registerHrRealtimeResources } from "./realtime";

describe("HR realtime registrations", () => {
  it("registers only HR-owned resource invalidation with the platform registry", () => {
    registerHrRealtimeResources();
    expect(getRealtimeQueryKeys(hrRealtimeResources.organizationalStructure)).toEqual([
      ["organizational-structure"],
    ]);
  });
});
