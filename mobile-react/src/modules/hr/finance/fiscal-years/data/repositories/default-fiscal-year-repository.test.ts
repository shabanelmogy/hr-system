import type { FiscalYearRemoteDataSource } from '../remote/fiscal-year-remote-data-source';
import { DefaultFiscalYearRepository } from './default-fiscal-year-repository';

describe('DefaultFiscalYearRepository', () => {
  it('keeps writes online-authoritative by delegating directly to remote', async () => {
    const remote = { create: jest.fn(), getPage: jest.fn(), getById: jest.fn(), getLookup: jest.fn(), update: jest.fn(), archive: jest.fn(), restore: jest.fn(), lifecycle: jest.fn() } as jest.Mocked<FiscalYearRemoteDataSource>;
    const repository = new DefaultFiscalYearRepository(remote);
    const request = { code: 'FY-2027', nameAr: 'السنة المالية 2027', nameEn: 'Fiscal Year 2027', startDate: '2027-01-01', endDate: '2027-12-31', periodFrequency: 1 as const };
    remote.archive.mockResolvedValue(undefined);
    await repository.archive(7);
    expect(remote.archive).toHaveBeenCalledWith(7);
    expect(remote.create).not.toHaveBeenCalled();
    void request;
  });
});
