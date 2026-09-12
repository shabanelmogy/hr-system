import type { OfflineCapabilityDefinition } from './types';

export const OFFLINE_CAPABILITY_IDS = Object.freeze({
  countriesRead: 'countries.read',
  workforcePlanUpdateDraft: 'workforce-plan.update-draft',
} as const);

const countriesRead = Object.freeze<OfflineCapabilityDefinition>({
  id: OFFLINE_CAPABILITY_IDS.countriesRead,
  supportedModes: Object.freeze(['online-only', 'offline-read'] as const),
  defaultMode: 'offline-read',
});

// Aggregate-level SQL Server rowVersion and the mobile reconciliation/replay path
// are both covered by focused tests. The tenant/company policy still defaults to
// online-only and must explicitly opt into local drafts or command replay.
const workforcePlanUpdateDraft = Object.freeze<OfflineCapabilityDefinition>({
  id: OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
  supportedModes: Object.freeze(['online-only', 'offline-draft', 'offline-command'] as const),
  defaultMode: 'online-only',
});

export const OFFLINE_CAPABILITY_DEFINITIONS = Object.freeze({
  [OFFLINE_CAPABILITY_IDS.countriesRead]: countriesRead,
  [OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft]: workforcePlanUpdateDraft,
} satisfies Readonly<Record<string, OfflineCapabilityDefinition>>);

export type KnownOfflineCapabilityId = keyof typeof OFFLINE_CAPABILITY_DEFINITIONS;

export function getOfflineCapabilityDefinition(
  capabilityId: string,
): OfflineCapabilityDefinition | undefined {
  return OFFLINE_CAPABILITY_DEFINITIONS[
    capabilityId as KnownOfflineCapabilityId
  ];
}
