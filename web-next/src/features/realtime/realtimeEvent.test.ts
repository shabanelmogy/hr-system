import { describe, expect, it } from "vitest";
import { parseRealtimeEntityChanged } from "./realtimeEvent";
import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
} from "./realtimeQueryRegistry";

describe("realtime entity changes", () => {
  it("accepts the backend invalidation contract", () => {
    expect(parseRealtimeEntityChanged({
      eventId: "11111111-1111-4111-8111-111111111111",
      occurredAtUtc: "2026-08-09T12:00:00Z",
      resource: "countries",
      action: "Update",
      entityId: "7",
    })).toEqual(expect.objectContaining({ resource: "countries", entityId: "7" }));
  });

  it("rejects malformed events without throwing", () => {
    expect(parseRealtimeEntityChanged({ resource: "countries" })).toBeNull();
  });

  it("refreshes dependent geographic query roots", () => {
    expect(getRealtimeQueryKeys("states")).toEqual([
      ["states"],
      ["countries"],
      ["districts"],
    ]);
  });

  it("returns unique query roots for reconnect catch-up", () => {
    const serialized = getAllRealtimeQueryKeys().map((key) => JSON.stringify(key));
    expect(new Set(serialized).size).toBe(serialized.length);
  });

  it("refreshes profile and notification caches across clients", () => {
    expect(getRealtimeQueryKeys("users")).toContainEqual(["userProfile"]);
    expect(getRealtimeQueryKeys("users")).toContainEqual(["tenant-admins"]);
    expect(getRealtimeQueryKeys("notifications")).toEqual([["notifications"]]);
  });

  it("distinguishes targeted resources from generic fallback resources", () => {
    expect(isKnownRealtimeResource("roles")).toBe(true);
    expect(isKnownRealtimeResource("uploaded-files")).toBe(false);
  });
});
