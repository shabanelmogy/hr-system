import { countryFixture, countryPageFixture } from '../country.fixture';
import { countryDetailSchema, countryQuality, countryQueryParameters, countryReadAllowed, defaultCountryQuery, parseCountryPage } from './country';

describe('Countries read wire boundary', () => {
  it('requires the exact global permission alongside the actual role', () => {
    expect(countryReadAllowed(null)).toBe(false);
    expect(countryReadAllowed({ roles: ['super_admin'], permissions: [] })).toBe(false);
    expect(countryReadAllowed({ roles: ['user'], permissions: ['Countries:View'] })).toBe(false);
    expect(countryReadAllowed({ roles: ['SUPER_ADMIN'], permissions: ['Countries:View'] })).toBe(true);
    expect(countryReadAllowed({ roles: ['super_admin'], permissions: ['*'] })).toBe(false);
  });
  it('preserves false filters, omits only absent values, and sends current explicit defaults', () => {
    const { params } = countryQueryParameters({ ...defaultCountryQuery, hasStates: false, currencyCode: 'egp' });
    expect(params).toEqual({ pageNumber: '1', pageSize: '10', status: 'active', searchField: 'all', searchOperator: 'contains', sortBy: 'createdOn', sortDirection: 'desc', hasStates: 'false', currencyCode: 'EGP' });
    expect(countryQueryParameters({ ...defaultCountryQuery, search: 'ع'.repeat(200) }).params['search']).toHaveLength(200);
    for (const change of [{ search: 'ع'.repeat(201) }, { pageNumber: 0 }, { pageSize: 5001 }, { status: 'deleted' }, { sortBy: 'statesCount' }, { searchField: 'password' }, { searchOperator: 'sql' }, { hidden: true }]) {
      expect(() => countryQueryParameters({ ...defaultCountryQuery, ...change })).toThrow();
    }
  });
  it('separates detail from list and preserves optional null/empty and audit values', () => {
    const page = parseCountryPage(countryPageFixture(), defaultCountryQuery);
    expect(page.items[0].statesCount).toBe(4);
    const detail = countryDetailSchema.parse({ ...countryFixture, alpha2Code: null, alpha3Code: '' });
    expect(detail).not.toHaveProperty('statesCount'); expect(detail.alpha2Code).toBeNull(); expect(detail.alpha3Code).toBe('');
    expect(detail.updatedOn).toBeNull(); expect(countryQuality(detail)).toBe(90);
  });
  it('accepts actual empty/out-of-range metadata without inventing another page', () => {
    const request = { ...defaultCountryQuery, pageNumber: 4 };
    const page = countryPageFixture(request, [], 12);
    expect(parseCountryPage(page, request).metaData.currentPage).toBe(4);
    expect(parseCountryPage(countryPageFixture(defaultCountryQuery, [], 0), defaultCountryQuery).metaData.totalPages).toBe(0);
  });
  it('rejects duplicates, wrong-page metadata, contradictory totals, invalid timestamps and status leaks', () => {
    const valid = countryPageFixture();
    for (const input of [
      { ...valid, items: [{ ...countryFixture, id: '1' }] },
      { ...valid, items: [{ ...countryFixture, createdOn: 'yesterday' }] },
      { ...valid, items: [{ ...countryFixture, isDeleted: true }] },
      countryPageFixture(defaultCountryQuery, [countryFixture, countryFixture], 2),
      { ...valid, metaData: { ...valid.metaData, pageNumber: 2 } },
      { ...valid, metaData: { ...valid.metaData, totalPages: 9 } },
      { ...valid, metaData: { ...valid.metaData, hasNext: true } },
      { ...valid, metaData: { ...valid.metaData, totalCount: 0, totalPages: 0 } },
    ]) expect(() => parseCountryPage(input, defaultCountryQuery)).toThrow();
  });
});
