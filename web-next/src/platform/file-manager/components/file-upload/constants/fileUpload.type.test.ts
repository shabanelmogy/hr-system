import { describe, expect, it } from "vitest";
import { FILE_CONFIG, validateFilePolicy } from "./fileUpload.type";

function file(name: string, type: string, size = 10) {
  return { name, type, size } as File;
}

describe("file upload policy", () => {
  it("derives allowed MIME types from extension pairs", () => {
    expect(FILE_CONFIG.ALLOWED_TYPES).toContain("application/x-rar");
    expect(FILE_CONFIG.ALLOWED_TYPES).toContain("text/plain");
    expect(FILE_CONFIG.ALLOWED_TYPES).not.toContain("application/octet-stream");
  });

  it("accepts server-supported aliases and rejects unsafe or mismatched files", () => {
    expect(validateFilePolicy(file("archive.rar", "application/x-rar"))).toBeNull();
    expect(validateFilePolicy(file("rows.csv", "text/plain"))).toBeNull();
    expect(validateFilePolicy(file("image.svg", "image/svg+xml"))).toBe("invalidType");
    expect(validateFilePolicy(file("report.rpt", "application/octet-stream"))).toBe("invalidType");
    expect(validateFilePolicy(file("photo.png", "image/jpeg"))).toBe("invalidType");
  });
});
