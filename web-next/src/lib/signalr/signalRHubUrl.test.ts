import { describe, expect, it } from "vitest";

import { resolveSignalRHubUrl } from "./signalRHubUrl";

const httpsLocalhost = { hostname: "localhost", protocol: "https:" } as const;

describe("resolveSignalRHubUrl", () => {
  it("uses the same-origin BFF when no public hub URL is configured", () => {
    expect(resolveSignalRHubUrl(undefined, httpsLocalhost)).toBe("/api/hubs/company");
  });

  it("uses the BFF for loopback-to-loopback local development", () => {
    expect(resolveSignalRHubUrl("http://localhost:5284/hubs/company", httpsLocalhost, false))
      .toBe("/api/hubs/company");
    expect(resolveSignalRHubUrl("https://localhost:7103/hubs/company", httpsLocalhost, false))
      .toBe("/api/hubs/company");
  });

  it("uses the BFF for development even when the backend uses a LAN hostname", () => {
    expect(resolveSignalRHubUrl(
      "https://dev-api.internal.test/hubs/company",
      httpsLocalhost,
      false,
    )).toBe("/api/hubs/company");
  });

  it("uses the BFF instead of mixed-content HTTP from any HTTPS browser origin", () => {
    expect(resolveSignalRHubUrl(
      "http://api.example.test/hubs/company",
      { hostname: "app.example.test", protocol: "https:" },
      true,
    )).toBe("/api/hubs/company");
  });

  it("preserves an explicit secure production hub URL", () => {
    expect(resolveSignalRHubUrl(
      "https://realtime.example.test/hubs/company",
      { hostname: "app.example.test", protocol: "https:" },
      true,
    )).toBe("https://realtime.example.test/hubs/company");
  });
});
