import { describe, expect, it } from "vitest";
import {
  parseRoleWithClaimsResponse,
  parseRolesResponse,
  parseUsersResponse,
} from "./apiResponse";

const user = {
  id: "user-1",
  firstName: "Test",
  lastName: "User",
  userName: "test.user",
  email: "test@example.com",
  isDisabled: false,
  isLocked: false,
  profilePicture: null,
  roles: ["Admin"],
};

const role = {
  id: "role-1",
  name: "Admin",
  isDeleted: false,
  roleClaims: null,
};

describe("authentication API response parsing", () => {
  it("parses direct user arrays", () => {
    expect(parseUsersResponse([user])).toEqual([user]);
  });

  it("unwraps result envelopes and wrapped collection items", () => {
    const response = {
      isSuccess: true,
      value: [{ isSuccess: true, value: role }],
    };
    expect(parseRolesResponse(response)).toEqual([role]);
  });

  it("normalizes missing role claims to an empty collection", () => {
    expect(parseRoleWithClaimsResponse(role).roleClaims).toEqual([]);
  });

  it("rejects malformed user payloads", () => {
    expect(() => parseUsersResponse([{ ...user, roles: "Admin" }])).toThrow(
      "Invalid user.roles response",
    );
  });
});
