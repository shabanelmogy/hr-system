import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { getOrganizationalStructureSchema } from "./organizationalStructureSchema";

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
