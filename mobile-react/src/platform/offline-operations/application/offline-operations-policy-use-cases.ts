import {
  OfflineOperationsRemoteUnavailableError,
  SERVER_POLICY_CACHE_KIND,
  SERVER_POLICY_CACHE_VERSION,
  type OfflineOperationMode,
  type OfflineOperationsCapabilityDefinition,
  type OfflineOperationsPolicyState,
  type OfflineOperationsResolvedCapability,
  type OfflineOperationsScope,
  type OfflineOperationsSnapshotStatus,
  type ServerOfflineOperationsPolicy,
  type ServerOfflineOperationsPolicySnapshot,
  normalizeOfflineOperationsScope,
} from '../domain/models/offline-operations-policy';
import type { OfflineOperationsPolicyRepository } from '../domain/repositories/offline-operations-policy-repository';
import type { OfflineCapabilityPolicy } from '../domain/services/offline-capability-policy';

export const DEFAULT_SERVER_POLICY_CACHE_TTL_MS = 8 * 60 * 60 * 1_000;
export const MAX_SERVER_POLICY_CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

interface OfflineOperationsUseCaseOptions {
  readonly now?: () => Date;
  readonly ttlMs?: number;
}

export interface OfflineOperationsPolicyUseCases {
  load(scope: OfflineOperationsScope): Promise<OfflineOperationsPolicyState>;
  setMode(
    scope: OfflineOperationsScope,
    capabilityId: string,
    mode: OfflineOperationMode,
  ): Promise<OfflineOperationsPolicyState>;
  reset(scope: OfflineOperationsScope): Promise<OfflineOperationsPolicyState>;
}

export function createOfflineOperationsPolicyUseCases(
  repository: OfflineOperationsPolicyRepository,
  capabilityPolicy: OfflineCapabilityPolicy,
  options: OfflineOperationsUseCaseOptions = {},
): OfflineOperationsPolicyUseCases {
  const now = options.now ?? (() => new Date());
  const ttlMs = clampTtl(options.ttlMs ?? DEFAULT_SERVER_POLICY_CACHE_TTL_MS);

  const cacheRemote = async (
    scope: OfflineOperationsScope,
    remote: ServerOfflineOperationsPolicy,
    authority: Extract<OfflineOperationsPolicyState['authority'], 'server' | 'cache'> = 'server',
  ): Promise<OfflineOperationsPolicyState> => {
    const snapshot = createSnapshot(scope, remote, now(), ttlMs);
    try {
      await repository.writeCache(scope, snapshot);
    } catch {
      // A successful server response remains authoritative even if local caching fails.
    }
    return createReadyState(scope, snapshot, capabilityPolicy, authority);
  };

  const load = async (rawScope: OfflineOperationsScope): Promise<OfflineOperationsPolicyState> => {
    const scope = normalizeOfflineOperationsScope(rawScope);
    try {
      const remote = await repository.fetchRemote(scope);
      if (!isValidRemotePolicy(remote, scope, capabilityPolicy)) {
        return createFailClosedState(scope, 'invalid', capabilityPolicy);
      }
      return cacheRemote(scope, remote);
    } catch (error) {
      if (!(error instanceof OfflineOperationsRemoteUnavailableError)) {
        return createFailClosedState(scope, 'invalid', capabilityPolicy);
      }
    }

    let cached: unknown | null;
    try {
      cached = await repository.readCache(scope);
    } catch {
      return createFailClosedState(scope, 'invalid', capabilityPolicy);
    }
    if (cached === null) return createFailClosedState(scope, 'missing', capabilityPolicy);

    const parsed = parseCachedSnapshot(cached, scope, now().getTime(), capabilityPolicy);
    return parsed.status === 'ready'
      ? createReadyState(scope, parsed.snapshot, capabilityPolicy, 'cache')
      : createFailClosedState(scope, parsed.status, capabilityPolicy);
  };

  const setMode = async (
    rawScope: OfflineOperationsScope,
    capabilityId: string,
    mode: OfflineOperationMode,
  ): Promise<OfflineOperationsPolicyState> => {
    const scope = normalizeOfflineOperationsScope(rawScope);
    if (!capabilityPolicy.isSupportedMode(capabilityId, mode)) {
      throw new Error('This offline mode is not supported by the selected operation.');
    }

    const current = await repository.fetchRemote(scope);
    if (!isValidRemotePolicy(current, scope, capabilityPolicy)) {
      throw new Error('The server offline operations policy is incompatible with this app build.');
    }
    if (!serverSupportsMode(current, capabilityId, mode)) {
      throw new Error('This offline mode is not certified by the current server capability contract.');
    }

    const modes = { ...current.modes, [capabilityId]: mode };
    const updated = await repository.updateRemote(scope, modes, current.rowVersion);
    if (!isValidRemotePolicy(updated, scope, capabilityPolicy)) {
      throw new Error('The updated server offline operations policy is invalid for this app build.');
    }
    return cacheRemote(scope, updated);
  };

  const reset = async (rawScope: OfflineOperationsScope): Promise<OfflineOperationsPolicyState> => {
    const scope = normalizeOfflineOperationsScope(rawScope);
    const current = await repository.fetchRemote(scope);
    if (!isValidRemotePolicy(current, scope, capabilityPolicy)) {
      throw new Error('The server offline operations policy is incompatible with this app build.');
    }

    const updated = await repository.updateRemote(
      scope,
      createSafeInitialModes(current.capabilities),
      current.rowVersion,
    );
    if (!isValidRemotePolicy(updated, scope, capabilityPolicy)) {
      throw new Error('The reset server offline operations policy is invalid for this app build.');
    }
    return cacheRemote(scope, updated);
  };

  return { load, setMode, reset };
}

