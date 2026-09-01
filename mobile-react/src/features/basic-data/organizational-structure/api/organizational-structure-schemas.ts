import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import { organizationalResources, type OrganizationalStructureItem, type OrganizationalStructureLookup } from '../types/organizational-structure';

const nullableString = z.string().nullish().transform((value) => value ?? undefined);
const nullableNumber = z.number().nullish().transform((value) => value ?? undefined);
const resourceSchema = z.enum(organizationalResources);
export const organizationalStructureItemSchema: z.ZodType<OrganizationalStructureItem> = z.object({
  id: z.number().int().positive(), resource: resourceSchema, code: z.string().min(1), nameEn: z.string().min(1), nameAr: z.string().min(1),
  isDeleted: z.boolean(), createdOn: z.string().min(1), updatedOn: nullableString,
  descriptionEn: nullableString, descriptionAr: nullableString,
  branchId: nullableNumber, parentDepartmentId: nullableNumber, departmentId: nullableNumber, divisionId: nullableNumber,
  jobTitleId: nullableNumber, jobLevelId: nullableNumber, positionId: nullableNumber, managerId: nullableNumber,
  branchNameEn: nullableString, branchNameAr: nullableString, parentNameEn: nullableString, parentNameAr: nullableString,
  departmentNameEn: nullableString, departmentNameAr: nullableString, divisionNameEn: nullableString, divisionNameAr: nullableString,
  jobTitleNameEn: nullableString, jobTitleNameAr: nullableString, jobLevelNameEn: nullableString, jobLevelNameAr: nullableString,
  positionCode: nullableString, costCenterCode: nullableString, timeZoneId: nullableString, openedOn: nullableString, closedOn: nullableString,
  email: nullableString, phone: nullableString, isHeadquarters: z.boolean().optional().default(false), isOperationallyActive: z.boolean(),
  levelOrder: nullableNumber, minSalary: nullableNumber, maxSalary: nullableNumber, currencyCode: nullableString,
  canManageOthers: z.boolean().optional().default(false), isManagementLevel: z.boolean().optional().default(false), targetHeadcount: nullableNumber,
  version: nullableString, purposeEn: nullableString, purposeAr: nullableString, responsibilitiesEn: nullableString, responsibilitiesAr: nullableString,
  requirementsEn: nullableString, requirementsAr: nullableString, preferredQualificationsEn: nullableString, preferredQualificationsAr: nullableString,
  requiredSkills: nullableString, requiredEducation: nullableString, minExperienceYears: nullableNumber, revisionNotes: nullableString,
  jobDescriptionStatus: z.union([z.number(), z.string()]).nullish().transform((value) => value ?? undefined),
  effectiveDate: nullableString, expiryDate: nullableString, decisionReason: nullableString,
});
export const organizationalStructurePageSchema = z.object({ items: z.array(organizationalStructureItemSchema), metaData: pageMetadataSchema });
export const organizationalStructureLookupSchema: z.ZodType<OrganizationalStructureLookup[]> = z.array(z.object({
  id: z.number().int().positive(), code: z.string().min(1), nameEn: z.string().min(1), nameAr: z.string().min(1),
}));
export const organizationalStructureBulkResponseSchema = z.object({ createdCount: z.number().int().nonnegative() });
