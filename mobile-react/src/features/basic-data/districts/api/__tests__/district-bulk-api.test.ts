import { apiService } from '@/src/core/api';
import { districtApi } from '../district-api';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { post: jest.fn() },
}));

describe('district bulk-create transport', () => {
  it('posts the exact normalized districts envelope and parses createdCount', async () => {
    const post = apiService.post as jest.Mock;
    post.mockResolvedValue({ createdCount: 2 });
    const requests = [{ nameAr: ' المعادي ', nameEn: ' Maadi ', code: 'maa', stateId: 7 }];

    await expect(districtApi.bulkCreate(requests)).resolves.toEqual({ createdCount: 2 });
    expect(post).toHaveBeenCalledWith('districts/bulk', { districts: [{
      nameAr: 'المعادي', nameEn: 'Maadi', code: 'MAA', stateId: 7,
    }] });
  });
});
