import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import { CommandFailure } from '../../../../shared/data/public-api';
import { FeedbackNotifications, type CollectionSource } from '../../../../shared/ui/public-api';
import { TenantManagementService } from '../services/tenant-management-service';
import { tenantFixture } from '../tenant.fixture';
import type { TenantRecord } from '../types/tenant';
import { tenantRowActions } from '../presentation/tenant-list-presentation';
import { TenantReadState } from './tenant-read-state';
import { TenantAccessState } from './tenant-access-state';

describe('Tenant access actions', () => {
  const actor: Session = { ...sessionFixture, roles: ['super_admin'], tenantReadOnly: false };
  function setup(row = tenantFixture, initial: Session | null = actor) {
    const identity = signal(initial);
    const detail = new Subject<TenantRecord>();
    const command = new Subject<TenantRecord>();
    const query = { scopeKey: 'tenants:actor', criteriaKey: 'page2', pageIndex: 1, pageSize: 10 };
    const source = signal<CollectionSource<TenantRecord>>({
      query,
      kind: 'ready',
      result: { query, rows: [row], total: 11, hasNextPage: false },
    });
    const service = {
      detail: vi.fn(() => detail.asObservable()),
      update: vi.fn(() => command.asObservable()),
    };
    const refresh = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        TenantAccessState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantManagementService, useValue: service },
        { provide: TenantReadState, useValue: { source, refresh } },
      ],
    });
    const state = TestBed.inject(TenantAccessState);
    TestBed.tick();
    return {
      state,
      identity,
      detail,
      command,
      service,
      refresh,
      source,
      notices: TestBed.inject(FeedbackNotifications),
    };
  }
  afterEach(() => TestBed.resetTestingModule());

  it('offers the explicit target for enabled and disabled rows, sharing the same action contract', () => {
    for (const enabled of [true, false]) {
      expect(tenantRowActions(true, enabled, (key) => key, true, false)).toEqual([
        { id: 'edit', label: 'actions.edit', icon: 'edit', disabled: false },
        {
          id: enabled ? 'deactivate' : 'activate',
          label: 'tenantManagement.' + (enabled ? 'deactivate' : 'activate'),
          icon: enabled ? 'lock' : 'check',
          tone: enabled ? 'warning' : 'success',
          disabled: false,
        },
      ]);
    }
    expect(tenantRowActions(false, true, (key) => key, false, false)).toEqual([]);
    expect(
      tenantRowActions(true, true, (key) => key, true, true).every((action) => action.disabled),
    ).toBe(true);
  });
  it('cancels confirmation without reading or writing', () => {
    const { state, service } = setup();
    state.request(tenantFixture);
    expect(state.active()).toBe(true);
    expect(state.enabling()).toBe(false);
    state.close();
    expect(state.active()).toBe(false);
    expect(service.detail).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });
  it.each([true, false])(
    'changes access from %s with fresh fields, exact timestamps and rowVersion',
    async (enabled) => {
      const row = { ...tenantFixture, isActive: enabled };
      const { state, service, detail, command, refresh, notices } = setup(row);
      const fresh = {
        ...row,
        name: 'Latest name',
        rowVersion: 'fresh',
        subscriptionStartedOn: '2026-01-01T12:34:56.123Z',
        subscriptionEndsOn: null,
        entitlements: [{ moduleCode: 'hr', submoduleCodes: ['basic-data'] }],
        notes: 'Preserve me',
      };
      state.request(row);
      const saving = state.confirm();
      void state.confirm();
      state.close();
      expect(state.active()).toBe(true);
      expect(service.detail).toHaveBeenCalledExactlyOnceWith(row.id);
      detail.next(fresh);
      await Promise.resolve();
      expect(service.update).toHaveBeenCalledExactlyOnceWith(
        row.id,
        {
          identifier: fresh.identifier,
          name: fresh.name,
          isActive: !enabled,
          subscriptionStatus: fresh.subscriptionStatus,
          subscriptionStartedOn: fresh.subscriptionStartedOn,
          subscriptionEndsOn: null,
          planName: fresh.planName,
          maxAdmins: fresh.maxAdmins,
          maxUsers: fresh.maxUsers,
          billingEmail: fresh.billingEmail,
          contactName: fresh.contactName,
          contactPhone: fresh.contactPhone,
          notes: fresh.notes,
          entitlements: null,
        },
        'fresh',
      );
      command.next({ ...fresh, isActive: !enabled, rowVersion: 'saved' });
      await saving;
      expect(state.active()).toBe(false);
      expect(notices.toasts()).toContainEqual(
        expect.objectContaining({
          key: enabled ? 'tenantManagement.accessDisabled' : 'tenantManagement.accessEnabled',
          namespace: 'platform-tenants',
        }),
      );
      expect(refresh).toHaveBeenCalledOnce();
    },
  );
  it('preserves inherited null entitlements and avoids replay when the target is already applied', async () => {
    const { state, service, detail, command } = setup();
    state.request(tenantFixture);
    const saving = state.confirm();
    detail.next({ ...tenantFixture, entitlements: null });
    await Promise.resolve();
    expect(service.update).toHaveBeenCalledWith(
      tenantFixture.id,
      expect.objectContaining({ entitlements: null }),
      tenantFixture.rowVersion,
    );
    command.next({ ...tenantFixture, isActive: false });
    await saving;
    state.request(tenantFixture);
    service.detail.mockReturnValue(of({ ...tenantFixture, isActive: false }));
    await state.confirm();
    expect(service.update).toHaveBeenCalledOnce();
  });
  it.each([null, { ...actor, roles: ['admin'] }, { ...actor, tenantReadOnly: true }])(
    'rejects non-writable actors',
    async (identity) => {
      const { state, service } = setup(tenantFixture, identity);
      state.request(tenantFixture);
      await state.confirm();
      expect(state.active()).toBe(false);
      expect(service.detail).not.toHaveBeenCalled();
    },
  );
  it('rejects foreign/stale rows and archived records', () => {
    const { state, service } = setup();
    state.request({ ...tenantFixture, id: 'foreign' });
    state.request({ ...tenantFixture, rowVersion: 'stale' });
    state.request({ ...tenantFixture, isActive: false });
    expect(state.active()).toBe(false);
    expect(service.detail).not.toHaveBeenCalled();
  });
  it('does not update an archived fresh detail', async () => {
    const { state, service, detail } = setup();
    state.request(tenantFixture);
    const saving = state.confirm();
    detail.next({ ...tenantFixture, lifecycleStatus: 'archived' });
    await saving;
    expect(state.blocked()).toBe(true);
    expect(state.feedback()).toBe('tenantManagement.archivedRequiresRestore');
    expect(service.update).not.toHaveBeenCalled();
  });
  it('cancels a pending detail on actor replacement and suppresses late writes', async () => {
    const { state, identity, detail, service, refresh } = setup();
    state.request(tenantFixture);
    const saving = state.confirm();
    identity.set({ ...actor, userId: 'other' });
    TestBed.tick();
    detail.next(tenantFixture);
    await saving;
    expect(state.active()).toBe(false);
    expect(service.update).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
  it('permits retry after a read failure without classifying a write as uncertain', async () => {
    const { state, detail, service } = setup();
    state.request(tenantFixture);
    const saving = state.confirm();
    detail.error(new HttpErrorResponse({ status: 503 }));
    await saving;
    expect(state.blocked()).toBe(false);
    expect(state.feedback()).toBe('tenantManagement.accessError');
    expect(service.update).not.toHaveBeenCalled();
  });
  it.each([
    { failure: new CommandFailure('uncertain', null), key: 'tenantManagement.mutationUncertain' },
    {
      failure: new CommandFailure('rejected', 409, {}, ['Tenant.ConcurrencyConflict']),
      key: 'tenantManagement.concurrencyConflict',
    },
    { failure: new CommandFailure('rejected', 403), key: 'authorization.forbidden.title' },
  ])('blocks replay and refreshes after closing $key', async ({ failure, key }) => {
    const { state, detail, command, service, refresh } = setup();
    state.request(tenantFixture);
    const saving = state.confirm();
    detail.next(tenantFixture);
    await Promise.resolve();
    command.error(failure);
    await saving;
    expect(state.feedback()).toBe(key);
    expect(state.blocked()).toBe(true);
    await state.confirm();
    expect(service.update).toHaveBeenCalledOnce();
    state.close();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
