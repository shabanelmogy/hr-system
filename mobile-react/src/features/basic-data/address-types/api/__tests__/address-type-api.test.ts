import { describe, expect, it } from '@jest/globals';
import { addressTypeEndpoints } from '../address-type-endpoints';
import { toAddressTypePageQuery } from '../address-type-api';
import { addressTypePageSchema, bulkArchiveAddressTypesSchema, bulkCreateAddressTypesSchema } from '../address-type-schemas';
import { buildAddressTypeRenderFilters, getAddressTypeReportDisplayName } from '../address-type-report-api';

describe('Address Type API boundary', () => {
  it('serializes the documented server list contract', () => {
    expect(toAddressTypePageQuery({ pageNumber: 2, pageSize: 5, search: ' Home ', searchField: 'nameEn', searchOperator: 'startsWith', status: 'archived', sortBy: 'createdOn', sortDirection: 'desc' })).toBe('pageNumber=2&pageSize=5&status=archived&searchField=nameEn&searchOperator=startsWith&sortBy=createdOn&sortDirection=desc&search=Home');
  });
  it('rejects incomplete page rows and keeps bulk routes explicit', () => {
    expect(() => addressTypePageSchema.parse({ items: [{ id: 1, nameAr: 'منزل', nameEn: 'Home' }], metaData: { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false } })).toThrow();
    expect(addressTypeEndpoints.bulkCreate).toBe('addresstypes/bulk'); expect(addressTypeEndpoints.bulkArchive).toBe('addresstypes/bulk-archive'); expect(bulkCreateAddressTypesSchema.parse({ createdCount: 2 })).toEqual({ createdCount: 2 }); expect(bulkArchiveAddressTypesSchema.parse({ archivedCount: 2 })).toEqual({ archivedCount: 2 });
  });
  it('uses only the approved Crystal filters and localized summary name', () => {
    expect(buildAddressTypeRenderFilters(' منزل ', ' Home ')).toEqual({ NameAr: 'منزل', NameEn: 'Home' });
    const report = { id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301', entityKey: 'addresstypes', reportKey: 'addresstypes-directory', displayName: 'Address types', summaryTitle: 'دليل أنواع العناوين', summarySubject: 'Address type directory', description: null, currentVersionNumber: 1, isPublished: true, isArchived: false, rowVersion: '0x1', updatedOn: '2026-08-24T10:00:00Z' };
    expect(getAddressTypeReportDisplayName(report, 'ar')).toBe('دليل أنواع العناوين'); expect(getAddressTypeReportDisplayName(report, 'en')).toBe('Address type directory');
  });
});
