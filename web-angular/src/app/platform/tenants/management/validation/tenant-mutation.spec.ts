import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createTenantForm,
  emptyTenantDraft,
  parseTenantMutation,
  tenantDraftKey,
  tenantFieldError,
  tenantSavedEntitlements,
} from './tenant-mutation';

const catalog = [
  {
    code: 'hr',
    name: 'HR',
    isDefault: true,
    submodules: [
      { code: 'basic-data', name: 'Basic data', requiredPermissions: [], entryPath: null },
    ],
  },
] as const;

describe('Tenant mutation validation', () => {
  it('shares the supported calendar range and rejects year zero and rolled dates', () => {
    expect(tenantFieldError('subscriptionStartedOn', '0000-01-01')).not.toBeNull();
    expect(tenantFieldError('subscriptionEndsOn', '2026-02-30')).not.toBeNull();
    expect(tenantFieldError('subscriptionStartedOn', '0001-01-01')).toBeNull();
  });
  it('normalizes optional values and creates UTC boundary transport dates', () => {
    expect(
      parseTenantMutation(
        {
          ...emptyTenantDraft,
          identifier: ' acme-1 ',
          name: ' Acme ',
          subscriptionStartedOn: '2026-01-01',
          subscriptionEndsOn: '2026-01-31',
          maxAdmins: ' 002 ',
          maxUsers: ' 10 ',
          billingEmail: ' ',
          entitlements: [{ moduleCode: 'hr', submoduleCodes: ['basic-data'] }],
        },
        catalog,
      ),
    ).toMatchObject({
      identifier: 'acme-1',
      name: 'Acme',
      subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
      subscriptionEndsOn: '2026-01-31T23:59:59.000Z',
      maxAdmins: 2,
      maxUsers: 10,
      billingEmail: null,
    });
  });

  it('rejects server-invalid seat ranges, dates, and catalog-incompatible entitlements', () => {
    expect(tenantFieldError('identifier', 'bad value')).not.toBeNull();
    expect(() =>
      parseTenantMutation(
        {
          ...emptyTenantDraft,
          identifier: 'acme',
          name: 'Acme',
          subscriptionStartedOn: '2026-02-01',
          subscriptionEndsOn: '2026-01-01',
          maxAdmins: '4',
          maxUsers: '3',
          entitlements: [{ moduleCode: 'unknown', submoduleCodes: [] }],
        },
        catalog,
      ),
    ).toThrow();
  });

  it('retains an explicit empty grant set but rejects saved codes absent from the catalog', () => {
    expect(tenantSavedEntitlements([], catalog)).toEqual([]);
    expect(() =>
      tenantSavedEntitlements([{ moduleCode: 'legacy', submoduleCodes: [] }], catalog),
    ).toThrow();
    expect(tenantDraftKey({ ...emptyTenantDraft, name: ' Acme ' })).toBe(
      tenantDraftKey({ ...emptyTenantDraft, name: 'Acme' }),
    );
  });

  it('keeps draft identity stable across seat whitespace and grant ordering without mutating grants', () => {
    const ordered = {
      ...emptyTenantDraft,
      maxAdmins: ' 002 ',
      maxUsers: ' 010 ',
      entitlements: [
        { moduleCode: ' HR ', submoduleCodes: ['Reports', 'Basic-Data'] },
        { moduleCode: 'Finance', submoduleCodes: ['Ledger'] },
      ],
    };
    const reordered = {
      ...emptyTenantDraft,
      maxAdmins: '002',
      maxUsers: '010',
      entitlements: [
        { moduleCode: 'finance', submoduleCodes: ['ledger'] },
        { moduleCode: 'hr', submoduleCodes: ['basic-data', 'reports'] },
      ],
    };
    const originalEntitlements = structuredClone(ordered.entitlements);

    expect(tenantFieldError('maxAdmins', ' 002 ')).toBeNull();
    expect(
      parseTenantMutation(
        {
          ...emptyTenantDraft,
          identifier: 'acme',
          name: 'Acme',
          subscriptionStartedOn: '2026-01-01',
          subscriptionEndsOn: '2026-01-31',
          maxAdmins: ' 002 ',
          maxUsers: ' 010 ',
        },
        catalog,
      ).maxAdmins,
    ).toBe(2);
    expect(tenantDraftKey(ordered)).toBe(tenantDraftKey(reordered));
    expect(ordered.entitlements).toEqual(originalEntitlements);
  });

  it('keeps the Signal Form actionable while surfacing cross-field errors', () => {
    const form = TestBed.runInInjectionContext(() => createTenantForm(() => catalog));
    form().value.set({
      ...emptyTenantDraft,
      identifier: 'acme',
      name: 'Acme',
      subscriptionStartedOn: '2026-02-01',
      subscriptionEndsOn: '2026-01-01',
      maxAdmins: '4',
      maxUsers: '3',
    });
    expect(form().disabled()).toBe(false);
    expect(form.subscriptionEndsOn().getError('dateOrder')).toBeDefined();
    expect(form.maxUsers().getError('seatRange')).toBeDefined();
  });

  it('revalidates catalog compatibility and current usage without reconstructing the form', () => {
    const dynamicCatalog = signal<readonly (typeof catalog)[number][]>([]);
    const usage = signal({ currentAdminCount: 1, currentUserCount: 5 });
    const form = TestBed.runInInjectionContext(() =>
      createTenantForm(
        () => dynamicCatalog(),
        {},
        () => usage(),
      ),
    );
    form().value.set({
      ...emptyTenantDraft,
      identifier: 'acme',
      name: 'Acme',
      subscriptionStartedOn: '2026-01-01',
      subscriptionEndsOn: '2026-01-31',
      maxAdmins: '1',
      maxUsers: '3',
      entitlements: [{ moduleCode: 'hr', submoduleCodes: ['basic-data'] }],
    });
    expect(form.entitlements().getError('catalogCompatibility')).toBeDefined();
    expect(form.maxUsers().getError('usageLimit')).toBeDefined();
    dynamicCatalog.set(catalog);
    usage.set({ currentAdminCount: 1, currentUserCount: 3 });
    expect(form.entitlements().getError('catalogCompatibility')).toBeUndefined();
    expect(form.maxUsers().getError('usageLimit')).toBeUndefined();
  });
});
