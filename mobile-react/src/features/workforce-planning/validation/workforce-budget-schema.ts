import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createWorkforceBudgetSchema = (t: TFunction) => {
  const periodAllocation = z.object({
    fiscalPeriodId: z.number().int().positive(t('workforceBudget.validation.period')),
    targetHeadcount: z.number().int().nonnegative(t('workforceBudget.validation.nonNegative')),
    allocatedSalaryCost: z.number().nonnegative(t('workforceBudget.validation.nonNegative')),
    allocatedRecruitmentCost: z.number().nonnegative(t('workforceBudget.validation.nonNegative')),
  });
  const line = z.object({
    workforcePlanLineId: z.number().int().positive(),
    authorizedHeadcount: z.number().int().nonnegative(t('workforceBudget.validation.nonNegative')),
    allocatedSalaryBudget: z.number().nonnegative(t('workforceBudget.validation.nonNegative')),
    allocatedRecruitmentBudget: z.number().nonnegative(t('workforceBudget.validation.nonNegative')),
    periodAllocations: z.array(periodAllocation).min(1, t('workforceBudget.validation.period')),
  }).superRefine((value, context) => {
    const seen = new Set<number>();
    value.periodAllocations.forEach((allocation, index) => { if (seen.has(allocation.fiscalPeriodId)) context.addIssue({ code: 'custom', path: ['periodAllocations', index, 'fiscalPeriodId'], message: t('workforceBudget.validation.duplicatePeriod') }); seen.add(allocation.fiscalPeriodId); });
    const headcountTotal = value.periodAllocations.reduce((sum, allocation) => sum + allocation.targetHeadcount, 0);
    const salaryTotal = value.periodAllocations.reduce((sum, allocation) => sum + allocation.allocatedSalaryCost, 0);
    const recruitmentTotal = value.periodAllocations.reduce((sum, allocation) => sum + allocation.allocatedRecruitmentCost, 0);
    if (headcountTotal !== value.authorizedHeadcount) context.addIssue({ code: 'custom', path: ['periodAllocations'], message: t('workforceBudget.validation.headcountTotals') });
    if (Math.abs(salaryTotal - value.allocatedSalaryBudget) > 0.005) context.addIssue({ code: 'custom', path: ['periodAllocations'], message: t('workforceBudget.validation.salaryTotals') });
    if (Math.abs(recruitmentTotal - value.allocatedRecruitmentBudget) > 0.005) context.addIssue({ code: 'custom', path: ['periodAllocations'], message: t('workforceBudget.validation.recruitmentTotals') });
  });
  return z.object({
    budgetCode: z.string().trim().min(2, t('workforceBudget.validation.budgetCode')).max(50, t('workforceBudget.validation.budgetCode')),
    workforcePlanId: z.number().int().positive(t('workforceBudget.validation.plan')),
    currencyCode: z.string().trim().length(3, t('workforceBudget.validation.currency')),
    lines: z.array(line).min(1, t('workforceBudget.validation.lines')),
  });
};
