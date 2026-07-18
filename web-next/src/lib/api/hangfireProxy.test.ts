import { describe, expect, it } from "vitest";
import {
  createHangfireBackendPath,
  isHangfireAntiforgeryCookie,
  rewriteHangfireAntiforgeryCookie,
  rewriteHangfireLocation,
} from "./hangfireProxy";

describe("Hangfire proxy helpers", () => {
  it("builds encoded dashboard paths", () => {
    expect(createHangfireBackendPath()).toBe("/hangfire");
    expect(createHangfireBackendPath(["jobs", "failed jobs"])).toBe(
      "/hangfire/jobs/failed%20jobs",
    );
  });

  it("rewrites backend dashboard redirects to the same-origin proxy", () => {
    expect(
      rewriteHangfireLocation(
        "https://localhost:7037/hangfire/jobs?state=failed",
        "https://localhost:7037",
      ),
    ).toBe("/hangfire/jobs?state=failed");
    expect(
      rewriteHangfireLocation("https://example.com/other", "https://localhost:7037"),
    ).toBe("https://example.com/other");
  });

  it("forwards only Hangfire antiforgery cookies without backend domains", () => {
    const cookie =
      ".AspNetCore.Antiforgery.token=value; Path=/hangfire; Domain=localhost; Secure";

    expect(isHangfireAntiforgeryCookie(".AspNetCore.Antiforgery.token")).toBe(true);
    expect(isHangfireAntiforgeryCookie("__Host-hrms-access-token")).toBe(false);
    expect(rewriteHangfireAntiforgeryCookie(cookie)).toBe(
      ".AspNetCore.Antiforgery.token=value; Path=/hangfire; Secure",
    );
    expect(rewriteHangfireAntiforgeryCookie("session=value; Path=/")).toBeNull();
  });
});
