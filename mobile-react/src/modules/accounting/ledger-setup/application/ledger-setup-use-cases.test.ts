import type { LedgerSetupRepository } from '../domain/repositories/ledger-setup-repository';
import { createLedgerSetupUseCases } from './ledger-setup-use-cases';

function repositoryMock(): jest.Mocked<LedgerSetupRepository> {
  return { list: jest.fn(), account: jest.fn(), accountTree: jest.fn(), lookups: jest.fn(), save: jest.fn(), archive: jest.fn(), restore: jest.fn(), resolvePreview: jest.fn() };
}

describe('ledger setup application use cases', () => {
  it('keeps presentation dependent on the repository port for lookups and scoped lists', async () => {
    const repository = repositoryMock();
    repository.list.mockResolvedValue([]);
    repository.lookups.mockResolvedValue({ accounts: [] });
    const useCases = createLedgerSetupUseCases(repository);
    await expect(useCases.list('dimensionValues', 9)).resolves.toEqual([]);
    await expect(useCases.lookups()).resolves.toEqual({ accounts: [] });
    expect(repository.list).toHaveBeenCalledWith('dimensionValues', 9, undefined, undefined, undefined);
    expect(repository.lookups).toHaveBeenCalledTimes(1);
  });

  it('passes optimistic concurrency and preview requests without reshaping domain contracts', async () => {
    const repository = repositoryMock();
    repository.save.mockResolvedValue({ id: 5, rowVersion: 'AQ==' });
    repository.resolvePreview.mockResolvedValue({ status: 1, accountId: 10, candidates: [] });
    const useCases = createLedgerSetupUseCases(repository);
    await useCases.save('accounts', 5, { code: '1100', rowVersion: 'AQ==' });
    await useCases.resolvePreview({ bookId: 1, purposeCode: 'AR', onDate: '2026-09-22' });
    expect(repository.save).toHaveBeenCalledWith('accounts', 5, { code: '1100', rowVersion: 'AQ==' });
    expect(repository.resolvePreview).toHaveBeenCalledWith({ bookId: 1, purposeCode: 'AR', onDate: '2026-09-22' });
  });
});
