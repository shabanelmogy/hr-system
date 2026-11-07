import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type CanActivateFn, type Route } from '@angular/router';
import { AuthSession, type Session } from '../../platform/auth/session.public-api';
import { sessionFixture } from '../../platform/auth/auth.fixture';
import { authenticatedRoutes } from './authenticated-routes';

function findRoute(path: string, routes: readonly Route[] = authenticatedRoutes): Route {
  for (const route of routes) {
    if (route.path === path) return route;
    if (route.children) {
      try {
        return findRoute(path, route.children);
      } catch {
        // Continue searching other branches of the actual application route tree.
      }
    }
  }
  throw new Error('Route not registered: ' + path);
}

describe('Super Admin system-text route authority', () => {
  it('retains the existing Next system-text deep link without introducing a second editor', () => {
    const route = findRoute('super-admin/ui-texts');
    expect(route.redirectTo).toBe('/administration/language-translation');
    expect(route.pathMatch).toBe('full');
  });

  it('rejects direct navigation by a non-Super-Admin even when the text permission is present', () => {
    const actor = signal<Session | null>({
      ...sessionFixture,
      roles: ['tenant_admin'],
      permissions: ['SystemUiTexts:View'],
    });
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSession, useValue: { readIdentity: actor } }],
    });
    const router = TestBed.inject(Router);
    const guard = findRoute('administration/language-translation').canActivate?.[0];
    if (typeof guard !== 'function') throw new Error('Expected a functional route guard');
    const check = () =>
      TestBed.runInInjectionContext(() =>
        (guard as CanActivateFn)(router.routerState.snapshot.root, router.routerState.snapshot),
      );
    expect(check()).not.toBe(true);
    actor.set({ ...sessionFixture, roles: ['super_admin'], permissions: ['SystemUiTexts:View'] });
    expect(check()).toBe(true);
    actor.set({ ...sessionFixture, roles: ['super_admin'], permissions: [] });
    expect(check()).not.toBe(true);
    actor.set(null);
    expect(check()).not.toBe(true);
  });
});
