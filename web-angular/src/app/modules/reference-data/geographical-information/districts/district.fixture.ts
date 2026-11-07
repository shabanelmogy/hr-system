import {
  defaultDistrictQuery,
  type DistrictDetail,
  type DistrictListItem,
  type DistrictPage,
  type DistrictQuery,
} from './types/district';

/** Synthetic global geography used by the feature's contract and UI tests. */
export const districtFixture: DistrictListItem = {
  id: 1,
  nameAr: 'القاهرة',
  nameEn: 'Cairo',
  code: 'CAI',
  stateId: 1,
  state: { id: 1, nameAr: 'مصر', nameEn: 'Egypt', code: 'CAI', countryId: 1 },
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null,
  isDeleted: false,
  addressesCount: 4,
};

export const districtDetailFixture: DistrictDetail = {
  id: districtFixture.id,
  nameAr: districtFixture.nameAr,
  nameEn: districtFixture.nameEn,
  code: districtFixture.code,
  stateId: districtFixture.stateId,
  state: districtFixture.state,
  createdOn: districtFixture.createdOn,
  updatedOn: districtFixture.updatedOn,
  isDeleted: districtFixture.isDeleted,
};

export function districtPageFixture(
  query: DistrictQuery = defaultDistrictQuery,
  items: DistrictListItem[] = [districtFixture],
  totalCount = items.length,
): DistrictPage {
  const totalPages = Math.ceil(totalCount / query.pageSize);
  return {
    items,
    metaData: {
      pageSize: query.pageSize,
      currentPage: query.pageNumber,
      pageNumber: query.pageNumber,
      totalCount,
      totalPages,
      hasPrev: query.pageNumber > 1,
      hasNext: query.pageNumber < totalPages,
    },
  };
}
