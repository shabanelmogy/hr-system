import { describe, expect, it } from "vitest";
import { formatErrorLogDetails } from "./errorLogDetails";
import type { ErrorLogDetail } from "../types/errorLogs";
const detail: ErrorLogDetail = { entry: {
  id: "record-1", occurredOnUtc: "2026-10-19T10:00:00Z", source: "api", severity: "error", userName: "Admin",
  service: "Orders", action: "GetOrder", statusCode: 500, durationMs: 0, correlationId: "trace-1",
  summary: "خطأ\nFull safe message", client: null, browser: "Browser", ipAddress: "127.0.0.1",
}, diagnostics: ["Safe.Long.Method", "Second.Frame"] };
const t = (key: string) => key;
describe("authorized error report", () => {
  it("copies the whole visible system report without flattening lines or losing zero values", () => {
    const report = formatErrorLogDetails(detail, "system", "Local date", t);
    expect(report).toContain("خطأ\nFull safe message");
    expect(report).toContain("errorLogs.duration: 0");
    expect(report).toContain("errorLogs.ipAddress: 127.0.0.1");
    expect(report).toContain("Safe.Long.Method\nSecond.Frame");
    expect(report).toContain("errorLogs.correlation: trace-1");
  });
  it("includes an explicit empty diagnostic section in an authorized system copy", () => {
    const report = formatErrorLogDetails({ ...detail, diagnostics: [] }, "system", "Local date", t);
    expect(report).toContain("errorLogs.diagnostics\nerrorLogs.diagnosticsEmpty\nerrorLogs.diagnosticsEmptyHint");
    expect(report).not.toContain("Safe.Long.Method");
  });
  it("never includes IP or diagnostic data in a company copy, even in an unexpected response", () => {
    const report = formatErrorLogDetails(detail, "company", "Local date", t);
    expect(report).not.toContain("127.0.0.1");
    expect(report).not.toContain("Safe.Long.Method");
    expect(report).not.toContain("errorLogs.ipAddress");
    expect(report).not.toContain("errorLogs.diagnostics");
    expect(report).toContain("Full safe message");
  });
});
