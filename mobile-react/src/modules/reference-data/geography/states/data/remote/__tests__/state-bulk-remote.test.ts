import { apiService } from '@/src/core/api';
import { stateRemoteDataSource } from '../state-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { post: jest.fn() },
}));

describe('state bulk-create transport', () => {
  it('posts the exact states envelope and parses createdCount', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue({ createdCount: 2 });
    const requests = [{ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }];
    await expect(stateRemoteDataSource.bulkCreate(requests)).resolves.toEqual({ createdCount: 2 });
    expect(post).toHaveBeenCalledWith('states/bulk', { states: [{
      nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7,
    }] });
  });
});
