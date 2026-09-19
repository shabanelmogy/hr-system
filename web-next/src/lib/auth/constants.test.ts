import { describe, expect, it } from "vitest";
import { isPublicRoute } from "./constants";

describe("isPublicRoute", () => {
  it("matches exact public auth pages and static public prefixes", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/_next/static/chunk.js")).toBe(true);
    expect(isPublicRoute("/.well-known/assetlinks.json")).toBe(true);
  });

  it("does not classify API or protected pages as public", () => {
    expect(isPublicRoute("/api/auth/login")).toBe(false);
    expect(isPublicRoute("/basic-data/countries")).toBe(false);
    expect(isPublicRoute("/login/e2e-missing-route")).toBe(false);
    expect(isPublicRoute("/register/extra")).toBe(false);
  });
});
