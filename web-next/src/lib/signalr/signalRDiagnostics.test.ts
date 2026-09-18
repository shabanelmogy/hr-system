import { describe, expect, it, vi } from "vitest";
import {
  SignalRDiagnosticReporter,
  classifySignalRFailure,
  getSignalRRestartDelayMs,
} from "./signalRDiagnostics";

describe("SignalR diagnostics", () => {
  it.each([
    ["Failed to complete negotiation with the server", "negotiation"],
    ["Realtime token request failed", "token"],
    ["Server returned status code '401'", "unauthorized"],
    ["Failed to fetch", "network"],
    ["WebSocket transport failed", "transport"],
    ["Request timed out", "timeout"],
  ] as const)("classifies %s", (message, expected) => {
    expect(classifySignalRFailure(new Error(message))).toBe(expected);
  });

  it("caps restart backoff at one minute", () => {
    expect(getSignalRRestartDelayMs(0)).toBe(5_000);
    expect(getSignalRRestartDelayMs(1)).toBe(15_000);
    expect(getSignalRRestartDelayMs(2)).toBe(30_000);
    expect(getSignalRRestartDelayMs(3)).toBe(60_000);
    expect(getSignalRRestartDelayMs(99)).toBe(60_000);
  });

  it("suppresses repeated diagnostics and never emits the raw failure message", () => {
    let now = 1_000;
    const warn = vi.fn();
    const telemetry = vi.fn();
    const reporter = new SignalRDiagnosticReporter(() => now, warn, 30_000, telemetry);

    reporter.report("start", new Error("Failed to fetch https://example.test/?access_token=secret"));
    reporter.report("start", new Error("Failed to fetch https://example.test/?access_token=secret"));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(telemetry).toHaveBeenCalledTimes(1);
    expect(telemetry).toHaveBeenLastCalledWith("start", "network", undefined);
    expect(JSON.stringify(warn.mock.calls[0])).not.toContain("secret");

    now += 30_001;
    reporter.report("start", new Error("Failed to fetch again"));

    expect(warn).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenLastCalledWith("start", "network", 1);
    expect(warn.mock.calls[1]?.[1]).toMatchObject({
      phase: "start",
      failureKind: "network",
      suppressedCount: 1,
    });
  });
});
