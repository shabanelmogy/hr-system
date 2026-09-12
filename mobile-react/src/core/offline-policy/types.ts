export const OFFLINE_OPERATION_MODES = [
  'online-only',
  'offline-read',
  'offline-draft',
  'offline-command',
] as const;

export type OfflineOperationMode = (typeof OFFLINE_OPERATION_MODES)[number];

export interface OfflineCapabilityDefinition {
  readonly id: string;
  readonly supportedModes: readonly OfflineOperationMode[];
  readonly defaultMode: OfflineOperationMode;
}

export interface OfflinePolicyScope {
  readonly tenantId: string;
  readonly companyId: number;
}

export interface OfflinePolicyOverrideSnapshot extends OfflinePolicyScope {
  readonly modes: Readonly<Record<string, OfflineOperationMode>>;
}

export interface ResolveOfflineCapabilityRequest extends OfflinePolicyScope {
  readonly capabilityId: string;
  readonly overrideSnapshot?: OfflinePolicyOverrideSnapshot | null;
}

export interface ResolvedOfflineCapability extends OfflinePolicyScope {
  readonly capabilityId: string;
  readonly mode: OfflineOperationMode;
  readonly source: 'default' | 'override' | 'fail-closed';
}
