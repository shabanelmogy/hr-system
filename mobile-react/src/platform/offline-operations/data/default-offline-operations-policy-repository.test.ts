import type { OfflineScope, ScopedRecord } from '@/src/core/offline';

import type { ServerOfflineOperationsPolicySnapshot } from '../domain/models/offline-operations-policy';
import { DefaultOfflineOperationsPolicyRepository } from './default-offline-operations-policy-repository';

const scope: OfflineScope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 9 };
const snapshot: ServerOfflineOperationsPolicySnapshot = {
  version: 1,
  kind: 'server-policy-cache',
  scope,
  modes: {
    'countries.read': 'offline-read',
    'workforce-plan.update-draft': 'online-only',
  },
  capabilities: [
    { id: 'countries.read', supportedModes: ['online-only', 'offline-read'] },
    {
      id: 'workforce-plan.update-draft',
      supportedModes: ['online-only', 'offline-draft', 'offline-command'],
    },
  ],
  rowVersion: 'AQID',
  serverUpdatedOn: '2026-09-11T03:00:00.000Z',
  fetchedAt: '2026-09-11T03:05:00.000Z',
  validUntil: '2026-09-11T11:05:00.000Z',
};

describe('DefaultOfflineOperationsPolicyRepository cache', () => {
  it('isolates the server policy cache by the complete OfflineScope', async () => {
    const get = jest.fn<Promise<ScopedRecord<unknown> | null>, [OfflineScope, string, string]>()
      .mockResolvedValue({
        key: 'policy-v1',
        value: snapshot,
        serverRowVersion: snapshot.rowVersion,
        serverUpdatedAt: snapshot.serverUpdatedOn,
        localUpdatedAt: snapshot.fetchedAt,
        isDeleted: false,
      });
    const put = jest.fn().mockResolvedValue(undefined);
    const remote = {
      getPolicy: jest.fn(),
      updatePolicy: jest.fn(),
    };
    const repository = new DefaultOfflineOperationsPolicyRepository(
      remote,
      { get, put } as never,
    );

    await repository.writeCache(scope, snapshot);
    await expect(repository.readCache(scope)).resolves.toEqual(snapshot);

    expect(put).toHaveBeenCalledWith(expect.objectContaining({
      scope,
      namespace: 'offline-operations.server-policy-cache',
      key: 'policy-v1',
      serverRowVersion: 'AQID',
    }));
    expect(get).toHaveBeenCalledWith(scope, 'offline-operations.server-policy-cache', 'policy-v1');
  });
});
