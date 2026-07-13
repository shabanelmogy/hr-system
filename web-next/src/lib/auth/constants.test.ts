import { describe, expect, it } from "vitest";
import { isPublicRoute } from "./constants";

describe("isPublicRoute", () => {
  it("matches public pages and their nested paths", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/_next/static/chunk.js")).toBe(true);
  });

  it("does not classify API or protected pages as public", () => {
    expect(isPublicRoute("/api/auth/login")).toBe(false);
    expect(isPublicRoute("/basic-data/countries")).toBe(false);
  });
});
