import type { CoaHierarchyRepository } from '../domain/repositories/coa-hierarchy-repository';
import { applyInitialAccountCodeProposal } from './account-code-proposal-policy';
import { createCoaHierarchyUseCases } from './coa-hierarchy-use-cases';

function repositoryMock(): jest.Mocked<CoaHierarchyRepository> {
  return {
    getAccountPage: jest.fn(), getAccountTree: jest.fn(), getAccount: jest.fn(), getAccountLookup: jest.fn(), getAccountCodeProposal: jest.fn(),
    createAccount: jest.fn(), updateAccount: jest.fn(), archiveAccount: jest.fn(), restoreAccount: jest.fn(), getHierarchyLevels: jest.fn(),
    createHierarchyLevel: jest.fn(), updateHierarchyLevel: jest.fn(), archiveHierarchyLevel: jest.fn(), restoreHierarchyLevel: jest.fn(),
  };
}

const account = { id: 7, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', accountHierarchyLevelId: 2, parentAccountId: null, allowPosting: true, manualPostingPolicy: 1 as const, currencyPolicy: 2 as const, specificCurrencyId: null, isDeleted: false, createdOn: '2026-09-22T10:00:00Z', updatedOn: null, rowVersion: 'AQ==' };

describe('COA hierarchy application use cases', () => {
  it('normalizes account writes and requires RowVersion for update', async () => {
    const repository = repositoryMock(); repository.createAccount.mockResolvedValue(account); repository.updateAccount.mockResolvedValue(account);
    const useCases = createCoaHierarchyUseCases(repository);
    const request = { code: ' acc-0007 ', nameAr: ' النقدية ', nameEn: ' Cash ', accountHierarchyLevelId: 2, parentAccountId: 0, allowPosting: true, manualPostingPolicy: 1 as const, currencyPolicy: 2 as const, specificCurrencyId: 9 };
    await useCases.saveAccount({ id: null, request });
    expect(repository.createAccount).toHaveBeenCalledWith({ ...request, code: 'ACC-0007', nameAr: 'النقدية', nameEn: 'Cash', parentAccountId: null, specificCurrencyId: null });
    expect(() => useCases.saveAccount({ id: 7, request })).toThrow('rowVersion');
    await useCases.saveAccount({ id: 7, request, rowVersion: 'AQ==' });
    expect(repository.updateAccount).toHaveBeenCalledWith(7, expect.objectContaining({ code: 'ACC-0007' }), 'AQ==');
  });

  it('keeps a user-edited code when D-024 is refetched after a duplicate race', () => {
    const initial = applyInitialAccountCodeProposal('', 'ACC-0042', false);
    expect(initial).toEqual({ code: 'ACC-0042', proposalApplied: true });
    const userEdited = 'CUSTOM-42';
    expect(applyInitialAccountCodeProposal(userEdited, 'ACC-0043', initial.proposalApplied)).toEqual({ code: userEdited, proposalApplied: true });
  });

  it('does not overwrite a code typed before the first proposal arrives', () => {
    expect(applyInitialAccountCodeProposal('MANUAL-1', 'ACC-0042', false)).toEqual({ code: 'MANUAL-1', proposalApplied: true });
  });
});
