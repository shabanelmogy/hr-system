import type { TFunction } from 'i18next';
import { createFiscalYearSchema } from './fiscal-year-schema';

const t = ((key: string) => key) as TFunction;

describe('fiscal year form validation', () => {
  it('mirrors the exact twelve-month rule', () => {
    const schema = createFiscalYearSchema(t);
    const values = { code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027', startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const };
    expect(schema.safeParse(values).success).toBe(true);
    const invalid = schema.safeParse({ ...values, endDate: '2027-12-30' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues[0]?.path).toEqual(['endDate']);
  });
});
