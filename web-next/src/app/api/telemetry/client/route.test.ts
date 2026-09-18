import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const recordClientTelemetryEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/serverTelemetry", () => ({
  recordClientTelemetryEvent,
}));

import { POST } from "./route";

const originalOtelFlag = process.env.WEB_OTEL_ENABLED;

afterEach(() => {
  if (originalOtelFlag === undefined) {
    delete process.env.WEB_OTEL_ENABLED;
  } else {
    process.env.WEB_OTEL_ENABLED = originalOtelFlag;
  }
  recordClientTelemetryEvent.mockReset();
});

describe("client telemetry ingestion", () => {
  it("drops telemetry cheaply when server OpenTelemetry is disabled", async () => {
    process.env.WEB_OTEL_ENABLED = "false";

    const response = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      body: "not-json",
    }));

    expect(response.status).toBe(204);
    expect(recordClientTelemetryEvent).not.toHaveBeenCalled();
  });

  it("records only normalized allowlisted error metadata", async () => {
    process.env.WEB_OTEL_ENABLED = "true";

    const response = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "error",
        source: "global-boundary",
        errorType: "secret-custom-error",
        digest: "invalid digest",
        message: "Bearer secret",
        stack: "private stack",
        url: "/accept-invitation?token=secret",
      }),
    }));

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(recordClientTelemetryEvent).toHaveBeenCalledWith({
      kind: "error",
      source: "global-boundary",
      errorType: "unknown",
    });
  });

  it("rejects invalid content types and oversized payloads", async () => {
    process.env.WEB_OTEL_ENABLED = "true";

    const unsupported = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }));
    const oversized = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "4096",
      },
      body: "{}",
    }));
    const actualOversized = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ padding: "x".repeat(2_100) }),
    }));

    expect(unsupported.status).toBe(415);
    expect(oversized.status).toBe(413);
    expect(actualOversized.status).toBe(413);
    expect(recordClientTelemetryEvent).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and invalid contracts", async () => {
    process.env.WEB_OTEL_ENABLED = "true";

    const malformed = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }));
    const invalid = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "signalr", phase: "start", failureKind: "secret" }),
    }));

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(recordClientTelemetryEvent).not.toHaveBeenCalled();
  });

  it.each([
    [{ kind: "web-vital", name: "LCP", value: 1_500, delta: 20, rating: "good", navigationType: "navigate" }],
    [{ kind: "navigation", navigationType: "push", durationMs: 125 }],
    [{ kind: "session", failureKind: "network" }],
    [{ kind: "signalr", phase: "reconnecting", failureKind: "transport", suppressedCount: 2 }],
  ])("accepts a safe telemetry contract %#", async (event) => {
    process.env.WEB_OTEL_ENABLED = "true";

    const response = await POST(new NextRequest("https://app.example.test/api/telemetry/client", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    }));

    expect(response.status).toBe(204);
    expect(recordClientTelemetryEvent).toHaveBeenCalledWith(event);
  });
});
