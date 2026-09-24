import { describe, expect, it } from '@jest/globals';
import { createFiscalYearMockData } from './fiscal-year-mock-data';

describe('Fiscal Year mock data', () => {
  it('creates a deterministic valid local draft without persistence metadata', () => {
    const value = createFiscalYearMockData(2031);
    expect(value).toEqual({
      code: 'FY-2031',
      nameAr: 'السنة المالية 2031',
      nameEn: 'Fiscal Year 2031',
      startDate: '2031-01-01',
      endDate: '2031-12-31',
      periodFrequency: 1,
    });
    expect(value).not.toHaveProperty('tenantId');
    expect(value).not.toHaveProperty('companyId');
    expect(value).not.toHaveProperty('rowVersion');
  });
});
