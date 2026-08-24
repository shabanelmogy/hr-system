import { apiService } from '@/src/core/api';
import { stateApi } from '../state-api';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { post: jest.fn() },
}));

describe('state bulk-create transport', () => {
  it('posts the exact normalized states envelope and parses createdCount', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue({ createdCount: 2 });
    const requests = [{ nameAr: ' القاهرة ', nameEn: ' Cairo ', code: 'cai', countryId: 7 }];
    await expect(stateApi.bulkCreate(requests)).resolves.toEqual({ createdCount: 2 });
    expect(post).toHaveBeenCalledWith('states/bulk', { states: [{
      nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7,
    }] });
  });
});
