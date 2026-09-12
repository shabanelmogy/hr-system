import {
  OfflineOperationsRemoteUnavailableError,
  type OfflineOperationMode,
  type OfflineOperationsScope,
  type ServerOfflineOperationsPolicy,
  type ServerOfflineOperationsPolicySnapshot,
} from '../domain/models/offline-operations-policy';
import type { OfflineOperationsPolicyRepository } from '../domain/repositories/offline-operations-policy-repository';
import type { OfflineCapabilityPolicy } from '../domain/services/offline-capability-policy';
import {
  createOfflineOperationsPolicyUseCases,
  MAX_SERVER_POLICY_CACHE_TTL_MS,
} from './offline-operations-policy-use-cases';

const NOW = new Date('2026-09-11T04:00:00.000Z');
const countriesRead = 'countries.read';
const workforcePlanUpdateDraft = 'workforce-plan.update-draft';
const scopeA: OfflineOperationsScope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 7 };

const capabilityPolicy: OfflineCapabilityPolicy = {
  definitions: () => [
    { id: countriesRead, supportedModes: ['online-only', 'offline-read'] },
    { id: workforcePlanUpdateDraft, supportedModes: ['online-only', 'offline-draft', 'offline-command'] },
  ],
  getDefinition: (capabilityId) => capabilityPolicy.definitions().find((item) => item.id === capabilityId),
  isSupportedMode: (capabilityId, mode): mode is OfflineOperationMode => {
    if (typeof mode !== 'string') return false;
    return Boolean(capabilityPolicy.getDefinition(capabilityId)?.supportedModes.includes(
      mode as OfflineOperationMode,
    ));
  },
  resolve: (scope, capabilityId, modes) => ({
    capabilityId,
    tenantId: scope.tenantId,
    companyId: scope.companyId,
    mode: modes[capabilityId] ?? 'online-only',
    source: 'override',
  }),
};

class MemoryRepository implements OfflineOperationsPolicyRepository {
  remote: ServerOfflineOperationsPolicy = serverPolicy();
  cache = new Map<string, unknown>();
  unavailable = false;
  fetchCount = 0;
  updateCount = 0;
  cacheWriteCount = 0;
  lastUpdate: {
    modes: Readonly<Record<string, OfflineOperationMode>>;
    rowVersion: string | null;
  } | null = null;

  async fetchRemote(): Promise<ServerOfflineOperationsPolicy> {
    this.fetchCount += 1;
    if (this.unavailable) throw new OfflineOperationsRemoteUnavailableError();
    return this.remote;
  }

  async updateRemote(
    _scope: OfflineOperationsScope,
    modes: Readonly<Record<string, OfflineOperationMode>>,
    rowVersion: string | null,
  ): Promise<ServerOfflineOperationsPolicy> {
    this.updateCount += 1;
    if (this.unavailable) throw new OfflineOperationsRemoteUnavailableError();
    this.lastUpdate = { modes, rowVersion };
    this.remote = serverPolicy({ ...this.remote, modes, rowVersion: 'rv-2' });
    return this.remote;
  }

  async readCache(scope: OfflineOperationsScope): Promise<unknown | null> {
    return this.cache.get(scopeKey(scope)) ?? null;
  }

  async writeCache(
    scope: OfflineOperationsScope,
    snapshot: ServerOfflineOperationsPolicySnapshot,
  ): Promise<void> {
    this.cacheWriteCount += 1;
    this.cache.set(scopeKey(scope), snapshot);
  }
}

