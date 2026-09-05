import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { fiscalYearEndpoints } from '../fiscal-year-endpoints';
import { fiscalYearDetailSchema, fiscalYearPageSchema } from '../fiscal-year-schemas';
import { toFiscalYearPageQuery } from '../fiscal-year-api';
import { createFiscalYearSchema } from '../../validation/fiscal-year-schema';
import { buildFiscalPeriodPreview } from '../../utils/fiscal-period-preview';

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

const t = ((key: string) => key) as TFunction;

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

  it('mirrors the exact twelve-month rule in mobile validation', () => {
    const schema = createFiscalYearSchema(t);
    const values = { code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027', startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const };
    expect(schema.safeParse(values).success).toBe(true);
    const invalid = schema.safeParse({ ...values, endDate: '2027-12-30' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues[0]?.path).toEqual(['endDate']);
  });

  it('previews contiguous periods for an end-of-month fiscal start', () => {
    const periods = buildFiscalPeriodPreview('fy-odd', '2027-01-31', 2);
    expect(periods).toHaveLength(4);
    expect(periods[0]).toMatchObject({ code: 'FY-ODD-P01', startDate: '2027-01-31', endDate: '2027-04-29' });
    expect(periods.at(-1)?.endDate).toBe('2028-01-30');
    periods.slice(1).forEach((period, index) => {
      const expected = new Date(`${periods[index]!.endDate}T00:00:00Z`);
      expected.setUTCDate(expected.getUTCDate() + 1);
      expect(period.startDate).toBe(expected.toISOString().slice(0, 10));
    });
  });
});