function createSafeInitialModes(
  serverCapabilities: readonly OfflineOperationsCapabilityDefinition[],
): Record<string, OfflineOperationMode> {
  return Object.fromEntries(
    serverCapabilities.map((definition) => [definition.id, 'online-only']),
  );
}

function createSnapshot(
  scope: OfflineOperationsScope,
  remote: ServerOfflineOperationsPolicy,
  fetchedAt: Date,
  ttlMs: number,
): ServerOfflineOperationsPolicySnapshot {
  return Object.freeze({
    version: SERVER_POLICY_CACHE_VERSION,
    kind: SERVER_POLICY_CACHE_KIND,
    scope: Object.freeze({ ...scope }),
    modes: Object.freeze({ ...remote.modes }),
    capabilities: Object.freeze(remote.capabilities.map((capability) => Object.freeze({
      id: capability.id,
      supportedModes: Object.freeze([...capability.supportedModes]),
    }))),
    rowVersion: remote.rowVersion,
    serverUpdatedOn: remote.updatedOn,
    fetchedAt: fetchedAt.toISOString(),
    validUntil: new Date(fetchedAt.getTime() + ttlMs).toISOString(),
  });
}

function createReadyState(
  scope: OfflineOperationsScope,
  snapshot: ServerOfflineOperationsPolicySnapshot,
  capabilityPolicy: OfflineCapabilityPolicy,
  authority: Extract<OfflineOperationsPolicyState['authority'], 'server' | 'cache'>,
): OfflineOperationsPolicyState {
  const resolved = Object.fromEntries(
    capabilityPolicy.definitions().map((definition) => [
      definition.id,
      capabilityPolicy.resolve(scope, definition.id, snapshot.modes),
    ]),
  );
  return Object.freeze({
    scope,
    status: 'ready',
    authority,
    snapshot,
    resolved: Object.freeze(resolved),
  });
}

