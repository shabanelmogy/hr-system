import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  provideRouter,
  type RouterStateSnapshot,
  type UrlTree,
} from '@angular/router';
import { AuthSession, type Session } from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { districtRouteGuard } from './district-route-guard';

describe('Districts canonical route authority', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Districts:View'],
  };
  afterEach(() => TestBed.resetTestingModule());
  it('permits only the current global role and exact View grant', () => {
    const identity = signal<Session | null>(actor);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthSession, useValue: { readIdentity: identity } },
      ],
    });
    const route = new ActivatedRouteSnapshot();
    const snapshot: RouterStateSnapshot = TestBed.inject(Router).routerState.snapshot;
    const run = () => TestBed.runInInjectionContext(() => districtRouteGuard(route, snapshot));
    expect(run()).toBe(true);
    for (const denied of [
      null,
      { ...actor, roles: ['tenant_admin'] },
      { ...actor, permissions: ['Districts:Create'] },
    ]) {
      identity.set(denied);
      const redirect = run() as UrlTree;
      expect(TestBed.inject(Router).serializeUrl(redirect)).toBe('/home');
    }
  });
});
