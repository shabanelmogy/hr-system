import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, provideRouter } from '@angular/router';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { tenantCreateRouteGuard, tenantRouteGuard } from './tenant-route-guard';

describe('Tenant management retained role-only authority', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('accepts a current super administrator without fictitious grants and denies other actors', () => {
    const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
    const identity = signal<Session | null>(actor);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthSession, useValue: { readIdentity: identity } },
      ],
    });
    const router = TestBed.inject(Router);
    const run = () =>
      TestBed.runInInjectionContext(() =>
        tenantRouteGuard(new ActivatedRouteSnapshot(), router.routerState.snapshot),
      );
    expect(run()).toBe(true);
    identity.set({ ...actor, tenantReadOnly: true });
    expect(run()).toBe(true);
    identity.set({ ...actor, roles: ['tenant_admin'], permissions: ['Tenants:View'] });
    expect(run()).not.toBe(true);
    identity.set(null);
    expect(run()).not.toBe(true);
  });
  it('permits a direct create link only for a writable super administrator', () => {
    const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
    const identity = signal<Session | null>(actor);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthSession, useValue: { readIdentity: identity } },
      ],
    });
    const router = TestBed.inject(Router);
    const run = () =>
      TestBed.runInInjectionContext(() =>
        tenantCreateRouteGuard(new ActivatedRouteSnapshot(), router.routerState.snapshot),
      );
    expect(run()).toBe(true);
    identity.set({ ...actor, tenantReadOnly: true });
    expect(run()).toEqual(router.parseUrl('/super-admin/tenants'));
    identity.set({ ...actor, roles: ['tenant_admin'] });
    expect(run()).toEqual(router.parseUrl('/home'));
  });
});
