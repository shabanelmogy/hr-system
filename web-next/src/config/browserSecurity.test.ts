import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildReportingEndpointsHeader,
  CONTENT_SECURITY_POLICY_HEADER,
} from "./browserSecurity";

describe("browser security policy", () => {
  it("uses the enforced CSP response header", () => {
    expect(CONTENT_SECURITY_POLICY_HEADER).toBe("Content-Security-Policy");
  });

  it("builds a bounded production policy for the real ERP integrations", () => {
    const policy = buildContentSecurityPolicy({
      NODE_ENV: "production",
      WEB_PUBLIC_ORIGIN: "https://erp.example.test",
      NEXT_PUBLIC_API_URL: "https://api.example.test/api/ignored",
      NEXT_PUBLIC_REPORT_API_URL: "https://reports.example.test/reporting",
      NEXT_PUBLIC_SIGNALR_HUB_URL: "https://realtime.example.test/hubs/company",
    });

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client https://cdn.syncfusion.com");
    expect(policy).toContain("style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style");
    expect(policy).toContain("frame-src 'self' blob: https://accounts.google.com/gsi/ https://api.example.test https://reports.example.test");
    expect(policy).toContain("connect-src 'self' https://accounts.google.com/gsi/ https://cdn.syncfusion.com https://reports.example.test https://realtime.example.test wss://realtime.example.test");
    expect(policy).toContain("worker-src 'self' blob: https://cdn.syncfusion.com");
    expect(policy).toContain("img-src 'self' data: blob:");
    expect(policy).toContain("media-src 'self' data: blob:");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).toContain("report-uri /api/security/csp-report");
    expect(policy).toContain("report-to csp-endpoint");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toMatch(/(^|\s)\*(\s|;|$)/);
    expect(policy).not.toContain("fonts.googleapis.com");
  });

  it("keeps development HMR compatible without broadening the production policy", () => {
    const policy = buildContentSecurityPolicy({ NODE_ENV: "development" });

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("connect-src 'self' https://accounts.google.com/gsi/ https://cdn.syncfusion.com ws: wss:");
    expect(policy).not.toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("report-to csp-endpoint");
  });

  it("drops malformed or credential-bearing configured origins", () => {
    const policy = buildContentSecurityPolicy({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "https://user:secret@api.example.test",
      NEXT_PUBLIC_REPORT_API_URL: "not a URL",
      NEXT_PUBLIC_SIGNALR_HUB_URL: "javascript:alert(1)",
    });

    expect(policy).not.toContain("user:secret");
    expect(policy).not.toContain("not a URL");
    expect(policy).not.toContain("javascript:");
  });

  it("publishes the matching Reporting API endpoint", () => {
    expect(buildReportingEndpointsHeader({
      WEB_PUBLIC_ORIGIN: "https://erp.example.test/some-path",
    })).toBe('csp-endpoint="https://erp.example.test/api/security/csp-report"');
    expect(buildReportingEndpointsHeader({ WEB_PUBLIC_ORIGIN: "http://erp.example.test" })).toBeNull();
    expect(buildReportingEndpointsHeader({})).toBeNull();
  });
});
