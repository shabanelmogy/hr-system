import { describe, expect, it, jest } from '@jest/globals';
import { apiService } from '@/src/core/api';
import { ledgerSetupEndpoints } from '../ledger-setup-endpoints';
import { ledgerSetupRemoteDataSource } from '../ledger-setup-remote-data-source';
import { ledgerSetupRecordListSchema, resolveAccountPreviewSchema } from '../ledger-setup-schemas';

describe('Ledger Setup API boundary', () => {
  it('keeps aggregate endpoints aligned with the Accounting API', () => {
    expect(ledgerSetupEndpoints.settings).toBe('accounting-settings');
    expect(ledgerSetupEndpoints.accounts.tree).toBe('accounts/tree');
    expect(ledgerSetupEndpoints.dimensions.values(8)).toBe('accounting-dimensions/8/values');
    expect(ledgerSetupEndpoints.dimensions.policies(4)).toBe('accounting-dimensions/accounts/4/policies');
    expect(ledgerSetupEndpoints.resolvePreview).toBe('posting-profiles/resolve-preview');
  });

  it('requires stable identifiers and concurrency tokens for records', () => {
    expect(ledgerSetupRecordListSchema.parse([{ id: 1, code: '1100', rowVersion: 'AQ==' }])[0]?.id).toBe(1);
    expect(() => ledgerSetupRecordListSchema.parse([{ id: 0 }])).toThrow();
    expect(resolveAccountPreviewSchema.parse({ status: 1, accountId: 10, candidates: [] }).accountId).toBe(10);
  });

  it('keeps full tree parent links and requests a versioned detail before editing', async () => {
    const get = jest.spyOn(apiService, 'get')
      .mockResolvedValueOnce([{ id: 1, code: '1', children: [{ id: 2, code: '11', children: [] }] }])
      .mockResolvedValueOnce({ id: 2, code: '11', rowVersion: 'AQ==' });
    try {
      expect(await ledgerSetupRemoteDataSource.accountTree()).toEqual([
        expect.objectContaining({ id: 1, parentAccountId: null }),
        expect.objectContaining({ id: 2, parentAccountId: 1 }),
      ]);
      expect((await ledgerSetupRemoteDataSource.account(2)).rowVersion).toBe('AQ==');
      expect(get).toHaveBeenNthCalledWith(2, 'accounts/2');
    } finally { get.mockRestore(); }
  });

  it('loads every dimension selector page', async () => {
    const get = jest.spyOn(apiService, 'get')
      .mockResolvedValueOnce(Array.from({ length: 500 }, (_, index) => ({ id: index + 1 })))
      .mockResolvedValueOnce([{ id: 501 }]);
    try {
      expect((await ledgerSetupRemoteDataSource.lookups(['dimensions'])).dimensions).toHaveLength(501);
      expect(get).toHaveBeenNthCalledWith(2, 'accounting-dimensions', { params: { recordStatus: 'active', pageNumber: 2, pageSize: 500 } });
    } finally { get.mockRestore(); }
  });
});
