export const offlineOperationModes = [
  "online-only",
  "offline-read",
  "offline-draft",
  "offline-command",
] as const;

export type OfflineOperationMode = (typeof offlineOperationModes)[number];

export interface OfflineOperationCapability {
  id: string;
  supportedModes: OfflineOperationMode[];
}

export interface OfflineOperationsPolicy {
  version: number;
  tenantId: string;
  companyId: number;
  modes: Record<string, OfflineOperationMode>;
  capabilities: OfflineOperationCapability[];
  rowVersion: string | null;
  updatedOn: string | null;
  updatedByUserId: string | null;
}

export interface UpdateOfflineOperationsPolicyRequest {
  modes: Record<string, OfflineOperationMode>;
  rowVersion: string | null;
}

export function offlineOperationsPolicyQueryKey(
  tenantId: string | null | undefined,
  companyId: number | null | undefined,
) {
  return ["offline-operations", "policy", tenantId ?? null, companyId ?? null] as const;
}

export const clientCapabilityCeiling = Object.freeze({
  "countries.read": Object.freeze(["online-only", "offline-read"] as const),
  "workforce-plan.update-draft": Object.freeze([
    "online-only",
    "offline-draft",
    "offline-command",
  ] as const),
});

export type KnownOfflineCapabilityId = keyof typeof clientCapabilityCeiling;

export function isKnownOfflineCapabilityId(id: string): id is KnownOfflineCapabilityId {
  return Object.prototype.hasOwnProperty.call(clientCapabilityCeiling, id);
}

export function isOfflineOperationMode(value: unknown): value is OfflineOperationMode {
  return typeof value === "string" && offlineOperationModes.includes(value as OfflineOperationMode);
}

export function getSafeSupportedModes(
  capability: OfflineOperationCapability,
): readonly OfflineOperationMode[] {
  if (!isKnownOfflineCapabilityId(capability.id)) return [];
  const clientModes = clientCapabilityCeiling[capability.id];
  return clientModes.filter((mode) => capability.supportedModes.includes(mode));
}

export function isCapabilityStateCompatible(
  capability: OfflineOperationCapability,
  currentMode: OfflineOperationMode | undefined,
): boolean {
  if (!isKnownOfflineCapabilityId(capability.id) || !currentMode) return false;
  return getSafeSupportedModes(capability).includes(currentMode);
}

export function isPolicySafeForEditing(policy: OfflineOperationsPolicy): boolean {
  const capabilityById = new Map(policy.capabilities.map((capability) => [capability.id, capability]));

  for (const capabilityId of Object.keys(clientCapabilityCeiling) as KnownOfflineCapabilityId[]) {
    const capability = capabilityById.get(capabilityId);
    if (!capability || !isCapabilityStateCompatible(capability, policy.modes[capabilityId])) {
      return false;
    }
  }

  return true;
}
