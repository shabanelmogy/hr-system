import { describe, expect, it } from "vitest";
import { normalizeCspViolationReports } from "./cspReport";

describe("CSP report normalization", () => {
  it("normalizes legacy reports without retaining document paths or query strings", () => {
    expect(normalizeCspViolationReports({
      "csp-report": {
        "document-uri": "https://erp.example.test/reset-password?token=secret",
        "effective-directive": "script-src-elem",
        "blocked-uri": "https://unexpected.example.test/assets/injected.js?token=secret",
        disposition: "report",
        "status-code": 200,
        "source-file": "https://erp.example.test/private/path.js",
      },
    })).toEqual([{
      directive: "script-src-elem",
      blockedKind: "external",
      blockedOrigin: "https://unexpected.example.test",
      disposition: "report",
      statusCode: 200,
    }]);
  });

  it("accepts Reporting API batches and classifies inline/eval/blob/data sources", () => {
    const make = (blockedURL: string) => ({
      type: "csp-violation",
      body: {
        effectiveDirective: "style-src-elem",
        blockedURL,
        documentURL: "https://erp.example.test/page",
        disposition: "report",
      },
    });

    expect(normalizeCspViolationReports([
      make("inline"),
      make("eval"),
      make("blob:https://erp.example.test/id"),
      make("data:text/plain;base64,AAAA"),
    ]).map((report) => report.blockedKind)).toEqual(["inline", "eval", "blob", "data"]);
  });

  it("classifies same-origin blocks without retaining the path", () => {
    const violation = normalizeCspViolationReports({
      "csp-report": {
        "document-uri": "https://erp.example.test/private/page",
        "effective-directive": "img-src",
        "blocked-uri": "https://erp.example.test/private/image.png?token=secret",
      },
    })[0];

    expect(violation).toMatchObject({
      blockedKind: "same-origin",
    });
    expect(violation).not.toHaveProperty("blockedOrigin");
  });

  it("rejects malformed directives and unrelated Reporting API entries", () => {
    expect(normalizeCspViolationReports({
      "csp-report": {
        "effective-directive": "script-src; injected",
        "blocked-uri": "https://example.test",
      },
    })).toEqual([]);

    expect(normalizeCspViolationReports([{ type: "deprecation", body: {} }])).toEqual([]);
  });
});
