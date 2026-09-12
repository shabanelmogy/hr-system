import { apiService } from '@/src/core/api';
import { moduleRemoteDataSource } from './module-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: { get: jest.fn() },
}));

const modules = [{
  code: 'hr',
  name: 'Human Resources',
  submodules: [{ code: 'recruitment', name: 'Recruitment', requiredPermissions: ['Recruitment:View'] }],
  isDefault: true,
}];

describe('module remote data source', () => {
  it('loads and validates accessible and installed module catalogs', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(modules);

    await expect(moduleRemoteDataSource.getAccessible()).resolves.toEqual(modules);
    expect(apiService.get).toHaveBeenNthCalledWith(1, 'modules/accessible');
    await expect(moduleRemoteDataSource.getInstalled()).resolves.toEqual(modules);
    expect(apiService.get).toHaveBeenNthCalledWith(2, 'modules/installed');
  });

  it('rejects malformed catalog rows at the transport boundary', async () => {
    (apiService.get as jest.Mock).mockResolvedValue([{ code: 'hr' }]);
    await expect(moduleRemoteDataSource.getAccessible()).rejects.toThrow();
  });
});
