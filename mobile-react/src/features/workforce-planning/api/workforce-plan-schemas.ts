import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';

const status = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]);
const nullableString = z.string().nullable();
export const workforcePlanSchema = z.object({
  id: z.number().int().positive(), planSeriesId: z.string().uuid(), planCode: z.string(), fiscalYearId: z.number().int().positive(), revisionNumber: z.number().int().positive(),
  titleEn: z.string(), titleAr: z.string(), status, linesCount: z.number().int().nonnegative(), newHireSlots: z.number().int().nonnegative(), replacementSlots: z.number().int().nonnegative(), plannedHiringSlots: z.number().int().nonnegative(), isEffective: z.boolean(), isDeleted: z.boolean(),
  createdOn: z.string(), updatedOn: nullableString, rowVersion: z.string().min(1),
});
const periodTarget = z.object({ id: z.number().int().nonnegative(), fiscalPeriodId: z.number().int().positive(), newHireSlots: z.number().int().nonnegative(), replacementSlots: z.number().int().nonnegative() });
const line = z.object({
  id: z.number().int().nonnegative(), positionId: z.number().int().positive(), targetBranchId: z.number().int().positive().nullable(), departmentId: z.number().int().positive(), divisionId: z.number().int().positive(),
  baselineHeadcount: z.number().int().nonnegative(), baselineAsOfDate: z.string(), newHireSlots: z.number().int().nonnegative(), replacementSlots: z.number().int().nonnegative(), targetHeadcount: z.number().int().nonnegative(), plannedHiringSlots: z.number().int().nonnegative(), justification: nullableString, periodTargets: z.array(periodTarget),
});
export const workforcePlanDetailSchema = z.object({
  id: z.number().int().positive(), planSeriesId: z.string().uuid(), planCode: z.string(), fiscalYearId: z.number().int().positive(), revisionNumber: z.number().int().positive(), previousRevisionId: z.number().int().positive().nullable(),
  titleEn: z.string(), titleAr: z.string(), description: nullableString, status, submittedOn: nullableString, submittedById: nullableString, approvedOn: nullableString, approvedById: nullableString,
  rejectedOn: nullableString, rejectedById: nullableString, decisionReason: nullableString, activatedOn: nullableString, supersededOn: nullableString, lines: z.array(line), createdOn: z.string(), updatedOn: nullableString, isDeleted: z.boolean(), rowVersion: z.string().min(1),
});
export const workforcePlanPageSchema = z.object({ items: z.array(workforcePlanSchema), metaData: pageMetadataSchema });
export const workforcePlanRevisionsSchema = z.array(workforcePlanDetailSchema);
