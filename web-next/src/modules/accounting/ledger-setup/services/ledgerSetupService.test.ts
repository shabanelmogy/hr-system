import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRoutes } from '@/config';
import { ApiClientError } from '@/lib/api/client';
import { ledgerSetupService } from './ledgerSetupService';

const { get, post, put, remove } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), remove: vi.fn() }));

vi.mock('@/shared/services/apiService', () => ({ default: { get, post, put, delete: remove } }));

describe('ledgerSetupService', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); put.mockReset(); remove.mockReset(); });

  it('treats an unconfigured company settings aggregate as an empty editable state', async () => {
    get.mockRejectedValue(new ApiClientError({ status: 404, title: 'Not Found', message: 'Not Found', fieldErrors: null, errors: null }));
    await expect(ledgerSetupService.list('settings')).resolves.toEqual([]);
    expect(get).toHaveBeenCalledWith(apiRoutes.ledgerSetup.settings.get);
  });

  it('uses the scoped dimension endpoints and the policy upsert endpoint', async () => {
    get.mockResolvedValue([]); put.mockResolvedValue({ id: 3 });
    await ledgerSetupService.list('dimensionValues', 8);
    await ledgerSetupService.list('dimensionPolicies', 4);
    await ledgerSetupService.save('dimensionPolicies', null, { accountId: 4, dimensionDefinitionId: 8, requirement: 2 });
    expect(get).toHaveBeenNthCalledWith(1, apiRoutes.ledgerSetup.dimensions.values(8), expect.anything());
    expect(get).toHaveBeenNthCalledWith(2, apiRoutes.ledgerSetup.dimensions.policies(4));
    expect(put).toHaveBeenCalledWith(`${apiRoutes.ledgerSetup.dimensions.base}/policies`, { accountId: 4, dimensionDefinitionId: 8, requirement: 2 });
  });

  it('passes server page and supported search criteria without a fixed first-page cap', async () => {
    get.mockResolvedValue([]);
    await ledgerSetupService.list('accounts', undefined, 3, 25, 'Cash');
    await ledgerSetupService.account(12);
    expect(get).toHaveBeenNthCalledWith(1, apiRoutes.ledgerSetup.accounts.base, { recordStatus: 'all', pageNumber: 3, pageSize: 25, search: 'Cash' });
    expect(get).toHaveBeenNthCalledWith(2, apiRoutes.ledgerSetup.accounts.update(12));
  });

  it('loads dimension selector options beyond the first API page', async () => {
    get.mockResolvedValueOnce(Array.from({ length: 500 }, (_, id) => ({ id: id + 1 }))).mockResolvedValueOnce([{ id: 501 }]);
    const options = await ledgerSetupService.lookups(['dimensions']);
    expect(options.dimensions).toHaveLength(501);
    expect(get).toHaveBeenNthCalledWith(2, apiRoutes.ledgerSetup.dimensions.base, { recordStatus: 'active', pageNumber: 2, pageSize: 500 });
  });

  it('sends row versions for lifecycle actions and keeps resolution preview typed', async () => {
    remove.mockResolvedValue(undefined); post.mockResolvedValue({ status: 1, accountId: 20, candidates: [] });
    const item = { id: 7, rowVersion: 'AQ==' };
    await ledgerSetupService.archive('books', item);
    await ledgerSetupService.restore('books', item);
    await ledgerSetupService.resolvePreview({ bookId: 2, purposeCode: 'AR', onDate: '2026-09-22' });
    expect(remove).toHaveBeenCalledWith(apiRoutes.ledgerSetup.books.byId(7), { rowVersion: 'AQ==' });
    expect(post).toHaveBeenCalledWith(apiRoutes.ledgerSetup.books.restore(7), { rowVersion: 'AQ==' });
    expect(post).toHaveBeenCalledWith(apiRoutes.ledgerSetup.postingProfiles.resolvePreview, { bookId: 2, purposeCode: 'AR', onDate: '2026-09-22' });
  });
});
