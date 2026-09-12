import type { CompanyGeographicScopeRepository } from '../domain/repositories/company-geographic-scope-repository';
import { createCompanyGeographicScopeUseCases } from './company-geographic-scope-use-cases';

function repositoryMock(): jest.Mocked<CompanyGeographicScopeRepository> {
  return { get: jest.fn(), update: jest.fn() };
}

describe('company geographic scope application use cases', () => {
  it('delegates reads and normalizes updates', async () => {
    const repository = repositoryMock();
    const scope = { companyId: 1, defaultCountryId: 1, registrationCountryId: 1, countries: [] };
    repository.get.mockResolvedValue(scope);
    repository.update.mockResolvedValue(scope);
    const useCases = createCompanyGeographicScopeUseCases(repository);

    await expect(useCases.get()).resolves.toBe(scope);
    await useCases.update({ countryIds: [1, 1], registrationCountryId: 1, defaultCountryId: 1 });

    expect(repository.update).toHaveBeenCalledWith({
      countryIds: [1], registrationCountryId: 1, defaultCountryId: 1,
    });
  });
});
