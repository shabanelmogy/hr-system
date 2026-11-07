import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import { LocalizationRuntime } from '../../../localization/public-api';
import { CommandFailure } from '../../../../shared/data/public-api';
import { TenantManagementService } from '../services/tenant-management-service';
import { tenantFixture } from '../tenant.fixture';
import type { TenantRecord } from '../types/tenant';
import { TenantReadState } from './tenant-read-state';
import { TenantEntitlementsState } from './tenant-entitlements-state';
import { TenantEditorState } from './tenant-editor-state';

describe('Tenant create/edit command lifetime', () => {
  const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
  const module = { code: 'hr', name: 'HR', isDefault: true, submodules: [] };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const detail = new Subject<TenantRecord>();
    const command = new Subject<TenantRecord>();
    const refresh = vi.fn();
    const service = {
      detail: vi.fn(() => detail.asObservable()),
      create: vi.fn(() => command.asObservable()),
      update: vi.fn(() => command.asObservable()),
    };
    const catalog = signal({ kind: 'ready' as const, data: [module] });
    const catalogPending = signal(false);
    const refreshCatalog = vi.fn(() => catalogPending.set(true));
    TestBed.configureTestingModule({
      providers: [
        TenantEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LocalizationRuntime, useValue: { translate: (key: string) => key } },
        { provide: TenantManagementService, useValue: service },
        {
          provide: TenantReadState,
          useValue: { source: () => ({ kind: 'ready' }), refresh },
        },
        {
          provide: TenantEntitlementsState,
          useValue: {
            modules: () => catalog().data,
            ready: computed(() => !catalogPending()),
            pending: catalogPending,
            view: catalog,
            refresh: refreshCatalog,
          },
        },
      ],
    });
    const state = TestBed.inject(TenantEditorState);
    TestBed.tick();
    return {
      state,
      identity,
      detail,
      command,
      service,
      refresh,
      catalog,
      catalogPending,
      refreshCatalog,
    };
  }
  function fill(state: TenantEditorState) {
    state.form().value.update((draft) => ({
      ...draft,
      identifier: 'alpha',
      name: 'Alpha Trading',
      subscriptionEndsOn: '2027-12-31',
    }));
  }
  afterEach(() => TestBed.resetTestingModule());

  it('requires the retained global role and rejects read-only commands', () => {
    const { state, service } = setup({ ...actor, tenantReadOnly: true });
    state.create();
    state.edit(tenantFixture.id);
    expect(state.active()).toBe(false);
    expect(service.detail).not.toHaveBeenCalled();
  });
  it('uses the source create defaults and validates before dispatching once', async () => {
    const { state, service, command } = setup();
    state.create();
    expect(state.form().value()).toMatchObject({
      planName: 'Free',
      maxAdmins: '1',
      maxUsers: '5',
      subscriptionStatus: 'free',
      entitlements: [{ moduleCode: 'hr', submoduleCodes: [] }],
    });
    expect(state.form.subscriptionStartedOn().value()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await state.save();
    expect(service.create).not.toHaveBeenCalled();
    fill(state);
    const saved = vi.fn(() => expect(state.active()).toBe(false));
    state.saved.subscribe(saved);
    const saving = state.save();
    void state.save();
    expect(service.create).toHaveBeenCalledOnce();
    command.next(tenantFixture);
    await saving;
    expect(saved).toHaveBeenCalledOnce();
    expect(state.active()).toBe(false);
  });
  it('loads fresh detail and sends its real rowVersion while retaining an explicit empty grant set', async () => {
    const { state, service, detail, command } = setup();
    state.edit(tenantFixture.id);
    expect(state.phase()).toBe('loading');
    await state.save();
    expect(service.update).not.toHaveBeenCalled();
    detail.next(tenantFixture);
    expect(state.form().value().entitlements).toEqual([]);
    expect(state.unsaved()).toBe(false);
    const saving = state.save();
    expect(service.update).toHaveBeenCalledWith(
      tenantFixture.id,
      expect.any(Object),
      tenantFixture.rowVersion,
    );
    command.next({ ...tenantFixture, rowVersion: 'new-version' });
    await saving;
  });
  it('preserves the draft and blocks replay after a real concurrency conflict', async () => {
    const { state, detail, command, service } = setup();
    state.edit(tenantFixture.id);
    detail.next(tenantFixture);
    state.form.name().value.set('Unsaved edited name');
    const saving = state.save();
    command.error(new CommandFailure('rejected', 409, {}, ['Tenant.ConcurrencyConflict']));
    await saving;
    expect(state.conflict()).toBe(true);
    expect(state.form.name().value()).toBe('Unsaved edited name');
    await state.save();
    expect(service.update).toHaveBeenCalledOnce();
  });
  it('maps duplicate identifier beneath its field and respects explicit field feedback', async () => {
    const { state, command } = setup();
    state.create();
    fill(state);
    const saving = state.save();
    command.error(
      new CommandFailure('rejected', 409, { identifier: 'Choose another identifier' }, [
        'Tenant.DuplicateIdentifier',
      ]),
    );
    await saving;
    expect(state.form.identifier().getError('server')?.message).toBe('Choose another identifier');
    expect(state.active()).toBe(true);
  });
  it('locks uncertain results and reconciles only after explicit close', async () => {
    const { state, command, service, refresh } = setup();
    state.create();
    fill(state);
    const saving = state.save();
    command.error(new CommandFailure('uncertain', 503));
    await saving;
    expect(state.uncertain()).toBe(true);
    await state.save();
    expect(service.create).toHaveBeenCalledOnce();
    state.close({ identity: state.identity(), revision: state.revision(), token: 1 });
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('cancels detail effects and command acceptance after actor replacement', async () => {
    const { state, identity, detail, command } = setup();
    state.edit(tenantFixture.id);
    identity.set(null);
    TestBed.tick();
    expect(detail.observed).toBe(false);
    detail.next(tenantFixture);
    expect(state.active()).toBe(false);
    identity.set({ ...actor });
    TestBed.tick();
    state.create();
    fill(state);
    const saved = vi.fn();
    state.saved.subscribe(saved);
    const saving = state.save();
    identity.set(null);
    TestBed.tick();
    command.next(tenantFixture);
    await saving;
    expect(saved).not.toHaveBeenCalled();
  });
  it('rejects archived detail and catalog-incompatible saved grants without silently removing them', () => {
    const first = setup();
    first.state.edit(tenantFixture.id);
    first.detail.next({ ...tenantFixture, lifecycleStatus: 'archived' });
    expect(first.state.phase()).toBe('error');
    TestBed.resetTestingModule();
    const second = setup();
    second.state.edit(tenantFixture.id);
    second.detail.next({
      ...tenantFixture,
      entitlements: [{ moduleCode: 'unavailable', submoduleCodes: [] }],
    });
    expect(second.state.phase()).toBe('catalog-error');
    expect(second.service.update).not.toHaveBeenCalled();
  });
  it('keeps the editor forbidden after an authoritative detail denial instead of offering a retry', () => {
    const { state, detail, service } = setup();
    state.edit(tenantFixture.id);
    detail.error(new HttpErrorResponse({ status: 403 }));
    expect(state.phase()).toBe('forbidden');
    void state.retry();
    expect(service.detail).toHaveBeenCalledOnce();
  });
  it('waits for the refreshed catalog before retrying incompatible saved entitlements', async () => {
    const { state, detail, service, catalog, catalogPending, refreshCatalog } = setup();
    const saved = {
      ...tenantFixture,
      entitlements: [{ moduleCode: 'new-module', submoduleCodes: [] }],
    };
    state.edit(saved.id);
    detail.next(saved);
    expect(state.phase()).toBe('catalog-error');
    const retrying = state.retry();
    expect(refreshCatalog).toHaveBeenCalledOnce();
    expect(service.detail).toHaveBeenCalledOnce();
    TestBed.tick();
    catalog.set({ kind: 'ready', data: [{ ...module, code: 'new-module' }] });
    catalogPending.set(false);
    TestBed.tick();
    await retrying;
    expect(service.detail).toHaveBeenCalledTimes(2);
    detail.next(saved);
    expect(state.phase()).toBe('ready');
    expect(
      state
        .form()
        .value()
        .entitlements.map(({ moduleCode, submoduleCodes }) => ({ moduleCode, submoduleCodes })),
    ).toEqual(saved.entitlements);
  });
});
