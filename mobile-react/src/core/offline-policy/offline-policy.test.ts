import {
  OFFLINE_CAPABILITY_DEFINITIONS,
  OFFLINE_CAPABILITY_IDS,
  canExecuteOfflineCommand,
  canReadOffline,
  canSaveDraft,
  createOfflinePolicyOverrideSnapshot,
  resolveOfflineCapability,
} from './index';

const scope = { tenantId: 'tenant-a', companyId: 7 } as const;

describe('offline operations policy', () => {
  it('seeds only the proven capabilities with fail-closed defaults', () => {
    expect(Object.keys(OFFLINE_CAPABILITY_DEFINITIONS)).toEqual([
      OFFLINE_CAPABILITY_IDS.countriesRead,
      OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
    ]);

    expect(OFFLINE_CAPABILITY_DEFINITIONS[OFFLINE_CAPABILITY_IDS.countriesRead]).toEqual({
      id: 'countries.read',
      supportedModes: ['online-only', 'offline-read'],
      defaultMode: 'offline-read',
    });
    expect(OFFLINE_CAPABILITY_DEFINITIONS[OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft]).toEqual({
      id: 'workforce-plan.update-draft',
      supportedModes: ['online-only', 'offline-draft', 'offline-command'],
      defaultMode: 'online-only',
    });
  });

  it('resolves an unknown or invalidly scoped capability online-only', () => {
    expect(resolveOfflineCapability({ ...scope, capabilityId: 'unknown.write' })).toMatchObject({
      mode: 'online-only',
      source: 'fail-closed',
    });
    expect(resolveOfflineCapability({ tenantId: '', companyId: 7, capabilityId: 'countries.read' }))
      .toMatchObject({ mode: 'online-only', source: 'fail-closed' });
  });

  it('applies only an override from the same tenant and company', () => {
    const sameScope = createOfflinePolicyOverrideSnapshot(scope, {
      [OFFLINE_CAPABILITY_IDS.countriesRead]: 'online-only',
    });
    const otherCompany = createOfflinePolicyOverrideSnapshot({ ...scope, companyId: 8 }, {
      [OFFLINE_CAPABILITY_IDS.countriesRead]: 'online-only',
    });

    expect(resolveOfflineCapability({
      ...scope,
      capabilityId: OFFLINE_CAPABILITY_IDS.countriesRead,
      overrideSnapshot: sameScope,
    })).toMatchObject({ mode: 'online-only', source: 'override' });
    expect(resolveOfflineCapability({
      ...scope,
      capabilityId: OFFLINE_CAPABILITY_IDS.countriesRead,
      overrideSnapshot: otherCompany,
    })).toMatchObject({ mode: 'online-only', source: 'fail-closed' });
  });

  it('never enables a configured mode that the capability does not support', () => {
    const snapshot = createOfflinePolicyOverrideSnapshot(scope, {
      [OFFLINE_CAPABILITY_IDS.countriesRead]: 'offline-command',
      [OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft]: 'offline-read',
    });

    expect(resolveOfflineCapability({
      ...scope,
      capabilityId: OFFLINE_CAPABILITY_IDS.countriesRead,
      overrideSnapshot: snapshot,
    })).toMatchObject({ mode: 'online-only', source: 'fail-closed' });
    expect(resolveOfflineCapability({
      ...scope,
      capabilityId: OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
      overrideSnapshot: snapshot,
    })).toMatchObject({ mode: 'online-only', source: 'fail-closed' });
  });

  it('allows only the certified workforce draft and row-versioned command modes', () => {
    for (const mode of ['offline-draft', 'offline-command'] as const) {
      const snapshot = createOfflinePolicyOverrideSnapshot(scope, {
        [OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft]: mode,
      });

      expect(resolveOfflineCapability({
        ...scope,
        capabilityId: OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft,
        overrideSnapshot: snapshot,
      })).toMatchObject({ mode, source: 'override' });
    }
  });

  it('exposes capability helpers with monotonic offline privileges', () => {
    const resolved = (mode: 'online-only' | 'offline-read' | 'offline-draft' | 'offline-command') => ({ mode });

    expect([canReadOffline(resolved('online-only')), canSaveDraft(resolved('online-only')), canExecuteOfflineCommand(resolved('online-only'))])
      .toEqual([false, false, false]);
    expect([canReadOffline(resolved('offline-read')), canSaveDraft(resolved('offline-read')), canExecuteOfflineCommand(resolved('offline-read'))])
      .toEqual([true, false, false]);
    expect([canReadOffline(resolved('offline-draft')), canSaveDraft(resolved('offline-draft')), canExecuteOfflineCommand(resolved('offline-draft'))])
      .toEqual([true, true, false]);
    expect([canReadOffline(resolved('offline-command')), canSaveDraft(resolved('offline-command')), canExecuteOfflineCommand(resolved('offline-command'))])
      .toEqual([true, true, true]);
  });

  it('creates immutable definition and override snapshots', () => {
    const definition = OFFLINE_CAPABILITY_DEFINITIONS[OFFLINE_CAPABILITY_IDS.countriesRead];
    const snapshot = createOfflinePolicyOverrideSnapshot(scope, {
      [OFFLINE_CAPABILITY_IDS.countriesRead]: 'offline-read',
    });

    expect(Object.isFrozen(OFFLINE_CAPABILITY_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(definition)).toBe(true);
    expect(Object.isFrozen(definition.supportedModes)).toBe(true);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.modes)).toBe(true);
  });
});
