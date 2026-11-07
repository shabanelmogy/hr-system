import { defaultDistrictQuery, parseDistrictPage, districtQueryParameters } from './district';

describe('Districts read boundary', () => {
  const row = {
    id: 1,
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    code: 'CAI',
    stateId: 7,
    state: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', code: 'CAI', countryId: 1 },
    addressesCount: 2,
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: null,
    isDeleted: false,
  };
  it('keeps false criteria and only sends supported GET criteria', () => {
    expect(
      districtQueryParameters({ ...defaultDistrictQuery, stateId: 7, hasAddresses: false }).params,
    ).toMatchObject({
      stateId: '7',
      hasAddresses: 'false',
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
    expect(parseDistrictPage(page, defaultDistrictQuery).items[0]?.addressesCount).toBe(2);
    expect(() =>
      parseDistrictPage(
        { ...page, items: [{ ...row, stateId: 8 }] },
        { ...defaultDistrictQuery, stateId: 7 },
      ),
    ).toThrow();
  });
});
