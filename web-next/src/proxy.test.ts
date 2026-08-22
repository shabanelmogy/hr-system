import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { proxy } from "./proxy";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("page proxy", () => {
  it("redirects an unauthenticated protected request to login", () => {
    const response = proxy(request("/basic-data/countries?status=active"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.example.test/login?returnTo=%2Fbasic-data%2Fcountries%3Fstatus%3Dactive",
    );
  });

  it("allows a protected request with auth cookies without calling the backend", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = proxy(authenticatedRequest("/"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects an authenticated public request to home without calling the backend", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = proxy(authenticatedRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function request(pathname: string, cookie?: string) {
  return new NextRequest(`https://app.example.test${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function authenticatedRequest(pathname: string) {
  return request(
    pathname,
    `${ACCESS_TOKEN_COOKIE}=access-token; ${REFRESH_TOKEN_COOKIE}=refresh-token`,
  );
}
