import { describe, expect, it } from "vitest";
import { formatErrorReport } from "./formatErrorReport";

describe("formatErrorReport", () => {
  it("includes support identifiers and avoids repeating detail text", () => {
    const report = formatErrorReport(
      {
        reportId: "report-1",
        title: "Request failed",
        messages: ["The country already exists."],
        detail: "The country already exists.",
        status: 409,
        traceId: "trace-1",
      },
      "HRMS error report",
    );

    expect(report).toContain("Report ID: report-1");
    expect(report).toContain("Status: 409");
    expect(report).toContain("Trace ID: trace-1");
    expect(report.match(/The country already exists\./g)).toHaveLength(1);
  });
});