describe('offline operations server policy use cases', () => {
  it('loads the authoritative server policy and caches it for the complete local scope', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('ready');
    expect(state.resolved[countriesRead].mode).toBe('offline-read');
    expect(state.resolved[workforcePlanUpdateDraft].mode).toBe('online-only');
    expect(state.snapshot).toMatchObject({ kind: 'server-policy-cache', rowVersion: 'rv-1' });
    expect(repository.cacheWriteCount).toBe(1);
    expect(repository.cache.has(scopeKey(scopeA))).toBe(true);
  });

  it('uses a valid bounded server cache only when the remote policy is unavailable', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });
    const online = await useCases.load(scopeA);
    repository.unavailable = true;

    const cached = await useCases.load(scopeA);

    expect(online.status).toBe('ready');
    expect(cached.status).toBe('ready');
    expect(cached.resolved[countriesRead].mode).toBe('offline-read');
  });

  it('fails closed when the remote is unavailable and no valid cache exists', async () => {
    const repository = new MemoryRepository();
    repository.unavailable = true;
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('missing');
    expect(state.resolved[countriesRead]).toMatchObject({ mode: 'online-only', source: 'fail-closed' });
  });

  it('fails closed when the cached server policy is stale', async () => {
    const repository = new MemoryRepository();
    repository.unavailable = true;
    repository.cache.set(scopeKey(scopeA), snapshot(
      scopeA,
      '2026-09-10T04:00:00.000Z',
      '2026-09-11T03:59:59.000Z',
    ));
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('stale');
    expect(state.resolved[countriesRead].mode).toBe('online-only');
  });

  it('fails closed instead of caching a server mode unsupported by this build', async () => {
    const repository = new MemoryRepository();
    repository.remote = serverPolicy({
      modes: {
        [countriesRead]: 'offline-read',
        [workforcePlanUpdateDraft]: 'offline-read',
      },
    });
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('invalid');
    expect(repository.cacheWriteCount).toBe(0);
    expect(state.resolved[workforcePlanUpdateDraft].mode).toBe('online-only');
  });

  it('accepts a wider server capability contract while keeping the effective mode inside the client safety ceiling', async () => {
    const repository = new MemoryRepository();
    repository.remote = serverPolicy({
      capabilities: [
        {
          id: countriesRead,
          supportedModes: ['online-only', 'offline-read', 'offline-command'],
        },
        {
          id: workforcePlanUpdateDraft,
          supportedModes: ['online-only', 'offline-draft', 'offline-command'],
        },
      ],
    });
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('ready');
    expect(state.authority).toBe('server');
    expect(state.resolved[countriesRead].mode).toBe('offline-read');
    await expect(useCases.setMode(scopeA, countriesRead, 'offline-command'))
      .rejects.toThrow('not supported');
  });

  it('preserves additive server capabilities on updates and includes them in an online-only reset', async () => {
    const repository = new MemoryRepository();
    repository.remote = serverPolicy({
      modes: {
        [countriesRead]: 'offline-read',
        [workforcePlanUpdateDraft]: 'online-only',
        'future.safe-read': 'offline-read',
      },
      capabilities: [
        ...serverPolicy().capabilities,
        { id: 'future.safe-read', supportedModes: ['online-only', 'offline-read'] },
      ],
    });
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const loaded = await useCases.load(scopeA);
    expect(loaded.status).toBe('ready');
    expect(loaded.resolved[countriesRead].mode).toBe('offline-read');

    await useCases.setMode(scopeA, workforcePlanUpdateDraft, 'offline-draft');
    expect(repository.lastUpdate?.modes).toEqual({
      [countriesRead]: 'offline-read',
      [workforcePlanUpdateDraft]: 'offline-draft',
      'future.safe-read': 'offline-read',
    });

    await useCases.reset(scopeA);
    expect(repository.lastUpdate?.modes).toEqual({
      [countriesRead]: 'online-only',
      [workforcePlanUpdateDraft]: 'online-only',
      'future.safe-read': 'online-only',
    });
  });

  it('fails closed when a client-certified capability is missing from the server contract', async () => {
    const repository = new MemoryRepository();
    repository.remote = serverPolicy({
      modes: { [countriesRead]: 'offline-read' },
      capabilities: [{ id: countriesRead, supportedModes: ['online-only', 'offline-read'] }],
    });
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.load(scopeA);

    expect(state.status).toBe('invalid');
    expect(state.authority).toBe('fail-closed');
    expect(state.resolved[workforcePlanUpdateDraft].mode).toBe('online-only');
  });

  it('updates only through the server using the latest rowVersion and a complete mode set', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, {
      now: () => NOW,
      ttlMs: MAX_SERVER_POLICY_CACHE_TTL_MS * 3,
    });

    const state = await useCases.setMode(scopeA, countriesRead, 'online-only');

    expect(repository.fetchCount).toBe(1);
    expect(repository.updateCount).toBe(1);
    expect(repository.lastUpdate).toEqual({
      rowVersion: 'rv-1',
      modes: {
        [countriesRead]: 'online-only',
        [workforcePlanUpdateDraft]: 'online-only',
      },
    });
    expect(state.snapshot?.rowVersion).toBe('rv-2');
    expect(new Date(state.snapshot!.validUntil).getTime() - new Date(state.snapshot!.fetchedAt).getTime())
      .toBe(MAX_SERVER_POLICY_CACHE_TTL_MS);
  });

  it('rejects unsupported changes without a server request', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    await expect(useCases.setMode(scopeA, workforcePlanUpdateDraft, 'offline-read'))
      .rejects.toThrow('not supported');
    expect(repository.fetchCount).toBe(0);
    expect(repository.updateCount).toBe(0);
  });

  it('can opt the certified workforce capability into row-versioned command replay', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.setMode(scopeA, workforcePlanUpdateDraft, 'offline-command');

    expect(repository.lastUpdate).toEqual({
      rowVersion: 'rv-1',
      modes: {
        [countriesRead]: 'offline-read',
        [workforcePlanUpdateDraft]: 'offline-command',
      },
    });
    expect(state.resolved[workforcePlanUpdateDraft].mode).toBe('offline-command');
  });

  it('reset is an authoritative server update to online-only rather than cache deletion', async () => {
    const repository = new MemoryRepository();
    const useCases = createOfflineOperationsPolicyUseCases(repository, capabilityPolicy, { now: () => NOW });

    const state = await useCases.reset(scopeA);

    expect(repository.lastUpdate).toEqual({
      rowVersion: 'rv-1',
      modes: {
        [countriesRead]: 'online-only',
        [workforcePlanUpdateDraft]: 'online-only',
      },
    });
    expect(state.status).toBe('ready');
  });
});

