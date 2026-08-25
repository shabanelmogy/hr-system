import { describe, expect, it } from '@jest/globals';

import { toDistrictPageQuery } from '../district-api';
import { districtEndpoints } from '../district-endpoints';
import {
  bulkArchiveDistrictsResultSchema,
  bulkCreateDistrictsResultSchema,
  districtPageSchema,
  districtWithAddressesSchema,
} from '../district-schemas';
import {
  buildDistrictRenderFilters,
  getDistrictReportDisplayName,
} from '../district-report-api';

describe('district API boundary', () => {
  it('serializes server paging, search, State, and address-presence criteria', () => {
    expect(toDistrictPageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' Cairo ',
      searchField: 'nameEn',
      searchOperator: 'startsWith',
      status: 'archived',
      sortBy: 'createdOn',
      sortDirection: 'desc',
      stateId: 7,
      hasAddresses: true,
    })).toBe('pageNumber=2&pageSize=5&status=archived&sortBy=createdOn&sortDirection=desc&searchField=nameEn&searchOperator=startsWith&search=Cairo&stateId=7&hasAddresses=true');
  });

  it('rejects an incomplete District list row at the runtime boundary', () => {
    expect(() => districtPageSchema.parse({
      items: [{ id: 1, nameAr: 'المعادي', nameEn: 'Maadi' }],
      metaData: { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false },
    })).toThrow();
  });

  it('keeps address-detail and bulk-archive contracts explicit', () => {
    const district = {
      id: 1,
      nameAr: 'المعادي',
      nameEn: 'Maadi',
      code: 'MAA',
      stateId: 7,
      state: { id: 7, nameAr: 'القاهرة', nameEn: 'Cairo', isDeleted: false },
      createdOn: '2026-08-20T10:00:00Z',
      updatedOn: null,
      isDeleted: false,
      addresses: [{ id: 2, buildingNumber: '10', floor: '2', apartmentNumber: '5', postalCode: '11728', isDefault: true, isDeleted: false }],
    };

    expect(districtWithAddressesSchema.parse(district)).toEqual(district);
    expect(districtEndpoints.withAddresses(1)).toBe('districts/1/addresses');
    expect(districtEndpoints.bulkArchive).toBe('districts/bulk-archive');
    expect(bulkArchiveDistrictsResultSchema.parse({ archivedCount: 2 })).toEqual({ archivedCount: 2 });
  });

  it('keeps the atomic bulk-create route and response contract explicit', () => {
    expect(districtEndpoints.bulkCreate).toBe('districts/bulk');
    expect(bulkCreateDistrictsResultSchema.parse({ createdCount: 2 })).toEqual({ createdCount: 2 });
    expect(() => bulkCreateDistrictsResultSchema.parse({ createdCount: -1 })).toThrow();
  });

  it('maps only nonblank District and State filters to the managed render contract', () => {
    expect(buildDistrictRenderFilters(' المعادي ', ' Maadi ', ' القاهرة ', ' Cairo ')).toEqual({
      NameAr: 'المعادي',
      NameEn: 'Maadi',
      StateAr: 'القاهرة',
      StateEn: 'Cairo',
    });
    expect(buildDistrictRenderFilters(' ', '', '  ', '')).toEqual({});
  });

  it('uses managed SummaryInfo for localized District report names with a stable fallback', () => {
    const report = {
      id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      entityKey: 'districts',
      reportKey: 'districts-directory',
      displayName: 'Districts directory',
      summaryTitle: 'دليل الأحياء',
      summarySubject: 'Districts directory report',
      description: null,
      currentVersionNumber: 1,
      isPublished: true,
      isArchived: false,
      rowVersion: 'AQIDBA==',
      updatedOn: '2026-08-24T10:00:00Z',
    };

    expect(getDistrictReportDisplayName(report, 'ar')).toBe('دليل الأحياء');
    expect(getDistrictReportDisplayName(report, 'en')).toBe('Districts directory report');
    expect(getDistrictReportDisplayName({ ...report, summaryTitle: null }, 'ar')).toBe('Districts directory');
  });
});
