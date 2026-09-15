import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
import { getBackendUrl, getBufferedBodyLimit, resolveRequestBackendUrl } from "./server";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

function request(headers?: HeadersInit) {
  return new NextRequest("https://app.example.test/api/v1/countries", { headers });
}

describe("server backend configuration", () => {
  it("rejects a path-bearing default origin", () => {
    process.env.BACKEND_URL = "https://api.example.test/api/v1";
    expect(() => getBackendUrl()).toThrow(/origin without a path/);
  });

  it("keeps overrides disabled by default", () => {
    process.env.BACKEND_URL = "https://api.example.test";
    delete process.env.BACKEND_OVERRIDE_ENABLED;
    expect(resolveRequestBackendUrl(request({ "x-backend-url": "https://evil.example.test" }))).toBe("https://api.example.test");
  });

  it("accepts an allowlisted header and ignores an unlisted one", () => {
    process.env.BACKEND_URL = "https://api.example.test";
    process.env.BACKEND_OVERRIDE_ENABLED = "true";
    process.env.BACKEND_ALLOWED_ORIGINS = "https://staging.example.test";
    expect(resolveRequestBackendUrl(request({ "x-backend-url": "https://staging.example.test" }))).toBe("https://staging.example.test");
    expect(resolveRequestBackendUrl(request({ "x-backend-url": "https://evil.example.test" }))).toBe("https://api.example.test");
  });

  it("uses an allowlisted cookie when no header override is supplied", () => {
    process.env.BACKEND_URL = "https://api.example.test";
    process.env.BACKEND_OVERRIDE_ENABLED = "true";
    process.env.BACKEND_ALLOWED_ORIGINS = "https://staging.example.test";
    expect(resolveRequestBackendUrl(request({ cookie: "hrms_backend_override=https%3A%2F%2Fstaging.example.test" }))).toBe("https://staging.example.test");
  });

  it("fails fast when the allowlist contains a malformed origin", () => {
    process.env.BACKEND_URL = "https://api.example.test";
    process.env.BACKEND_OVERRIDE_ENABLED = "true";
    process.env.BACKEND_ALLOWED_ORIGINS = "https://staging.example.test,not-an-origin";
    expect(() => resolveRequestBackendUrl(request())).toThrow(/invalid HTTP\(S\) origin/);
  });

  it("requires a positive integer body limit", () => {
    delete process.env.BFF_MAX_BUFFERED_BODY_BYTES;
    expect(getBufferedBodyLimit()).toBe(10 * 1024 * 1024);
    for (const value of ["", "0", "-1", "NaN", "1.5"]) {
      process.env.BFF_MAX_BUFFERED_BODY_BYTES = value;
      expect(() => getBufferedBodyLimit()).toThrow(/positive integer/);
    }
    process.env.BFF_MAX_BUFFERED_BODY_BYTES = "4096";
    expect(getBufferedBodyLimit()).toBe(4096);
  });
});
