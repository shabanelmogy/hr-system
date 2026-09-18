import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("CSP report endpoint", () => {
  it("accepts a bounded same-origin legacy CSP report and logs only normalized metadata", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: {
        "content-type": "application/csp-report",
        origin: "https://erp.example.test",
      },
      body: JSON.stringify({
        "csp-report": {
          "document-uri": "https://erp.example.test/reset-password?token=secret",
          "effective-directive": "connect-src",
          "blocked-uri": "https://unexpected.example.test/path?token=secret",
          disposition: "report",
        },
      }),
    }));

    expect(response.status).toBe(204);
    expect(warning).toHaveBeenCalledWith("[browser-security] CSP violation", {
      directive: "connect-src",
      blockedKind: "external",
      blockedOrigin: "https://unexpected.example.test",
      disposition: "report",
    });
    expect(JSON.stringify(warning.mock.calls)).not.toContain("token=secret");
    warning.mockRestore();
  });

  it("accepts Reporting API batches", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: { "content-type": "application/reports+json" },
      body: JSON.stringify([{
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src-elem",
          blockedURL: "inline",
          disposition: "report",
        },
      }]),
    }));

    expect(response.status).toBe(204);
    expect(warning).toHaveBeenCalledTimes(1);
    warning.mockRestore();
  });

  it("rejects cross-site, unsupported, malformed and oversized reports", async () => {
    const crossSite = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: {
        "content-type": "application/csp-report",
        origin: "https://evil.example.test",
      },
      body: "{}",
    }));
    expect(crossSite.status).toBe(403);

    const unsupported = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }));
    expect(unsupported.status).toBe(415);

    const malformed = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: "not-json",
    }));
    expect(malformed.status).toBe(400);

    const oversized = await POST(new NextRequest("https://erp.example.test/api/security/csp-report", {
      method: "POST",
      headers: {
        "content-type": "application/csp-report",
        "content-length": "20000",
      },
      body: "{}",
    }));
    expect(oversized.status).toBe(413);
  });
});
