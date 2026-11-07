import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import {
  TenantEntitlementCatalogService,
  type TenantEntitlementModule,
} from '../../../modules/entitlements.public-api';
import { TenantEntitlementsState } from './tenant-entitlements-state';

describe('Tenant assignable module lookup lifetime', () => {
  const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
  const module: TenantEntitlementModule = {
    code: 'accounting',
    name: 'Accounting',
    isDefault: true,
    submodules: [],
  };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const response = new Subject<readonly TenantEntitlementModule[]>();
    const lookup = vi.fn(() => response.asObservable());
    TestBed.configureTestingModule({
      providers: [
        TenantEntitlementsState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantEntitlementCatalogService, useValue: { lookup } },
      ],
    });
    const state = TestBed.inject(TenantEntitlementsState);
    TestBed.tick();
    return { state, identity, response, lookup };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('loads global assignable choices with the retained role and masks them on logout', () => {
    const { state, response, identity, lookup } = setup();
    expect(lookup).toHaveBeenCalledOnce();
    response.next([module]);
    expect(state.modules()).toEqual([module]);
    identity.set(null);
    expect(state.modules()).toEqual([]);
    expect(state.ready()).toBe(false);
  });
  it('never queries the catalog for a normal tenant administrator', () => {
    const { state, lookup } = setup({ ...actor, roles: ['tenant_admin'] });
    expect(state.view().kind).toBe('forbidden');
    expect(lookup).not.toHaveBeenCalled();
  });
  it('keeps an authoritative denial separate from a valid empty assignable catalog', () => {
    const first = setup();
    first.response.error(new HttpErrorResponse({ status: 403 }));
    expect(first.state.view().kind).toBe('forbidden');
    expect(first.state.modules()).toEqual([]);
    first.state.refresh();
    expect(first.lookup).toHaveBeenCalledOnce();
    TestBed.resetTestingModule();
    const second = setup();
    second.response.next([]);
    expect(second.state.view().kind).toBe('ready');
    expect(second.state.ready()).toBe(true);
    expect(second.state.modules()).toEqual([]);
  });
});
