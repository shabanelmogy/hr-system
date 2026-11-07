import { defaultStateQuery, parseStatePage, stateQueryParameters } from './state';

describe('States read boundary', () => {
  const row = {
    id: 1,
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    code: 'CAI',
    countryId: 7,
    country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    districtsCount: 2,
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: null,
    isDeleted: false,
  };
  it('keeps false criteria and only sends supported GET criteria', () => {
    expect(
      stateQueryParameters({ ...defaultStateQuery, countryId: 7, hasDistricts: false }).params,
    ).toMatchObject({
      countryId: '7',
      hasDistricts: 'false',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    });
  });
  it('rejects a page whose parent identity or status contradicts its request', () => {
    const page = {
      items: [row],
      metaData: {
        currentPage: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    };
    expect(parseStatePage(page, defaultStateQuery).items[0]?.districtsCount).toBe(2);
    expect(() =>
      parseStatePage(
        { ...page, items: [{ ...row, countryId: 8 }] },
        { ...defaultStateQuery, countryId: 7 },
      ),
    ).toThrow();
  });
});
