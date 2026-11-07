import {
  defaultStateQuery,
  type StateDetail,
  type StateListItem,
  type StatePage,
  type StateQuery,
} from './types/state';

/** Synthetic global geography used by the feature's contract and UI tests. */
export const stateFixture: StateListItem = {
  id: 1,
  nameAr: 'القاهرة',
  nameEn: 'Cairo',
  code: 'CAI',
  countryId: 1,
  country: { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null,
  isDeleted: false,
  districtsCount: 4,
};

export const stateDetailFixture: StateDetail = {
  id: stateFixture.id,
  nameAr: stateFixture.nameAr,
  nameEn: stateFixture.nameEn,
  code: stateFixture.code,
  countryId: stateFixture.countryId,
  country: stateFixture.country,
  createdOn: stateFixture.createdOn,
  updatedOn: stateFixture.updatedOn,
  isDeleted: stateFixture.isDeleted,
};

export function statePageFixture(
  query: StateQuery = defaultStateQuery,
  items: StateListItem[] = [stateFixture],
  totalCount = items.length,
): StatePage {
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