function createFailClosedState(
  scope: OfflineOperationsScope,
  status: Exclude<OfflineOperationsSnapshotStatus, 'ready'>,
  capabilityPolicy: OfflineCapabilityPolicy,
): OfflineOperationsPolicyState {
  const resolved = Object.fromEntries(
    capabilityPolicy.definitions().map((definition) => [
      definition.id,
      failClosedResolution(scope, definition.id),
    ]),
  );
  return Object.freeze({
    scope,
    status,
    authority: 'fail-closed',
    snapshot: null,
    resolved: Object.freeze(resolved),
  });
}

function failClosedResolution(
  scope: OfflineOperationsScope,
  capabilityId: string,
): OfflineOperationsResolvedCapability {
  return Object.freeze({
    capabilityId,
    tenantId: scope.tenantId,
    companyId: scope.companyId,
    mode: 'online-only',
    source: 'fail-closed',
  });
}

function isValidRemotePolicy(
  remote: ServerOfflineOperationsPolicy,
  scope: OfflineOperationsScope,
  capabilityPolicy: OfflineCapabilityPolicy,
): boolean {
  if (remote.version !== SERVER_POLICY_CACHE_VERSION
    || remote.tenantId.trim() !== scope.tenantId
    || remote.companyId !== scope.companyId) {
    return false;
  }
  return hasSafeCapabilities(remote.capabilities, capabilityPolicy)
    && hasSafeModes(remote.modes, capabilityPolicy, remote.capabilities);
}

function parseCachedSnapshot(
  raw: unknown,
  expectedScope: OfflineOperationsScope,
  nowMs: number,
  capabilityPolicy: OfflineCapabilityPolicy,
):
  | { readonly status: 'ready'; readonly snapshot: ServerOfflineOperationsPolicySnapshot }
  | { readonly status: 'stale' | 'invalid' } {
  if (!isRecord(raw)
    || raw.version !== SERVER_POLICY_CACHE_VERSION
    || raw.kind !== SERVER_POLICY_CACHE_KIND
    || !isRecord(raw.scope)
    || !isRecord(raw.modes)
    || !Array.isArray(raw.capabilities)
    || (raw.rowVersion !== null && typeof raw.rowVersion !== 'string')
    || (raw.serverUpdatedOn !== null && typeof raw.serverUpdatedOn !== 'string')
    || typeof raw.fetchedAt !== 'string'
    || typeof raw.validUntil !== 'string') {
    return { status: 'invalid' };
  }

  let scope: OfflineOperationsScope;
  try {
    scope = normalizeOfflineOperationsScope({
      userId: typeof raw.scope.userId === 'string' ? raw.scope.userId : '',
      tenantId: typeof raw.scope.tenantId === 'string' ? raw.scope.tenantId : '',
      companyId: typeof raw.scope.companyId === 'number' ? raw.scope.companyId : 0,
    });
  } catch {
    return { status: 'invalid' };
  }
  if (!sameScope(scope, expectedScope)) return { status: 'invalid' };

  const fetchedAtMs = Date.parse(raw.fetchedAt);
  const validUntilMs = Date.parse(raw.validUntil);
  if (!Number.isFinite(fetchedAtMs)
    || !Number.isFinite(validUntilMs)
    || fetchedAtMs > nowMs
    || validUntilMs <= fetchedAtMs
    || validUntilMs - fetchedAtMs > MAX_SERVER_POLICY_CACHE_TTL_MS) {
    return { status: 'invalid' };
  }
  if (nowMs >= validUntilMs) return { status: 'stale' };

  const capabilities = parseCapabilities(raw.capabilities);
  if (!capabilities || !hasSafeCapabilities(capabilities, capabilityPolicy)) {
    return { status: 'invalid' };
  }
  const modes = Object.fromEntries(Object.entries(raw.modes)) as Record<string, OfflineOperationMode>;
  if (!hasSafeModes(modes, capabilityPolicy, capabilities)) return { status: 'invalid' };

  return {
    status: 'ready',
    snapshot: Object.freeze({
      version: SERVER_POLICY_CACHE_VERSION,
      kind: SERVER_POLICY_CACHE_KIND,
      scope: Object.freeze({ ...scope }),
      modes: Object.freeze(modes),
      capabilities: Object.freeze(capabilities),
      rowVersion: raw.rowVersion as string | null,
      serverUpdatedOn: raw.serverUpdatedOn as string | null,
      fetchedAt: raw.fetchedAt,
      validUntil: raw.validUntil,
    }),
  };
}

