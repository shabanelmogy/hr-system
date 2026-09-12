import { describe, expect, it } from '@jest/globals';

import type { CrystalReportListItem } from '@/src/platform/reporting';

import {
  buildCountryRenderFilters,
  getCountryReportDisplayName,
} from './country-report-api';

const report: CrystalReportListItem = {
  id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  entityKey: 'countries',
  reportKey: 'countries-directory',
  displayName: 'Countries directory',
  summaryTitle: 'دليل الدول',
  summarySubject: 'Countries directory report',
  description: null,
  currentVersionNumber: 2,
  isPublished: true,
  isArchived: false,
  rowVersion: '0x1',
  updatedOn: '2026-08-23T10:00:00Z',
};

describe('country report presentation boundary', () => {
  it('maps country name filters to the manager render contract', () => {
    expect(buildCountryRenderFilters(' مصر ', ' Egypt ')).toEqual({ NameAr: 'مصر', NameEn: 'Egypt' });
    expect(buildCountryRenderFilters('   ', '')).toEqual({});
  });

  it('uses the manager summaries for localized report names with a stable fallback', () => {
    expect(getCountryReportDisplayName(report, 'ar')).toBe('دليل الدول');
    expect(getCountryReportDisplayName(report, 'en')).toBe('Countries directory report');
    expect(getCountryReportDisplayName({ ...report, summaryTitle: null }, 'ar'))
      .toBe('Countries directory');
  });
});