function serverPolicy(overrides: Partial<ServerOfflineOperationsPolicy> = {}): ServerOfflineOperationsPolicy {
  return {
    version: 1,
    tenantId: 'tenant-a',
    companyId: 7,
    modes: {
      [countriesRead]: 'offline-read',
      [workforcePlanUpdateDraft]: 'online-only',
    },
    capabilities: [
      { id: countriesRead, supportedModes: ['online-only', 'offline-read'] },
      {
        id: workforcePlanUpdateDraft,
        supportedModes: ['online-only', 'offline-draft', 'offline-command'],
      },
    ],
    rowVersion: 'rv-1',
    updatedOn: '2026-09-11T03:55:00.000Z',
    updatedByUserId: 'admin-a',
    ...overrides,
  };
}

function snapshot(
  scope: OfflineOperationsScope,
  fetchedAt = '2026-09-11T03:00:00.000Z',
  validUntil = '2026-09-11T11:00:00.000Z',
): ServerOfflineOperationsPolicySnapshot {
  return {
    version: 1,
    kind: 'server-policy-cache',
    scope,
    modes: serverPolicy().modes,
    capabilities: serverPolicy().capabilities,
    rowVersion: 'rv-1',
    serverUpdatedOn: '2026-09-11T02:00:00.000Z',
    fetchedAt,
    validUntil,
  };
}

function scopeKey(scope: OfflineOperationsScope): string {
  return `${scope.userId}:${scope.tenantId}:${scope.companyId}`;
}
