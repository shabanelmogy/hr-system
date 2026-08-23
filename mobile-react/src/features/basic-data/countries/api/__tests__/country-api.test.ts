import { describe, expect, it } from '@jest/globals';

import { publishedCrystalReportsSchema } from '@/src/features/reporting';

import { countryEndpoints } from '../country-endpoints';
import { toCountryPageQuery } from '../country-api';
import {
  bulkArchiveResultSchema,
  countryPageSchema,
  countryWithStatesSchema,
} from '../country-schemas';
import {
  buildCountryRenderFilters,
  getCountryReportDisplayName,
} from '../country-report-api';

describe('country API boundary', () => {
  it('maps server list filters to the documented countries query contract', () => {
    expect(toCountryPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' Egypt ',
      searchField: 'nameEn',
      searchOperator: 'startsWith',
      status: 'archived',
      currencyCode: ' egp ',
      hasStates: 'withStates',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&status=archived&searchField=nameEn&searchOperator=startsWith&sortBy=createdOn&sortDirection=desc&search=Egypt&currencyCode=EGP&hasStates=true');
  });

  it('rejects a page item that does not satisfy the country contract', () => {
    expect(() => countryPageSchema.parse({
      items: [{ id: 1, nameAr: 'مصر', nameEn: 'Egypt' }],
      metaData: { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false },
    })).toThrow();
  });

  it('keeps the bulk archive route and response contract explicit', () => {
    expect(countryEndpoints.bulkArchive).toBe('countries/bulk-archive');
    expect(bulkArchiveResultSchema.parse({ archivedCount: 2 })).toEqual({ archivedCount: 2 });
  });

  it('requires the complete state lookup contract', () => {
    const country = {
      id: 1,
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: 'EG',
      alpha3Code: 'EGY',
      phoneCode: '+20',
      currencyCode: 'EGP',
      createdOn: '2026-08-20T10:00:00Z',
      updatedOn: null,
      isDeleted: false,
      states: [{ id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', isDeleted: false }],
    };

    expect(countryWithStatesSchema.parse(country)).toEqual(country);
    expect(() => countryWithStatesSchema.parse({
      ...country,
      states: [{ id: 1, nameAr: 'القاهرة', nameEn: 'Cairo' }],
    })).toThrow();
  });

  it('validates the published Crystal Reports catalog contract used by the report view', () => {
    const report = {
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
    expect(publishedCrystalReportsSchema.parse([report])).toEqual([report]);
    expect(() => publishedCrystalReportsSchema.parse([{ ...report, id: 'not-a-guid' }])).toThrow();
    expect(() => publishedCrystalReportsSchema.parse([{ ...report, displayName: '' }])).toThrow();
  });

  it('maps country name filters to the manager render contract', () => {
    expect(buildCountryRenderFilters(' مصر ', ' Egypt ')).toEqual({ NameAr: 'مصر', NameEn: 'Egypt' });
    expect(buildCountryRenderFilters('   ', '')).toEqual({});
  });

  it('uses the manager summaries for localized report names with a stable fallback', () => {
    const report = {
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

    expect(getCountryReportDisplayName(report, 'ar')).toBe('دليل الدول');
    expect(getCountryReportDisplayName(report, 'en')).toBe('Countries directory report');
    expect(getCountryReportDisplayName({ ...report, summaryTitle: null }, 'ar'))
      .toBe('Countries directory');
  });
});
