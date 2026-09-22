import { describe, expect, it } from '@jest/globals';
import { currencyEndpoints } from '../currency-endpoints';
import { currencyLookupSchema, currencyPageSchema, currencySchema } from '../currency-schemas';
import { toCurrencyPageQuery } from '../currency-remote-data-source';

const currency = {
  id: 7,
  currencyCode: 'EGP',
  nameEn: 'Egyptian Pound',
  nameAr: 'جنيه مصري',
  symbol: 'EGP',
  createdOn: '2026-09-21T10:00:00Z',
  updatedOn: null,
  isDeleted: false,
  rowVersion: 'AQ==',
};

describe('Currencies API boundary', () => {
  it('maps the Accounting paging, search, filter, and sort contract', () => {
    expect(toCurrencyPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' EGP ',
      searchField: 'currencyCode',
      searchOperator: 'equals',
      recordStatus: 'archived',
      sortBy: 'currencyCode',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&searchField=currencyCode&searchOperator=equals&recordStatus=archived&sortBy=currencyCode&sortDirection=desc&search=EGP');
  });

  it('keeps lookup and restore endpoints on the Accounting currencies resource', () => {
    expect(currencyEndpoints.base).toBe('currencies');
    expect(currencyEndpoints.lookup).toBe('currencies/lookup');
    expect(currencyEndpoints.restore(7)).toBe('currencies/7/restore');
  });

  it('requires the current Accounting currency response and RowVersion', () => {
    const metaData = { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false };
    expect(currencyPageSchema.parse({ items: [currency], metaData }).items[0]?.currencyCode).toBe('EGP');
    expect(currencyLookupSchema.parse([currency])[0]?.symbol).toBe('EGP');
    expect(() => currencySchema.parse({ ...currency, rowVersion: '' })).toThrow();
  });
});
