import { describe, expect, it } from '@jest/globals';

import { countryEndpoints } from '../country-endpoints';
import { toCountryPageQuery } from '../country-remote-data-source';
import {
  bulkArchiveResultSchema,
  bulkCreateResultSchema,
  countryPageSchema,
  countryWithStatesSchema,
} from '../country-schemas';

describe('country API boundary', () => {
  it('maps server list filters to the documented countries query contract', () => {
    expect(toCountryPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' Egypt ',
      searchField: 'nameEn',
      searchOperator: 'startsWith',
      status: 'archived',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&status=archived&searchField=nameEn&searchOperator=startsWith&sortBy=createdOn&sortDirection=desc&search=Egypt');
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

  it('keeps the atomic bulk-create route and response contract explicit', () => {
    expect(countryEndpoints.bulkCreate).toBe('countries/bulk');
    expect(bulkCreateResultSchema.parse({ createdCount: 2 })).toEqual({ createdCount: 2 });
    expect(() => bulkCreateResultSchema.parse({ createdCount: -1 })).toThrow();
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

});
