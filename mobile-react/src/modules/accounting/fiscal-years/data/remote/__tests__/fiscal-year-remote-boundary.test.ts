import { describe, expect, it } from '@jest/globals';

import { fiscalYearEndpoints } from '../fiscal-year-endpoints';
import { fiscalYearDetailSchema, fiscalYearPageSchema } from '../fiscal-year-schemas';
import { toFiscalYearPageQuery } from '../fiscal-year-remote-data-source';

const fiscalYear = {
  id: 7,
  code: 'FY-2027',
  nameAr: 'السنة المالية 2027',
  nameEn: 'Fiscal Year 2027',
  startDate: '2027-01-01',
  endDate: '2027-12-31',
  periodFrequency: 1,
  status: 1,
  periodsCount: 12,
  createdOn: '2026-09-05T18:00:00Z',
  updatedOn: null,
  isDeleted: false,
  rowVersion: 'AQ==',
};

describe('Fiscal Years API boundary', () => {
  it('maps the complete server paging, search, filter, and sort contract', () => {
    expect(toFiscalYearPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' FY-2027 ',
      searchField: 'code',
      searchOperator: 'startsWith',
      recordStatus: 'archived',
      lifecycleStatus: 'draft',
      sortBy: 'startDate',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&searchField=code&searchOperator=startsWith&recordStatus=archived&lifecycleStatus=draft&sortBy=startDate&sortDirection=desc&search=FY-2027');
  });

  it('keeps restore and lifecycle endpoints explicit', () => {
    expect(fiscalYearEndpoints.restore(7)).toBe('fiscal-years/7/restore');
    expect(fiscalYearEndpoints.beginClosing(7)).toBe('fiscal-years/7/begin-closing');
    expect(fiscalYearEndpoints.lock(7)).toBe('fiscal-years/7/lock');
    expect(fiscalYearEndpoints.reopen(7)).toBe('fiscal-years/7/reopen');
  });

  it('requires complete page and detail contracts including generated periods', () => {
    const metaData = { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false };
    expect(fiscalYearPageSchema.parse({ items: [fiscalYear], metaData }).items[0]?.periodsCount).toBe(12);
    expect(fiscalYearDetailSchema.parse({
      ...fiscalYear,
      periodsCount: undefined,
      periods: [{ id: 1, sequence: 1, code: 'FY-2027-P01', nameAr: 'الفترة 1', nameEn: 'Period 1', startDate: '2027-01-01', endDate: '2027-01-31', status: 1 }],
    }).periods).toHaveLength(1);
    expect(() => fiscalYearPageSchema.parse({ items: [{ ...fiscalYear, rowVersion: '' }], metaData })).toThrow();
  });

});
