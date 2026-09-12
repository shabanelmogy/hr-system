import {
  createOfflinePolicyOverrideSnapshot,
  getOfflineCapabilityDefinition,
  OFFLINE_CAPABILITY_DEFINITIONS,
  resolveOfflineCapability,
  type OfflineOperationMode as CoreOfflineOperationMode,
} from '@/src/core/offline-policy';

import type {
  OfflineOperationMode,
  OfflineOperationsCapabilityDefinition,
  OfflineOperationsResolvedCapability,
  OfflineOperationsScope,
} from '../domain/models/offline-operations-policy';
import type { OfflineCapabilityPolicy } from '../domain/services/offline-capability-policy';

const definitions = Object.freeze(
  Object.values(OFFLINE_CAPABILITY_DEFINITIONS).map<OfflineOperationsCapabilityDefinition>(
    (definition) => Object.freeze({
      id: definition.id,
      supportedModes: definition.supportedModes as readonly OfflineOperationMode[],
    }),
  ),
);

class CoreOfflineCapabilityPolicy implements OfflineCapabilityPolicy {
  definitions(): readonly OfflineOperationsCapabilityDefinition[] {
    return definitions;
  }

  getDefinition(capabilityId: string): OfflineOperationsCapabilityDefinition | undefined {
    const definition = getOfflineCapabilityDefinition(capabilityId);
    if (!definition) return undefined;
    return {
      id: definition.id,
      supportedModes: definition.supportedModes as readonly OfflineOperationMode[],
    };
  }

  isSupportedMode(capabilityId: string, mode: unknown): mode is OfflineOperationMode {
    if (typeof mode !== 'string') return false;
    const definition = getOfflineCapabilityDefinition(capabilityId);
    return Boolean(
      definition
      && definition.supportedModes.includes(mode as CoreOfflineOperationMode),
    );
  }

  resolve(
    scope: OfflineOperationsScope,
    capabilityId: string,
    modes: Readonly<Record<string, OfflineOperationMode>>,
  ): OfflineOperationsResolvedCapability {
    const overrideSnapshot = createOfflinePolicyOverrideSnapshot(
      { tenantId: scope.tenantId, companyId: scope.companyId },
      modes as Readonly<Record<string, CoreOfflineOperationMode>>,
    );
    return resolveOfflineCapability({
      capabilityId,
      tenantId: scope.tenantId,
      companyId: scope.companyId,
      overrideSnapshot,
    });
  }
}

export const coreOfflineCapabilityPolicy: OfflineCapabilityPolicy = new CoreOfflineCapabilityPolicy();
