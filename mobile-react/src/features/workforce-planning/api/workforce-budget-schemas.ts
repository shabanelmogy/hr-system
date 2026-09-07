import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';

const status = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]);
const nullableString = z.string().nullable();
export const workforceBudgetSchema = z.object({
  id: z.number().int().positive(), budgetCode: z.string(), workforcePlanId: z.number().int().positive(), fiscalYearId: z.number().int().positive(),
  revisionNumber: z.number().int().positive(), currencyCode: z.string(), status,
  totalAuthorizedHeadcount: z.number().int().nonnegative(), totalSalaryBudget: z.number().nonnegative(), totalRecruitmentBudget: z.number().nonnegative(),
  grandTotalBudget: z.number().nonnegative(), isEffective: z.boolean(), activatedOn: nullableString,
  createdOn: z.string(), updatedOn: nullableString, rowVersion: z.string().min(1),
});
const periodAllocation = z.object({
  id: z.number().int().nonnegative(), fiscalPeriodId: z.number().int().positive(), targetHeadcount: z.number().int().nonnegative(),
  allocatedSalaryCost: z.number().nonnegative(), allocatedRecruitmentCost: z.number().nonnegative(),
});
const budgetLine = z.object({
  id: z.number().int().nonnegative(), workforcePlanLineId: z.number().int().positive(), positionId: z.number().int().positive(),
  branchId: z.number().int().positive().nullable(), departmentId: z.number().int().positive(), divisionId: z.number().int().positive(),
  authorizedHeadcount: z.number().int().nonnegative(), allocatedSalaryBudget: z.number().nonnegative(), allocatedRecruitmentBudget: z.number().nonnegative(),
  totalAllocatedBudget: z.number().nonnegative(), periodAllocations: z.array(periodAllocation),
});
export const workforceBudgetDetailSchema = z.object({
  id: z.number().int().positive(), budgetCode: z.string(), workforcePlanId: z.number().int().positive(), fiscalYearId: z.number().int().positive(),
  revisionNumber: z.number().int().positive(), currencyCode: z.string(), calculationPolicyVersion: z.string(), status,
  submittedOn: nullableString, submittedById: nullableString, approvedOn: nullableString, approvedById: nullableString,
  rejectedOn: nullableString, rejectedById: nullableString, decisionReason: nullableString, activatedOn: nullableString, supersededOn: nullableString,
  totalAuthorizedHeadcount: z.number().int().nonnegative(), totalSalaryBudget: z.number().nonnegative(), totalRecruitmentBudget: z.number().nonnegative(),
  grandTotalBudget: z.number().nonnegative(), isEffective: z.boolean(), lines: z.array(budgetLine),
  createdOn: z.string(), updatedOn: nullableString, rowVersion: z.string().min(1),
});
export const workforceBudgetPageSchema = z.object({ items: z.array(workforceBudgetSchema), metaData: pageMetadataSchema });
const sourcePlanPeriod = z.object({ fiscalPeriodId: z.number().int().positive(), newHireSlots: z.number().int().nonnegative(), replacementSlots: z.number().int().nonnegative() });
const sourcePlanLine = z.object({
  id: z.number().int().positive(), positionId: z.number().int().positive(), targetBranchId: z.number().int().positive().nullable(),
  departmentId: z.number().int().positive(), divisionId: z.number().int().positive(), baselineHeadcount: z.number().int().nonnegative(),
  newHireSlots: z.number().int().nonnegative(), replacementSlots: z.number().int().nonnegative(), plannedHiringSlots: z.number().int().nonnegative(),
  justification: nullableString, periodTargets: z.array(sourcePlanPeriod),
});
export const budgetSourcePlanSchema = z.object({
  id: z.number().int().positive(), planCode: z.string(), fiscalYearId: z.number().int().positive(), revisionNumber: z.number().int().positive(),
  titleEn: z.string(), titleAr: z.string(), fiscalPeriodIds: z.array(z.number().int().positive()), lines: z.array(sourcePlanLine),
});
export const budgetSourcePlanPageSchema = z.object({ items: z.array(budgetSourcePlanSchema), metaData: pageMetadataSchema });
export const positionEnvelopeSchema = z.object({
  id: z.number().int().positive(), envelopeCode: z.string(), workforceBudgetId: z.number().int().positive(), fiscalYearId: z.number().int().positive(),
  positionId: z.number().int().positive(), branchId: z.number().int().positive().nullable(), departmentId: z.number().int().positive(), divisionId: z.number().int().positive(),
  currencyCode: z.string(), authorizedHeadcount: z.number().int().nonnegative(), reservedHeadcount: z.number().int().nonnegative(), hiredHeadcount: z.number().int().nonnegative(),
  availableHeadcount: z.number().int().nonnegative(), authorizedSalaryBudget: z.number().nonnegative(), reservedSalaryBudget: z.number().nonnegative(),
  contractedSalaryBudget: z.number().nonnegative(), availableSalaryBudget: z.number().nonnegative(),
  createdOn: z.string(), rowVersion: z.string().min(1),
});
export const positionEnvelopeDetailSchema = positionEnvelopeSchema.extend({
  workforceBudgetLineId: z.number().int().positive(), workforcePlanId: z.number().int().positive(), workforcePlanLineId: z.number().int().positive(),
  calculationPolicyVersion: z.string(), updatedOn: nullableString,
});
export const positionEnvelopePageSchema = z.object({ items: z.array(positionEnvelopeSchema), metaData: pageMetadataSchema });
