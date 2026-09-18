import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginClientNavigation,
  completeClientNavigation,
  reportClientError,
  reportSessionRevalidationFailure,
  reportSignalRDiagnostic,
  reportWebVital,
} from "./clientTelemetry";

const originalTelemetryFlag = process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED;

afterEach(() => {
  if (originalTelemetryFlag === undefined) {
    delete process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED;
  } else {
    process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED = originalTelemetryFlag;
  }
  vi.unstubAllGlobals();
});

describe("client telemetry reporter", () => {
  it("does nothing while browser telemetry is disabled", () => {
    process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED = "false";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    reportClientError("window-error", new Error("private message"));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports error classification without message, stack, referrer, or credentials", () => {
    process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED = "true";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const error = new TypeError("Bearer secret-token");
    error.stack = "https://app.example.test/reset-password?token=secret";
    reportClientError("route-boundary", error);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/telemetry/client");
    expect(init.credentials).toBe("omit");
    expect(init.referrerPolicy).toBe("no-referrer");
    expect(JSON.parse(String(init.body))).toEqual({
      kind: "error",
      source: "route-boundary",
      errorType: "TypeError",
    });
  });

  it("reports Web Vitals and completed navigation duration", () => {
    process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED = "true";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    reportWebVital({
      name: "INP",
      value: 180,
      delta: 30,
      rating: "good",
      navigationType: "navigate",
    });
    beginClientNavigation("replace", 100);
    completeClientNavigation(245.5);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      kind: "web-vital",
      name: "INP",
      value: 180,
      delta: 30,
      rating: "good",
      navigationType: "navigate",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      kind: "navigation",
      navigationType: "replace",
      durationMs: 145.5,
    });
  });

  it("reports only classified session and SignalR diagnostics", () => {
    process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED = "true";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    reportSessionRevalidationFailure("unavailable");
    reportSignalRDiagnostic("closed", "transport", 2);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      kind: "session",
      failureKind: "unavailable",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      kind: "signalr",
      phase: "closed",
      failureKind: "transport",
      suppressedCount: 2,
    });
  });
});
