import type { FiscalYearRepository } from '../domain/repositories/fiscal-year-repository';
import { createFiscalYearUseCases } from './fiscal-year-use-cases';

function repositoryMock(): jest.Mocked<FiscalYearRepository> {
  return {
    getPage: jest.fn(), getById: jest.fn(), getLookup: jest.fn(), create: jest.fn(), update: jest.fn(),
    archive: jest.fn(), restore: jest.fn(), lifecycle: jest.fn(),
  };
}

const detail = {
  id: 7, code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027',
  startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const, status: 1 as const,
  createdOn: '2026-09-05T18:00:00Z', updatedOn: null, isDeleted: false, rowVersion: 'AQ==', periods: [],
};

describe('fiscal year application use cases', () => {
  it('delegates lookup reads through the repository port', async () => {
    const repository = repositoryMock();
    repository.getLookup.mockResolvedValue([]);
    const useCases = createFiscalYearUseCases(repository);
    await expect(useCases.getLookup()).resolves.toEqual([]);
    expect(repository.getLookup).toHaveBeenCalledTimes(1);
  });

  it('normalizes create/update writes and preserves optimistic concurrency', async () => {
    const repository = repositoryMock();
    repository.create.mockResolvedValue(detail);
    repository.update.mockResolvedValue(detail);
    const useCases = createFiscalYearUseCases(repository);
    const request = { code: ' fy-2027 ', nameAr: ' السنة المالية 2027 ', nameEn: ' Fiscal Year 2027 ', startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const };
    const normalized = { ...request, code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027' };

    await useCases.save({ id: null, request });
    await useCases.save({ id: 7, request, rowVersion: 'AQ==' });
    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(7, normalized, 'AQ==');
  });

  it('fails closed when an update lacks rowVersion', async () => {
    const repository = repositoryMock();
    const useCases = createFiscalYearUseCases(repository);
    const request = { code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027', startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const };
    expect(() => useCases.save({ id: 7, request })).toThrow('rowVersion');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('requires and forwards the current rowVersion when archiving', async () => {
    const repository = repositoryMock();
    repository.archive.mockResolvedValue(undefined);
    const useCases = createFiscalYearUseCases(repository);

    await useCases.archive(7, 'AQ==');

    expect(repository.archive).toHaveBeenCalledWith(7, 'AQ==');
  });
});
