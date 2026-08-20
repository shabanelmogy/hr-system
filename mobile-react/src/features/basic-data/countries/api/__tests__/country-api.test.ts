import { describe, expect, it } from '@jest/globals';

import { countryEndpoints } from '../country-endpoints';
import { toCountryPageQuery } from '../country-api';
import {
  bulkArchiveResultSchema,
  countryPageSchema,
  countryWithStatesSchema,
} from '../country-schemas';
import { countryReportInfoSchema } from '../country-report-schemas';

describe('country API boundary', () => {
  it('maps server list filters to the documented countries query contract', () => {
    expect(toCountryPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' Egypt ',
      status: 'archived',
      currencyCode: ' egp ',
      hasStates: 'withStates',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&status=archived&sortBy=createdOn&sortDirection=desc&search=Egypt&currencyCode=EGP&hasStates=true');
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

  it('validates the Crystal Reports catalog contract used by the report view', () => {
    const report = {
      Id: 'Countries',
      ReportPath: 'Reports/Countries',
      Title: 'الدول',
      Subject: 'Countries',
    };
    expect(countryReportInfoSchema.parse(report)).toEqual(report);
    expect(() => countryReportInfoSchema.parse({
      Id: 'Countries',
      ReportPath: 'Reports/Countries',
      Title: 'الدول',
    })).toThrow();
  });
});
