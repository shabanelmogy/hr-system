import { apiService } from '@/src/core/api';
import { createCountryUseCases } from '../../../application/country-use-cases';
import { unavailableCountryLocalDataSource } from '../../local/country-local-data-source';
import { DefaultCountryRepository } from '../../repositories/default-country-repository';
import { countryRemoteDataSource } from '../country-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { post: jest.fn() },
}));

describe('country bulk-create transport', () => {
  it('posts the exact normalized countries envelope and parses createdCount', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue({ createdCount: 2 });
    const requests = [{
      nameAr: ' مصر ', nameEn: ' Egypt ', alpha2Code: 'eg', alpha3Code: 'egy',
      phoneCode: ' +20 ', currencyCode: 'egp',
    }];
    const repository = new DefaultCountryRepository(
      countryRemoteDataSource,
      unavailableCountryLocalDataSource,
      () => false,
    );
    const useCases = createCountryUseCases(repository);

    await expect(useCases.bulkCreate(requests)).resolves.toEqual({ createdCount: 2 });
    expect(post).toHaveBeenCalledWith('countries/bulk', { countries: [{
      nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY',
      phoneCode: '+20', currencyCode: 'EGP',
    }] });
  });
});
