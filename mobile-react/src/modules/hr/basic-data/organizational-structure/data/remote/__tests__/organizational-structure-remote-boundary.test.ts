import { organizationalStructureEndpoints } from '../organizational-structure-endpoints';
import { toOrganizationalStructureQuery } from '../organizational-structure-remote-data-source';
import {
  organizationalStructureBulkResponseSchema,
  organizationalStructureLookupSchema,
} from '../organizational-structure-schemas';

describe('organizational structure remote boundary', () => {
  it('preserves list and lookup endpoint contracts', () => {
    expect(toOrganizationalStructureQuery({
      resource: 'departments',
      pageNumber: 2,
      pageSize: 10,
      search: ' Finance ',
      searchField: 'nameEn',
      searchOperator: 'startsWith',
      status: 'active',
      sortBy: 'createdOn',
      sortDirection: 'desc',
      parentId: 7,
    })).toBe('pageNumber=2&pageSize=10&status=active&searchField=nameEn&searchOperator=startsWith&sortBy=createdOn&sortDirection=desc&search=Finance&parentId=7');
    expect(organizationalStructureEndpoints.lookup('positions')).toBe('organizational-structure/positions/lookup');
  });

  it('validates lookup and bulk response shapes', () => {
    expect(organizationalStructureLookupSchema.parse([
      { id: 1, code: 'BR-1', nameEn: 'Branch', nameAr: 'فرع' },
    ])).toHaveLength(1);
    expect(organizationalStructureBulkResponseSchema.parse({ createdCount: 3 })).toEqual({ createdCount: 3 });
  });
});
