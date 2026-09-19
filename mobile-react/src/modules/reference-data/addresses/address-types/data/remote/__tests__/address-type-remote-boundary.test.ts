import { addressTypeEndpoints } from '../address-type-endpoints';
import { toAddressTypePageQuery } from '../address-type-remote-data-source';
import {
  addressTypePageSchema,
  bulkArchiveAddressTypesSchema,
  bulkCreateAddressTypesSchema,
} from '../address-type-schemas';

describe('Address Type remote boundary', () => {
  it('serializes the documented server list contract', () => {
    expect(toAddressTypePageQuery({
      pageNumber: 2,
      pageSize: 5,
      search: ' Home ',
      searchField: 'nameEn',
      searchOperator: 'startsWith',
      status: 'archived',
      sortBy: 'createdOn',
      sortDirection: 'desc',
    })).toBe('pageNumber=2&pageSize=5&status=archived&searchField=nameEn&searchOperator=startsWith&sortBy=createdOn&sortDirection=desc&search=Home');
  });

  it('rejects incomplete rows and keeps bulk routes explicit', () => {
    expect(() => addressTypePageSchema.parse({
      items: [{ id: 1, nameAr: 'منزل', nameEn: 'Home' }],
      metaData: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 5,
        pageNumber: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    })).toThrow();
    expect(addressTypeEndpoints.bulkCreate).toBe('addresstypes/bulk');
    expect(addressTypeEndpoints.bulkArchive).toBe('addresstypes/bulk-archive');
    expect(bulkCreateAddressTypesSchema.parse({ createdCount: 2 })).toEqual({ createdCount: 2 });
    expect(bulkArchiveAddressTypesSchema.parse({ archivedCount: 2 })).toEqual({ archivedCount: 2 });
  });
});
