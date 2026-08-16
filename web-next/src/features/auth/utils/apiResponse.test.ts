import { describe, expect, it } from "vitest";
import {
  parseRoleWithClaimsResponse,
  parseRolesResponse,
  parseUsersResponse,
  parseUsersPageResponse,
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
  companyIds: [1, 2],
  defaultCompanyId: 1,
  lifecycleStatus: "active",
  archivedOn: null,
  archiveReason: null,
};

const role = {
  id: "role-1",
  name: "Admin",
  isSystem: true,
  isDeleted: false,
  roleClaims: null,
};

describe("authentication API response parsing", () => {
  it("parses direct user arrays", () => {
    expect(parseUsersResponse([user])).toEqual([user]);
  });

  it("parses paged user responses", () => {
    const page = parseUsersPageResponse({
      items: [user],
      metaData: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 5,
        pageNumber: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    });

    expect(page.items).toEqual([user]);
    expect(page.metaData.totalCount).toBe(1);
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

  it("rejects roles without the required system-role marker", () => {
    const { isSystem: _isSystem, ...legacyRole } = role;
    expect(() => parseRolesResponse([legacyRole])).toThrow(
      "Invalid role.isSystem response",
    );
  });

  it("rejects malformed user payloads", () => {
    expect(() => parseUsersResponse([{ ...user, roles: "Admin" }])).toThrow(
      "Invalid user.roles response",
    );
  });
});
