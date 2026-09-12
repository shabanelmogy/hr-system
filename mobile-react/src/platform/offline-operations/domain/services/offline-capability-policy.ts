import type {
  OfflineOperationMode,
  OfflineOperationsCapabilityDefinition,
  OfflineOperationsResolvedCapability,
  OfflineOperationsScope,
} from '../models/offline-operations-policy';

export interface OfflineCapabilityPolicy {
  definitions(): readonly OfflineOperationsCapabilityDefinition[];
  getDefinition(capabilityId: string): OfflineOperationsCapabilityDefinition | undefined;
  isSupportedMode(capabilityId: string, mode: unknown): mode is OfflineOperationMode;
  resolve(
    scope: OfflineOperationsScope,
    capabilityId: string,
    modes: Readonly<Record<string, OfflineOperationMode>>,
  ): OfflineOperationsResolvedCapability;
}
