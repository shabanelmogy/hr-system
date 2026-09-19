import { apiService } from '@/src/core/api';
import { companyGeographicScopeRemoteDataSource } from './company-geographic-scope-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { get: jest.fn(), put: jest.fn() },
}));

const scope = {
  companyId: 1,
  defaultCountryId: 1,
  registrationCountryId: 1,
  countries: [{
    id: 1,
    nameAr: 'مصر',
    nameEn: 'Egypt',
    alpha2Code: 'EG',
    alpha3Code: 'EGY',
    isSelected: true,
    isDefault: true,
    isRegistrationCountry: true,
  }],
};

describe('company geographic scope remote boundary', () => {
  it('parses get and sends the exact update payload', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(scope);
    (apiService.put as jest.Mock).mockResolvedValue(scope);
    const request = { countryIds: [1], registrationCountryId: 1, defaultCountryId: 1 };

    await expect(companyGeographicScopeRemoteDataSource.get()).resolves.toEqual(scope);
    await expect(companyGeographicScopeRemoteDataSource.update(request)).resolves.toEqual(scope);
    expect(apiService.put).toHaveBeenCalledWith('company-geographic-scope', request);
  });
});
