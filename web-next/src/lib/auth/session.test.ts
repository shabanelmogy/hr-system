import { describe, expect, it } from "vitest";
import { isSessionClaims } from "./session";

const validSession = {
  userId: "user-id",
  tenantId: "tenant-id",
  tenantName: "Test Tenant",
  tenantPlanName: "Professional",
  companyId: 7,
  companyCode: "COMP-7",
  companyNameAr: "الشركة السابعة",
  companyNameEn: "Company Seven",
  companies: [{ id: 7, companyCode: "COMP-7", nameAr: "الشركة السابعة", nameEn: "Company Seven" }],
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: ["admin"],
  permissions: ["Users:View"],
  tenantSubscriptionStatus: "active",
  tenantSubscriptionEndsOn: null,
  tenantReadOnly: false,
  expiresAt: Date.now() + 60_000,
};

describe("isSessionClaims", () => {
  it("accepts a complete verified session response", () => {
    expect(isSessionClaims(validSession)).toBe(true);
  });

  it("rejects malformed role and permission claims", () => {
    expect(isSessionClaims({ ...validSession, roles: "admin" })).toBe(false);
    expect(isSessionClaims({ ...validSession, permissions: [123] })).toBe(false);
  });

  it("requires the current company in a unique available-company list", () => {
    expect(isSessionClaims({ ...validSession, companies: [] })).toBe(false);
    expect(isSessionClaims({
      ...validSession,
      companies: [{ id: 8, companyCode: "COMP-8", nameAr: "", nameEn: "Company Eight" }],
    })).toBe(false);
    expect(isSessionClaims({
      ...validSession,
      companies: [validSession.companies[0], validSession.companies[0]],
    })).toBe(false);
  });

  it("rejects expired sessions", () => {
    expect(isSessionClaims({ ...validSession, expiresAt: Date.now() - 1 })).toBe(false);
  });
});
