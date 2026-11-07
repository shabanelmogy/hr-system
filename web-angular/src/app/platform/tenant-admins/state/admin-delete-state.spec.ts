import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { CommandFailure } from '../../../shared/data/public-api';
import { AdminDeleteState } from './admin-delete-state';
import { AdminReadState } from './admin-read-state';
import { TenantAdminService } from '../services/tenant-admin-service';
import { adminFixture } from '../tenant-admin.fixture';
describe('Tenant administrator explicit delete/archive', () => {
  afterEach(() => TestBed.resetTestingModule());
  function setup() {
    const identity = signal({ ...sessionFixture, roles: ['super_admin'], permissions: [] });
    const result = new Subject<void>(),
      archive = vi.fn(() => result.asObservable()),
      refresh = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        AdminDeleteState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantAdminService, useValue: { archive } },
        {
          provide: AdminReadState,
          useValue: { view: () => ({ kind: 'ready', data: [adminFixture] }), refresh },
        },
      ],
    });
    const state = TestBed.inject(AdminDeleteState);
    return { state, identity, result, archive, refresh };
  }
  it('requires confirmation, bars duplicate dispatch and refreshes only after accepted204', async () => {
    const { state, archive, result, refresh } = setup();
    state.request(adminFixture);
    expect(archive).not.toHaveBeenCalled();
    const command = state.confirm();
    void state.confirm();
    expect(archive).toHaveBeenCalledOnce();
    state.close();
    expect(state.active()).toBe(true);
    result.next();
    await command;
    expect(refresh).toHaveBeenCalledOnce();
    expect(state.active()).toBe(false);
  });
  it('locks uncertain replay and ignores read-only direct callbacks', async () => {
    const { state, archive, result, identity } = setup();
    identity.update((actor) => ({ ...actor, tenantReadOnly: true }));
    state.request(adminFixture);
    expect(state.active()).toBe(false);
    identity.update((actor) => ({ ...actor, tenantReadOnly: false }));
    state.request(adminFixture);
    const command = state.confirm();
    result.error(new CommandFailure('uncertain', 503));
    await command;
    expect(state.uncertain()).toBe(true);
    await state.confirm();
    expect(archive).toHaveBeenCalledOnce();
  });
});
