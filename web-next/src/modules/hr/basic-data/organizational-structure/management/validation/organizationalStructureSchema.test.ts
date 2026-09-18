import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
  getJobDescriptionDecisionSchema,
  getOrganizationalStructureSchema,
} from "./organizationalStructureSchema";

const t = ((key: string) => key) as TFunction;

describe("getOrganizationalStructureSchema", () => {
  it("accepts the generated branch sample without unrelated resource errors", () => {
    const result = getOrganizationalStructureSchema("branches", t).safeParse({
      code: "BR-CAI-001",
      nameAr: "المقر الرئيسي بالقاهرة",
      nameEn: "Cairo Headquarters",
      descriptionAr: "",
      descriptionEn: "",
      timeZoneId: "Africa/Cairo",
      openedOn: "2026-01-01",
      email: "cairo@example.com",
      phone: "+20 2 0000 0000",
      isHeadquarters: true,
      isCentralized: false,
      canManageOthers: false,
      isManagementLevel: false,
      targetHeadcount: 0,
      levelOrder: 0,
      dutySections: [],
      skills: [],
      educationRequirements: [],
    });

    expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues)).toBe(true);
  });

  it("reports only the three visible required branch fields for an empty form", () => {
    const result = getOrganizationalStructureSchema("branches", t).safeParse({
      code: "",
      nameAr: "",
      nameEn: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect([...new Set(result.error.issues.map((issue) => issue.path.join(".")))]).toEqual([
      "code",
      "nameEn",
      "nameAr",
    ]);
  });
});

describe("getJobDescriptionDecisionSchema", () => {
  it("requires an effective date only for approval", () => {
    const result = getJobDescriptionDecisionSchema("approve", t).safeParse({
      effectiveDate: "",
      expiryDate: "",
      reason: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["effectiveDate"]);
  });

  it("rejects an approval expiry before its effective date", () => {
    const result = getJobDescriptionDecisionSchema("approve", t).safeParse({
      effectiveDate: "2026-09-18",
      expiryDate: "2026-09-17",
      reason: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["expiryDate"]);
  });

  it("requires a reason only for rejection", () => {
    const result = getJobDescriptionDecisionSchema("reject", t).safeParse({
      effectiveDate: "",
      expiryDate: "",
      reason: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["reason"]);
  });

  it("accepts the matching decision payload without requiring hidden fields", () => {
    expect(getJobDescriptionDecisionSchema("approve", t).safeParse({
      effectiveDate: "2026-09-18",
      expiryDate: "",
      reason: "",
    }).success).toBe(true);
    expect(getJobDescriptionDecisionSchema("reject", t).safeParse({
      effectiveDate: "",
      expiryDate: "",
      reason: "Needs revision",
    }).success).toBe(true);
  });
});
