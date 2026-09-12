import { OFFLINE_CAPABILITY_IDS } from '@/src/core/offline-policy';

import { coreOfflineCapabilityPolicy } from './core-offline-capability-policy';

describe('coreOfflineCapabilityPolicy', () => {
  it('uses the code-owned supportedModes without allowing the feature to expand them', () => {
    expect(coreOfflineCapabilityPolicy.isSupportedMode(
      OFFLINE_CAPABILITY_IDS.countriesRead,
      'offline-read',
    )).toBe(true);
    expect(coreOfflineCapabilityPolicy.isSupportedMode(
      OFFLINE_CAPABILITY_IDS.countriesRead,
      'offline-command',
    )).toBe(false);
    expect(coreOfflineCapabilityPolicy.isSupportedMode(
      OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
      'offline-draft',
    )).toBe(true);
    expect(coreOfflineCapabilityPolicy.isSupportedMode(
      OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
      'offline-command',
    )).toBe(true);
    expect(coreOfflineCapabilityPolicy.isSupportedMode(
      OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
      'offline-read',
    )).toBe(false);
  });
});
