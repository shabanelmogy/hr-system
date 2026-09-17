import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  hasUnsafeBackendPath,
  isCrossSiteMutation,
  isUntrustedForwardingHeader,
} from "./proxy-security";

describe("proxy security helpers", () => {
  it.each([
    "..",
    "%2E%2E",
    "%252E%252E",
    "%3Fquery",
    "%23fragment",
    "folder/name",
  ])("rejects unsafe backend path segment: %s", (segment) => {
    expect(hasUnsafeBackendPath([segment])).toBe(true);
  });

  it("accepts ordinary backend path segments", () => {
    expect(hasUnsafeBackendPath(["v1", "countries", "getAll"])).toBe(false);
  });

  it("rejects cross-site mutations but permits same-origin requests", () => {
    const crossSite = new NextRequest("https://app.example.test/api/resource", {
      method: "POST",
      headers: { origin: "https://evil.example.test" },
    });
    const sameOrigin = new NextRequest("https://app.example.test/api/resource", {
      method: "POST",
      headers: { origin: "https://app.example.test" },
    });

    expect(isCrossSiteMutation(crossSite)).toBe(true);
    expect(isCrossSiteMutation(sameOrigin)).toBe(false);
  });

  it.each([
    "forwarded",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-real-ip",
    "cf-connecting-ip",
  ])("marks forwarding identity header %s as untrusted", (header) => {
    expect(isUntrustedForwardingHeader(header)).toBe(true);
  });
});
