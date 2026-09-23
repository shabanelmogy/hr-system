import type { CoaHierarchyRemoteDataSource } from '../remote/coa-hierarchy-remote-data-source';
import { DefaultCoaHierarchyRepository } from './default-coa-hierarchy-repository';

function remoteMock(): jest.Mocked<CoaHierarchyRemoteDataSource> {
  return {
    getAccountPage: jest.fn(), getAccountTree: jest.fn(), getAccount: jest.fn(), getAccountLookup: jest.fn(), getAccountCodeProposal: jest.fn(),
    createAccount: jest.fn(), updateAccount: jest.fn(), archiveAccount: jest.fn(), restoreAccount: jest.fn(), getHierarchyLevels: jest.fn(),
    createHierarchyLevel: jest.fn(), updateHierarchyLevel: jest.fn(), archiveHierarchyLevel: jest.fn(), restoreHierarchyLevel: jest.fn(),
  };
}

describe('DefaultCoaHierarchyRepository', () => {
  it('flattens the nested server tree and preserves explicit parent identity', async () => {
    const remote = remoteMock();
    remote.getAccountTree.mockResolvedValue([{ id: 1, code: 'ACC-0001', nameAr: 'الأصول', nameEn: 'Assets', allowPosting: false, children: [{ id: 7, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', allowPosting: true, children: [] }] }]);
    const result = await new DefaultCoaHierarchyRepository(remote).getAccountTree();
    expect(result).toEqual([
      { id: 1, code: 'ACC-0001', nameAr: 'الأصول', nameEn: 'Assets', allowPosting: false, parentAccountId: null },
      { id: 7, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', allowPosting: true, parentAccountId: 1 },
    ]);
  });
});
