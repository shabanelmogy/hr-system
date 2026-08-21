import { describe, expect, it } from '@jest/globals';
import { stateEndpoints } from '../state-endpoints';
import { toStatePageQuery } from '../state-api';
import { bulkArchiveStatesResultSchema, statePageSchema, stateWithDistrictsSchema } from '../state-schemas';

describe('state API boundary', () => {
  it('serializes State paging, field, condition, and lifecycle criteria', () => {
    expect(toStatePageQuery({ pageNumber: 2, pageSize: 5, search: ' Cairo ', searchField: 'nameEn', searchOperator: 'startsWith', status: 'archived', sortBy: 'createdOn', sortDirection: 'desc', countryId: 7, hasDistricts: true })).toBe('pageNumber=2&pageSize=5&status=archived&sortBy=createdOn&sortDirection=desc&searchField=nameEn&searchOperator=startsWith&search=Cairo&countryId=7&hasDistricts=true');
  });
  it('rejects incomplete State page rows', () => {
    expect(() => statePageSchema.parse({ items: [{ id: 1, nameAr: 'القاهرة', nameEn: 'Cairo' }], metaData: { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false } })).toThrow();
  });
  it('keeps the relation and bulk archive contracts explicit', () => {
    const state = { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7, country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false }, createdOn: '2026-08-20T10:00:00Z', updatedOn: null, isDeleted: false, districts: [{ id: 2, nameAr: 'مدينة نصر', nameEn: 'Nasr City', code: 'NAS', isDeleted: false }] };
    expect(stateWithDistrictsSchema.parse(state)).toEqual(state);
    expect(stateEndpoints.bulkArchive).toBe('states/bulk-archive');
    expect(bulkArchiveStatesResultSchema.parse({ archivedCount: 2 })).toEqual({ archivedCount: 2 });
  });
});
