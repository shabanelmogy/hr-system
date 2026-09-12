import { describe, expect, it } from "vitest";
import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
  registerRealtimeQueryKeys,
} from "./realtimeQueryRegistry";

describe("realtime query registry", () => {
  it("accepts module-owned resource registrations without importing business modules", () => {
    registerRealtimeQueryKeys({ "test-resource": [["test", "all"]] });
    expect(isKnownRealtimeResource("test-resource")).toBe(true);
    expect(getRealtimeQueryKeys("test-resource")).toEqual([["test", "all"]]);
    expect(getAllRealtimeQueryKeys()).toContainEqual(["test", "all"]);
  });
});
