import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { LocalizationRuntime } from '../../localization/public-api';
import { CommandFailure } from '../../../shared/data/public-api';
import { AdminEditorState } from './admin-editor-state';
import { AdminReadState } from './admin-read-state';
import { AdminTenantChoices } from './admin-tenant-choices';
import { TenantAdminService } from '../services/tenant-admin-service';
import { adminFixture } from '../tenant-admin.fixture';
import type { TenantAdmin } from '../types/tenant-admin';
import type { AdminMutation } from '../validation/tenant-admin-mutation';
describe('Tenant administrator command lifetime', () => {
  const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial),
      detail = new Subject<TenantAdmin>(),
      command = new Subject<TenantAdmin>();
    const service = {
      detail: vi.fn((_id: string) => detail.asObservable()),
      create: vi.fn((_payload: AdminMutation) => command.asObservable()),
      update: vi.fn((_id: string, _payload: AdminMutation) => command.asObservable()),
    };
    const refresh = vi.fn();
    const tenants = [
      { id: 't', identifier: 'alpha', name: 'Alpha', isActive: true, lifecycleStatus: 'active' },
    ];
    TestBed.configureTestingModule({
      providers: [
        AdminEditorState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantAdminService, useValue: service },
        { provide: LocalizationRuntime, useValue: { translate: (key: string) => key } },
        { provide: AdminReadState, useValue: { view: () => ({ kind: 'ready' }), refresh } },
        { provide: AdminTenantChoices, useValue: { ready: () => true, tenants: () => tenants } },
      ],
    });
    const state = TestBed.inject(AdminEditorState);
    TestBed.tick();
    return { state, identity, service, detail, command, refresh };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('prefills a known tenant for scoped creation and rejects an unknown tenant', () => {
    const { state, service } = setup();
    state.create('unknown');
    expect(state.active()).toBe(false);
    state.create('t');
    expect(state.form.tenantIds().value()).toEqual(['t']);
    expect(state.form.defaultTenantId().value()).toBe('t');
    expect(state.unsaved()).toBe(false);
    expect(service.create).not.toHaveBeenCalled();
  });
  const fill = (state: AdminEditorState) =>
    state.form().value.set({
      firstName: 'Ali',
      lastName: 'Hassan',
      userName: 'ali',
      email: 'ali@example.test',
      password: 'Example123',
      tenantIds: ['t'],
      defaultTenantId: 't',
      isDisabled: false,
    });
  it('blocks read-only entry and sends only one valid create before completion', async () => {
    const readonly = setup({ ...actor, tenantReadOnly: true });
    readonly.state.create();
    expect(readonly.state.active()).toBe(false);
    TestBed.resetTestingModule();
    const { state, service, command } = setup();
    state.create();
    await state.save();
    expect(service.create).not.toHaveBeenCalled();
    fill(state);
    const saving = state.save();
    void state.save();
    expect(service.create).toHaveBeenCalledOnce();
    command.next(adminFixture);
    await saving;
    expect(state.active()).toBe(false);
  });
  it('loads fresh edit details, omits blank password and repairs a removed default explicitly', async () => {
    const { state, detail, service, command } = setup();
    state.edit(adminFixture.id);
    detail.next(adminFixture);
    expect(state.form.password().value()).toBe('');
    state.membershipsChanged([]);
    expect(state.form.defaultTenantId().value()).toBe('');
    state.membershipsChanged(['t']);
    expect(state.form.defaultTenantId().value()).toBe('t');
    const saving = state.save();
    expect(service.update).toHaveBeenCalledOnce();
    expect(service.update.mock.calls[0]?.[0]).toBe(adminFixture.id);
    expect(service.update.mock.calls[0]?.[1]).not.toHaveProperty('password');
    command.next(adminFixture);
    await saving;
  });
  it('maps known duplicate Identity feedback and locks uncertain replay', async () => {
    const first = setup();
    first.state.create();
    fill(first.state);
    const save = first.state.save();
    first.command.error(new CommandFailure('rejected', 409, {}, ['TenantAdmin.DuplicateEmail']));
    await save;
    expect(first.state.form.email().getError('server')?.message).toBe(
      'tenantAdmins.errors.duplicateEmail',
    );
    expect(first.state.active()).toBe(true);
    TestBed.resetTestingModule();
    const next = setup();
    next.state.create();
    fill(next.state);
    const pending = next.state.save();
    next.command.error(new CommandFailure('uncertain', 503));
    await pending;
    expect(next.state.uncertain()).toBe(true);
    await next.state.save();
    expect(next.service.create).toHaveBeenCalledOnce();
  });
  it('cancels fresh detail and discards command acceptance when actor changes', async () => {
    const { state, identity, detail } = setup();
    state.edit(adminFixture.id);
    identity.set(null);
    TestBed.tick();
    expect(detail.observed).toBe(false);
    detail.next(adminFixture);
    expect(state.active()).toBe(false);
  });
});
