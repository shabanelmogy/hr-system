import type { TFunction } from 'i18next';
import { createWorkforceBudgetSchema } from './workforce-budget-schema';

const t = ((key: string) => key) as TFunction;

describe('workforce budget form policy', () => {
  it('validates unique budget periods and each independent category total', () => {
    const schema = createWorkforceBudgetSchema(t);
    const valid = { budgetCode: 'WB-2027-001', workforcePlanId: 9, currencyCode: 'EGP', lines: [{ workforcePlanLineId: 11, authorizedHeadcount: 2, allocatedSalaryBudget: 120000, allocatedRecruitmentBudget: 8000, periodAllocations: [{ fiscalPeriodId: 100, targetHeadcount: 2, allocatedSalaryCost: 120000, allocatedRecruitmentCost: 8000 }] }] };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodAllocations: [{ fiscalPeriodId: 100, targetHeadcount: 1, allocatedSalaryCost: 60000, allocatedRecruitmentCost: 4000 }, { fiscalPeriodId: 100, targetHeadcount: 1, allocatedSalaryCost: 60000, allocatedRecruitmentCost: 4000 }] }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], authorizedHeadcount: 3 }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], allocatedSalaryBudget: 100000 }] }).success).toBe(false);
  });
});
