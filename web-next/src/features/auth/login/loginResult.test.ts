import { describe, expect, it } from "vitest";
import { parseLoginResult } from "./loginResult";

describe("parseLoginResult", () => {
  it("accepts an authenticated session for one company", () => {
    expect(parseLoginResult({ isAuthenticated: true, companyId: 12 })).toEqual({
      kind: "authenticated",
      response: { isAuthenticated: true, companyId: 12 },
    });
  });
  it("accepts a tenant-selection challenge for multiple tenants", () => {
    const response = {
      isAuthenticated: false,
      requiresTenantSelection: true,
      tenantSelectionToken: "tenant-token",
      tenantSelectionTokenExpiration: "2026-08-14T12:00:00Z",
      tenants: [
        { id: "tenant-a", identifier: "A", name: "Tenant A" },
        { id: "tenant-b", identifier: "B", name: "Tenant B" },
      ],
    };

    expect(parseLoginResult(response)).toEqual({
      kind: "tenant-selection",
      response,
    });
  });


  it("accepts a company-selection challenge for multiple companies", () => {
    const response = {
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: "temporary-token",
      companySelectionTokenExpiration: "2026-08-11T12:00:00Z",
      companies: [
        { id: 1, companyCode: "COMP-1", nameAr: "الشركة الأولى", nameEn: "First Company" },
        { id: 2, companyCode: "COMP-2", nameAr: "الشركة الثانية", nameEn: "Second Company" },
      ],
    };

    expect(parseLoginResult(response)).toEqual({
      kind: "company-selection",
      response,
    });
  });

  it("rejects a selection challenge containing only one company", () => {
    expect(parseLoginResult({
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: "temporary-token",
      companySelectionTokenExpiration: "2026-08-11T12:00:00Z",
      companies: [{ id: 1, companyCode: "COMP-1", nameAr: "شركة", nameEn: "Company" }],
    })).toBeNull();
  });

  it("rejects duplicate company identifiers", () => {
    expect(parseLoginResult({
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: "temporary-token",
      companySelectionTokenExpiration: "2026-08-11T12:00:00Z",
      companies: [
        { id: 1, companyCode: "COMP-1", nameAr: "شركة", nameEn: "Company" },
        { id: 1, companyCode: "COMP-1B", nameAr: "شركة أخرى", nameEn: "Other Company" },
      ],
    })).toBeNull();
  });
});
