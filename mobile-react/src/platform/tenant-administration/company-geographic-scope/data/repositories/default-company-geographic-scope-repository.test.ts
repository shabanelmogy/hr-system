import type { CompanyGeographicScopeRemoteDataSource } from '../remote/company-geographic-scope-remote-data-source';
import { DefaultCompanyGeographicScopeRepository } from './default-company-geographic-scope-repository';

function remoteMock(): jest.Mocked<CompanyGeographicScopeRemoteDataSource> {
  return { get: jest.fn(), update: jest.fn() };
}

describe('DefaultCompanyGeographicScopeRepository', () => {
  it('requires connectivity for reads and writes', async () => {
    const remote = remoteMock();
    const repository = new DefaultCompanyGeographicScopeRepository(remote, () => false);

    expect(() => repository.get()).toThrow('requires an internet connection');
    expect(() => repository.update({ countryIds: [1], registrationCountryId: 1, defaultCountryId: 1 }))
      .toThrow('requires an internet connection');
    expect(remote.get).not.toHaveBeenCalled();
    expect(remote.update).not.toHaveBeenCalled();
  });
});
