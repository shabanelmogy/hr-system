import { describe, expect, it } from "vitest";
import { normalizeHealthCheckReport } from "./healthCheckService";

describe("normalizeHealthCheckReport", () => {
  it("normalizes the ASP.NET health check UI response", () => {
    const report = normalizeHealthCheckReport({
      status: "Unhealthy",
      totalDuration: "00:00:00.1250000",
      entries: {
        database: {
          status: "Healthy",
          duration: "00:00:00.0250000",
        },
        "external api": {
          status: "Unhealthy",
          duration: "00:00:00.1000000",
          description: "The remote endpoint did not respond.",
        },
      },
    });

    expect(report.status).toBe("Unhealthy");
    expect(report.entries).toEqual([
      {
        name: "database",
        status: "Healthy",
        duration: "00:00:00.0250000",
        description: null,
      },
      {
        name: "external api",
        status: "Unhealthy",
        duration: "00:00:00.1000000",
        description: "The remote endpoint did not respond.",
      },
    ]);
  });

  it("rejects non-health-check responses", () => {
    expect(() => normalizeHealthCheckReport({ title: "Unauthorized" })).toThrow(
      "Invalid health check response.",
    );
  });
});
