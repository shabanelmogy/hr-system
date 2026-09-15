import { describe, expect, it } from "vitest";
import { parseApiErrorPayload } from "./client";

describe("parseApiErrorPayload", () => {
  it("preserves Problem Details metadata and keeps field names out of codes", () => {
    const error = parseApiErrorPayload({
      type: "urn:problem:file-scanner",
      title: "File scanner unavailable",
      detail: "The malware scanner is unavailable.",
      traceId: "trace-1",
      code: "FileScannerUnavailable",
      codes: ["FileScannerUnavailable", "UploadRejected"],
      errors: { files: ["The file could not be scanned."], name: ["Name is required"] },
    }, 503);

    expect(error).toMatchObject({
      status: 503,
      title: "File scanner unavailable",
      detail: "The malware scanner is unavailable.",
      traceId: "trace-1",
      type: "urn:problem:file-scanner",
      code: "FileScannerUnavailable",
      errorCodes: ["FileScannerUnavailable", "UploadRejected"],
      fieldErrors: { files: ["The file could not be scanned."], name: ["Name is required"] },
    });
    expect(error.errorCodes).not.toContain("files");
    expect(error.errorCodes).not.toContain("name");
  });
});
