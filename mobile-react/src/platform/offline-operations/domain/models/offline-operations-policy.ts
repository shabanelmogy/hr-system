export const SERVER_POLICY_CACHE_VERSION = 1 as const;
export const SERVER_POLICY_CACHE_KIND = 'server-policy-cache' as const;

export type OfflineOperationMode =
  | 'online-only'
  | 'offline-read'
  | 'offline-draft'
  | 'offline-command';

export interface OfflineOperationsScope {
  readonly userId: string;
  readonly tenantId: string;
  readonly companyId: number;
}

export interface OfflineOperationsCapabilityDefinition {
  readonly id: string;
  readonly supportedModes: readonly OfflineOperationMode[];
}

export interface OfflineOperationsResolvedCapability {
  readonly capabilityId: string;
  readonly tenantId: string;
  readonly companyId: number;
  readonly mode: OfflineOperationMode;
  readonly source: 'default' | 'override' | 'fail-closed';
}

export interface ServerOfflineOperationsPolicy {
  readonly version: number;
  readonly tenantId: string;
  readonly companyId: number;
  readonly modes: Readonly<Record<string, OfflineOperationMode>>;
  readonly capabilities: readonly OfflineOperationsCapabilityDefinition[];
  readonly rowVersion: string | null;
  readonly updatedOn: string | null;
  readonly updatedByUserId: string | null;
}

export interface ServerOfflineOperationsPolicySnapshot {
  readonly version: typeof SERVER_POLICY_CACHE_VERSION;
  readonly kind: typeof SERVER_POLICY_CACHE_KIND;
  readonly scope: OfflineOperationsScope;
  readonly modes: Readonly<Record<string, OfflineOperationMode>>;
  readonly capabilities: readonly OfflineOperationsCapabilityDefinition[];
  readonly rowVersion: string | null;
  readonly serverUpdatedOn: string | null;
  readonly fetchedAt: string;
  readonly validUntil: string;
}

export type OfflineOperationsSnapshotStatus = 'ready' | 'missing' | 'stale' | 'invalid';

export interface OfflineOperationsPolicyState {
  readonly scope: OfflineOperationsScope;
  readonly status: OfflineOperationsSnapshotStatus;
  readonly authority: 'server' | 'cache' | 'fail-closed';
  readonly snapshot: ServerOfflineOperationsPolicySnapshot | null;
  readonly resolved: Readonly<Record<string, OfflineOperationsResolvedCapability>>;
}

export class OfflineOperationsPolicyConflictError extends Error {
  constructor(message = 'The offline operations policy changed on the server. Reload and try again.') {
    super(message);
    this.name = 'OfflineOperationsPolicyConflictError';
  }
}

export class OfflineOperationsRemoteUnavailableError extends Error {
  constructor(message = 'The offline operations policy service is temporarily unavailable.') {
    super(message);
    this.name = 'OfflineOperationsRemoteUnavailableError';
  }
}

export function normalizeOfflineOperationsScope(
  scope: OfflineOperationsScope,
): OfflineOperationsScope {
  const userId = scope.userId.trim();
  const tenantId = scope.tenantId.trim();
  if (!userId) throw new Error('Offline operations scope requires a user id.');
  if (!tenantId) throw new Error('Offline operations scope requires a tenant id.');
  if (!Number.isInteger(scope.companyId) || scope.companyId <= 0) {
    throw new Error('Offline operations scope requires a positive integer company id.');
  }
  return { userId, tenantId, companyId: scope.companyId };
}
