import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { decodeRequestSession, encodeRequestSession } from "./request-session";

const session = {
  userId: "user-id",
  userName: "مستخدم",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: ["admin"],
  permissions: ["Users:View"],
  expiresAt: Date.now() + 60_000,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("request session header", () => {
  it("round-trips verified session claims", () => {
    expect(decodeRequestSession(encodeRequestSession(session))).toEqual(session);
  });

  it("rejects malformed and expired values", () => {
    expect(decodeRequestSession("not-base64-json")).toBeNull();
    expect(
      decodeRequestSession(
        encodeRequestSession({ ...session, expiresAt: Date.now() - 1 }),
      ),
    ).toBeNull();
  });
});