function hasSafeModes(
  modes: Readonly<Record<string, unknown>>,
  capabilityPolicy: OfflineCapabilityPolicy,
  serverCapabilities: readonly OfflineOperationsCapabilityDefinition[],
): modes is Readonly<Record<string, OfflineOperationMode>> {
  const definitions = capabilityPolicy.definitions();
  const serverCapabilityIds = new Set(serverCapabilities.map((definition) => definition.id));
  const actualModeIds = Object.keys(modes);
  if (actualModeIds.length !== serverCapabilityIds.size
    || actualModeIds.some((key) => !serverCapabilityIds.has(key))) {
    return false;
  }

  if (!serverCapabilities.every((capability) =>
    isOfflineOperationMode(modes[capability.id])
    && capability.supportedModes.includes(modes[capability.id] as OfflineOperationMode))) {
    return false;
  }

  return definitions.every((definition) =>
    capabilityPolicy.isSupportedMode(definition.id, modes[definition.id])
    && serverSupportsMode({ capabilities: serverCapabilities }, definition.id, modes[definition.id]));
}

function hasSafeCapabilities(
  capabilities: readonly OfflineOperationsCapabilityDefinition[],
  capabilityPolicy: OfflineCapabilityPolicy,
): boolean {
  const definitions = capabilityPolicy.definitions();
  const actual = new Set<string>();
  if (capabilities.some((capability) => {
    const id = capability.id.trim();
    if (!id || actual.has(id)) return true;
    actual.add(id);
    return false;
  })) {
    return false;
  }

  if (!definitions.every((definition) => actual.has(definition.id))) return false;

  return capabilities.every((capability) =>
    capability.supportedModes.length > 0
    && capability.supportedModes.includes('online-only')
    && new Set(capability.supportedModes).size === capability.supportedModes.length
    && capability.supportedModes.every(isOfflineOperationMode));
}

function serverSupportsMode(
  policy: Pick<ServerOfflineOperationsPolicy, 'capabilities'>,
  capabilityId: string,
  mode: unknown,
): mode is OfflineOperationMode {
  if (typeof mode !== 'string') return false;
  return Boolean(policy.capabilities
    .find((capability) => capability.id === capabilityId)
    ?.supportedModes.includes(mode as OfflineOperationMode));
}

function parseCapabilities(value: readonly unknown[]): readonly OfflineOperationsCapabilityDefinition[] | null {
  const result: OfflineOperationsCapabilityDefinition[] = [];
  for (const item of value) {
    if (!isRecord(item)
      || typeof item.id !== 'string'
      || item.id.trim().length === 0
      || !Array.isArray(item.supportedModes)) {
      return null;
    }
    const supportedModes = item.supportedModes.filter((mode): mode is OfflineOperationMode =>
      typeof mode === 'string');
    if (supportedModes.length !== item.supportedModes.length) return null;
    result.push(Object.freeze({
      id: item.id,
      supportedModes: Object.freeze(supportedModes),
    }));
  }
  return result;
}

function isOfflineOperationMode(value: unknown): value is OfflineOperationMode {
  return value === 'online-only'
    || value === 'offline-read'
    || value === 'offline-draft'
    || value === 'offline-command';
}

function sameScope(left: OfflineOperationsScope, right: OfflineOperationsScope): boolean {
  return left.userId === right.userId
    && left.tenantId === right.tenantId
    && left.companyId === right.companyId;
}

function clampTtl(ttlMs: number): number {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) return DEFAULT_SERVER_POLICY_CACHE_TTL_MS;
  return Math.min(Math.floor(ttlMs), MAX_SERVER_POLICY_CACHE_TTL_MS);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
