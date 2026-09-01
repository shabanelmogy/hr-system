import { z } from "zod";
import type { TFunction } from "i18next";
import type { OrganizationalResource } from "../types/OrganizationalStructure";

const optionalId = z.coerce.number().int().positive().optional().or(z.literal(0).transform(() => undefined));
const optionalNumber = z.coerce.number().nonnegative().optional().or(z.literal("").transform(() => undefined));

export const getOrganizationalStructureSchema = (resource: OrganizationalResource, t: TFunction) => z.object({
  code: z.string().trim().min(1, t("validation.required")).max(50).regex(/^[A-Za-z0-9._-]+$/, t("organizationalStructure.validation.code")),
  nameEn: z.string().trim().min(1, t("validation.required")).max(200),
  nameAr: z.string().trim().min(1, t("validation.required")).max(200),
  descriptionEn: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  branchId: optionalId,
  parentDepartmentId: optionalId,
  departmentId: optionalId,
  divisionId: optionalId,
  jobTitleId: optionalId,
  jobLevelId: optionalId,
  positionId: optionalId,
  managerId: optionalId,
  costCenterCode: z.string().max(50).optional(),
  timeZoneId: z.string().max(128).optional(),
  openedOn: z.string().optional(),
  email: z.string().email(t("validation.invalidEmail")).or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  isHeadquarters: z.boolean().optional(),
  levelOrder: optionalNumber,
  minSalary: optionalNumber,
  maxSalary: optionalNumber,
  currencyCode: z.string().max(3).optional(),
  canManageOthers: z.boolean().optional(),
  isManagementLevel: z.boolean().optional(),
  targetHeadcount: optionalNumber,
  version: z.string().max(30).optional(),
  purposeEn: z.string().max(4000).optional(),
  purposeAr: z.string().max(4000).optional(),
  responsibilitiesEn: z.string().max(8000).optional(),
  responsibilitiesAr: z.string().max(8000).optional(),
  requirementsEn: z.string().max(8000).optional(),
  requirementsAr: z.string().max(8000).optional(),
  preferredQualificationsEn: z.string().max(4000).optional(),
  preferredQualificationsAr: z.string().max(4000).optional(),
  requiredSkills: z.string().max(4000).optional(),
  requiredEducation: z.string().max(2000).optional(),
  minExperienceYears: optionalNumber,
  revisionNotes: z.string().max(2000).optional(),
}).superRefine((value, context) => {
  const requireId = (field: "branchId" | "departmentId" | "divisionId" | "jobTitleId" | "jobLevelId" | "positionId") => {
    if (!value[field]) context.addIssue({ code: "custom", path: [field], message: t("validation.required") });
  };
  if (resource === "departments") requireId("branchId");
  if (resource === "divisions") requireId("departmentId");
  if (resource === "positions") {
    requireId("divisionId"); requireId("jobTitleId"); requireId("jobLevelId");
  }
  if (resource === "job-descriptions") {
    requireId("positionId");
    if (!value.version?.trim()) context.addIssue({ code: "custom", path: ["version"], message: t("validation.required") });
  }
  if (resource === "job-levels" && value.minSalary != null && value.maxSalary != null && value.minSalary > value.maxSalary) {
    context.addIssue({ code: "custom", path: ["maxSalary"], message: t("organizationalStructure.validation.salaryRange") });
  }
});

export const getJobDescriptionApprovalSchema = (t: TFunction) => z.object({
  effectiveDate: z.string().trim().min(1, t("validation.required")),
  expiryDate: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.expiryDate && value.expiryDate < value.effectiveDate) {
    context.addIssue({ code: "custom", path: ["expiryDate"], message: t("validation.endDateBeforeStart") });
  }
});

export const getJobDescriptionRejectionSchema = (t: TFunction) => z.object({
  reason: z.string().trim().min(1, t("validation.required")).max(1000),
});
