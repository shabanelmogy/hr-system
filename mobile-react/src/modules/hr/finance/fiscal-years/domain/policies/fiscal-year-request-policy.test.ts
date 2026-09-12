import { normalizeFiscalYearRequest } from './fiscal-year-request-policy';

describe('fiscal year request policy', () => {
  it('normalizes authoritative write input without changing dates or frequency', () => {
    expect(normalizeFiscalYearRequest({
      code: ' fy-2027 ',
      nameAr: ' السنة المالية 2027 ',
      nameEn: ' Fiscal Year 2027 ',
      startDate: '2027-01-01',
      endDate: '2027-12-31',
      periodFrequency: 1,
    })).toEqual({
      code: 'FY-2027',
      nameAr: 'السنة المالية 2027',
      nameEn: 'Fiscal Year 2027',
      startDate: '2027-01-01',
      endDate: '2027-12-31',
      periodFrequency: 1,
    });
  });
});
