import { describe, expect, it } from '@jest/globals';
import { coaHierarchyEndpoints } from '../coa-hierarchy-endpoints';
import { accountHierarchyLevelSchema, accountPageSchema, accountSchema, accountTreeSchema, proposedAccountCodeSchema } from '../coa-hierarchy-schemas';
import { toAccountPageQuery } from '../coa-hierarchy-remote-data-source';

const account = {
  id: 7, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', accountHierarchyLevelId: 2, parentAccountId: null,
  allowPosting: true, manualPostingPolicy: 1, currencyPolicy: 2, specificCurrencyId: null, isDeleted: false,
  createdOn: '2026-09-22T10:00:00Z', updatedOn: null, rowVersion: 'AQ==',
};

describe('COA hierarchy API boundary', () => {
  it('serializes the authoritative account paging/search/status/sort contract', () => {
    expect(toAccountPageQuery({ pageNumber: 3, pageSize: 25, search: ' cash ', searchField: 'nameEn', searchOperator: 'startsWith', recordStatus: 'archived', sortBy: 'createdOn', sortDirection: 'desc' }))
      .toBe('pageNumber=3&pageSize=25&searchField=nameEn&searchOperator=startsWith&recordStatus=archived&sortBy=createdOn&sortDirection=desc&search=cash');
  });

  it('keeps D-024 proposal and hierarchy endpoints on the Accounts resource', () => {
    expect(coaHierarchyEndpoints.accountCodeProposal).toBe('accounts/code-proposal');
    expect(coaHierarchyEndpoints.accountTree).toBe('accounts/tree');
    expect(coaHierarchyEndpoints.hierarchyLevels).toBe('accounts/hierarchy-levels');
    expect(proposedAccountCodeSchema.parse({ code: 'ACC-0042' })).toEqual({ code: 'ACC-0042' });
  });

  it('requires truthful PageResponse metadata and protected RowVersion values', () => {
    const metaData = { currentPage: 1, totalPages: 4, pageSize: 25, pageNumber: 1, totalCount: 77, hasPrev: false, hasNext: true };
    expect(accountPageSchema.parse({ items: [account], metaData }).metaData.totalCount).toBe(77);
    expect(() => accountSchema.parse({ ...account, rowVersion: '' })).toThrow();
    expect(() => accountHierarchyLevelSchema.parse({ id: 2, levelNumber: 1, nameAr: 'رئيسي', nameEn: 'Root', canPost: false, isDeleted: false, rowVersion: '' })).toThrow();
  });

  it('validates nested lightweight tree nodes independently from account detail', () => {
    const tree = accountTreeSchema.parse([{ id: 1, code: 'ACC-0001', nameAr: 'الأصول', nameEn: 'Assets', allowPosting: false, children: [{ id: 7, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', allowPosting: true, children: [] }] }]);
    expect(tree[0]?.children[0]?.id).toBe(7);
    expect('rowVersion' in (tree[0] ?? {})).toBe(false);
  });
});
