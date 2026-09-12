import { apiService } from '@/src/core/api';
import { countryApi } from '../country-api';

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
    await expect(countryApi.bulkCreate(requests)).resolves.toEqual({ createdCount: 2 });
    expect(post).toHaveBeenCalledWith('countries/bulk', { countries: [{
      nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY',
      phoneCode: '+20', currencyCode: 'EGP',
    }] });
  });
});
