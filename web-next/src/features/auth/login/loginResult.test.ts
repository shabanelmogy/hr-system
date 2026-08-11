import { describe, expect, it } from "vitest";
import { parseLoginResult } from "./loginResult";

describe("parseLoginResult", () => {
  it("accepts an authenticated session for one company", () => {
    expect(parseLoginResult({ isAuthenticated: true, companyId: 12 })).toEqual({
      kind: "authenticated",
      response: { isAuthenticated: true, companyId: 12 },
    });
  });

  it("accepts a company-selection challenge for multiple companies", () => {
    const response = {
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: "temporary-token",
      companySelectionTokenExpiration: "2026-08-11T12:00:00Z",
      companies: [
        { id: 1, nameAr: "الشركة الأولى", nameEn: "First Company" },
        { id: 2, nameAr: "الشركة الثانية", nameEn: "Second Company" },
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
      companies: [{ id: 1, nameAr: "شركة", nameEn: "Company" }],
    })).toBeNull();
  });

  it("rejects duplicate company identifiers", () => {
    expect(parseLoginResult({
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: "temporary-token",
      companySelectionTokenExpiration: "2026-08-11T12:00:00Z",
      companies: [
        { id: 1, nameAr: "شركة", nameEn: "Company" },
        { id: 1, nameAr: "شركة أخرى", nameEn: "Other Company" },
      ],
    })).toBeNull();
  });
});
