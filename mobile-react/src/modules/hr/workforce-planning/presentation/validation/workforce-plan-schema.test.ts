import type { TFunction } from 'i18next';
import { createWorkforcePlanSchema } from './workforce-plan-schema';

const t = ((key: string) => key) as TFunction;

describe('workforce plan form policy', () => {
  it('validates unique fiscal periods and each vacancy type total', () => {
    const schema = createWorkforcePlanSchema(t);
    const valid = { planCode: 'WP-2027', fiscalYearId: 1, titleEn: 'Plan', titleAr: 'خطة', description: '', lines: [{ positionId: 1, targetBranchId: null, newHireSlots: 2, replacementSlots: 1, justification: '', periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 2, replacementSlots: 1 }] }] };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 0 }, { fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 0 }] }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 2 }] }] }).success).toBe(false);
  });
});
