import { describe, expect, it } from "vitest";
import { normalizeClientTelemetryEvent } from "./clientTelemetryContract";

describe("client telemetry contract", () => {
  it("keeps only allowlisted error metadata", () => {
    expect(normalizeClientTelemetryEvent({
      kind: "error",
      source: "route-boundary",
      errorType: "Bearer-secret-error",
      digest: "unsafe digest with spaces",
      message: "token=secret",
      stack: "private stack",
      url: "/reset-password?token=secret",
    })).toEqual({
      kind: "error",
      source: "route-boundary",
      errorType: "unknown",
    });
  });

  it("accepts bounded Web Vitals and navigation measurements", () => {
    expect(normalizeClientTelemetryEvent({
      kind: "web-vital",
      name: "LCP",
      value: 1_250.5,
      delta: 250.5,
      rating: "good",
      navigationType: "navigate",
    })).toEqual({
      kind: "web-vital",
      name: "LCP",
      value: 1_250.5,
      delta: 250.5,
      rating: "good",
      navigationType: "navigate",
    });

    expect(normalizeClientTelemetryEvent({
      kind: "navigation",
      navigationType: "push",
      durationMs: 84.25,
    })).toEqual({
      kind: "navigation",
      navigationType: "push",
      durationMs: 84.25,
    });
  });

  it("rejects unbounded or unknown performance payloads", () => {
    expect(normalizeClientTelemetryEvent({
      kind: "web-vital",
      name: "SECRET",
      value: 1,
      delta: 1,
      rating: "good",
      navigationType: "navigate",
    })).toBeNull();

    expect(normalizeClientTelemetryEvent({
      kind: "navigation",
      navigationType: "push",
      durationMs: Number.POSITIVE_INFINITY,
    })).toBeNull();
  });

  it("accepts only bounded session and SignalR diagnostics", () => {
    expect(normalizeClientTelemetryEvent({
      kind: "session",
      failureKind: "timeout",
      message: "secret",
    })).toEqual({
      kind: "session",
      failureKind: "timeout",
    });

    expect(normalizeClientTelemetryEvent({
      kind: "signalr",
      phase: "reconnecting",
      failureKind: "network",
      suppressedCount: 3,
      url: "/api/hubs/erp?access_token=secret",
    })).toEqual({
      kind: "signalr",
      phase: "reconnecting",
      failureKind: "network",
      suppressedCount: 3,
    });

    expect(normalizeClientTelemetryEvent({
      kind: "session",
      failureKind: "Bearer secret",
    })).toBeNull();
    expect(normalizeClientTelemetryEvent({
      kind: "signalr",
      phase: "start",
      failureKind: "network",
      suppressedCount: 10_001,
    })).toBeNull();
  });
});
