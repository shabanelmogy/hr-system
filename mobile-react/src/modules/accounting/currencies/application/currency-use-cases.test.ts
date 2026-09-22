import type { CurrencyRepository } from '../domain/repositories/currency-repository';
import { createCurrencyUseCases } from './currency-use-cases';

function repositoryMock(): jest.Mocked<CurrencyRepository> {
  return { getPage: jest.fn(), getById: jest.fn(), getLookup: jest.fn(), create: jest.fn(), update: jest.fn(), archive: jest.fn(), restore: jest.fn() };
}

const currency = { id: 7, currencyCode: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'EGP', createdOn: '2026-09-21T10:00:00Z', updatedOn: null, isDeleted: false, rowVersion: 'AQ==' };

describe('currency application use cases', () => {
  it('uses the Accounting lookup repository port', async () => {
    const repository = repositoryMock(); repository.getLookup.mockResolvedValue([]);
    await expect(createCurrencyUseCases(repository).getLookup()).resolves.toEqual([]);
    expect(repository.getLookup).toHaveBeenCalledTimes(1);
  });

  it('normalizes currency writes and preserves optimistic concurrency', async () => {
    const repository = repositoryMock(); repository.create.mockResolvedValue(currency); repository.update.mockResolvedValue(currency);
    const useCases = createCurrencyUseCases(repository);
    const request = { currencyCode: ' egp ', nameEn: ' Egyptian Pound ', nameAr: ' جنيه مصري ', symbol: ' EGP ' };
    const normalized = { currencyCode: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'EGP' };
    await useCases.save({ id: null, request });
    await useCases.save({ id: 7, request, rowVersion: 'AQ==' });
    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(7, normalized, 'AQ==');
  });

  it('fails closed when an update lacks RowVersion', () => {
    const repository = repositoryMock(); const useCases = createCurrencyUseCases(repository);
    expect(() => useCases.save({ id: 7, request: { currencyCode: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'EGP' } })).toThrow('rowVersion');
    expect(repository.update).not.toHaveBeenCalled();
  });
});
