import { z } from "zod";
import type { TFunction } from "i18next";
import {
  formBoolean,
  optionalFormEmail,
  optionalFormId,
  optionalFormNonNegativeNumber,
} from "@/shared/validation/zodFormPrimitives";
import type { OrganizationalResource } from "../types/OrganizationalStructure";

const optionalId = optionalFormId();
const optionalNumber = optionalFormNonNegativeNumber();

const optionalString = (maxLen?: number) => {
  const base = maxLen ? z.string().max(maxLen) : z.string();
  return base.nullish().transform((v) => (v && v.trim() ? v.trim() : undefined));
};

const optionalBoolean = formBoolean();

export const getOrganizationalStructureSchema = (resource: OrganizationalResource, t: TFunction) => z.object({
  code: z.string().trim().min(1, t("validation.required")).max(50).regex(/^[A-Za-z0-9._-]+$/, t("organizationalStructure.validation.code")),
  nameEn: z.string().trim().min(1, t("validation.required")).max(200),
  nameAr: z.string().trim().min(1, t("validation.required")).max(200),
  descriptionEn: optionalString(2000),
  descriptionAr: optionalString(2000),
  branchId: optionalId,
  parentDepartmentId: optionalId,
  departmentId: optionalId,
  divisionId: optionalId,
  jobTitleId: optionalId,
  jobLevelId: optionalId,
  positionId: optionalId,
  managerId: optionalId,
  costCenterCode: optionalString(50),
  timeZoneId: optionalString(128),
  openedOn: z.string().nullish().transform((v) => (v && v.trim() ? v.trim() : undefined)),
  email: optionalFormEmail(t("validation.invalidEmail")),
  phone: optionalString(50),
  isHeadquarters: optionalBoolean,
  isCentralized: optionalBoolean,
  levelOrder: optionalNumber,
  minSalary: optionalNumber,
  maxSalary: optionalNumber,
  currencyCode: optionalString(3),
  canManageOthers: optionalBoolean,
  isManagementLevel: optionalBoolean,
  targetHeadcount: optionalNumber,
  version: optionalString(30),
  purposeEn: optionalString(4000),
  purposeAr: optionalString(4000),
  responsibilitiesEn: optionalString(8000),
  responsibilitiesAr: optionalString(8000),
  requirementsEn: optionalString(8000),
  requirementsAr: optionalString(8000),
  preferredQualificationsEn: optionalString(4000),
  preferredQualificationsAr: optionalString(4000),
  requiredSkills: optionalString(4000),
  minExperienceYears: optionalNumber,
  revisionNotes: optionalString(2000),
  dutySections: z.array(z.object({
    sectionTitleEn: z.string().default(""),
    sectionTitleAr: z.string().default(""),
    weightPercentage: optionalNumber,
    items: z.array(z.object({
      textEn: z.string().default(""),
      textAr: z.string().default(""),
      order: z.number().default(0),
    })).default([]),
  })).nullish().transform((v) => v ?? []),
  skills: z.array(z.object({
    skillName: z.string().default(""),
    proficiencyLevel: z.string().default("Intermediate"),
    isMandatory: z.boolean().default(false),
  })).nullish().transform((v) => v ?? []),
  educationRequirements: z.array(z.object({
    degreeLevel: z.string().default(""),
    fieldOfStudy: z.string().default(""),
    isRequired: z.boolean().default(true),
  })).nullish().transform((v) => v ?? []),
  parentCostCenterId: optionalId,
  symbol: optionalString(10),
  exchangeRateToDefault: optionalNumber,
  isDefault: optionalBoolean,
}).superRefine((value, context) => {
  const requireId = (field: "branchId" | "departmentId" | "divisionId" | "jobTitleId" | "jobLevelId" | "positionId") => {
    if (!value[field]) context.addIssue({ code: "custom", path: [field], message: t("validation.required") });
  };
  if (resource === "departments" && !value.isCentralized) requireId("branchId");
  if (resource === "divisions") requireId("departmentId");
  if (resource === "positions") {
    requireId("divisionId"); requireId("jobTitleId"); requireId("jobLevelId");
  }
  if (resource === "job-descriptions") {
    requireId("positionId");
    const ver = (value.version || value.code)?.trim();
    if (!ver) context.addIssue({ code: "custom", path: ["code"], message: t("validation.required") });
  }
  if (resource === "job-levels" && value.minSalary != null && value.maxSalary != null && value.minSalary > value.maxSalary) {
    context.addIssue({ code: "custom", path: ["maxSalary"], message: t("organizationalStructure.validation.salaryRange") });
  }
});

export const getJobDescriptionDecisionSchema = (
  mode: "approve" | "reject",
  t: TFunction,
) => z.object({
  effectiveDate: z.string().trim(),
  expiryDate: z.string().trim(),
  reason: z.string().trim().max(1000),
}).superRefine((value, context) => {
  if (mode === "approve") {
    if (!value.effectiveDate) {
      context.addIssue({ code: "custom", path: ["effectiveDate"], message: t("validation.required") });
    }
    if (value.expiryDate && value.expiryDate < value.effectiveDate) {
      context.addIssue({ code: "custom", path: ["expiryDate"], message: t("validation.endDateBeforeStart") });
    }
    return;
  }

  if (!value.reason) {
    context.addIssue({ code: "custom", path: ["reason"], message: t("validation.required") });
  }
});

export type JobDescriptionDecisionValues = z.infer<ReturnType<typeof getJobDescriptionDecisionSchema>>;
