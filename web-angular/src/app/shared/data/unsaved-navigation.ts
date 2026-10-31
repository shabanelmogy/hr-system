import { DestroyRef, inject, Injectable } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, type CanDeactivateFn } from '@angular/router';
import { UnsavedChanges } from './unsaved-changes';

/** UrlTree retains matrix parameters, record segments and named outlets. */
export function routeIdentity(router: Router, url: string): string {
  const tree = router.parseUrl(url); tree.queryParams = {}; tree.fragment = null;
  return router.serializeUrl(tree);
}

@Injectable({ providedIn: 'root' })
export class UnsavedNavigation {
  private readonly router = inject(Router);
  private readonly drafts = inject(UnsavedChanges);
  constructor() {
    const subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) this.drafts.cancelNavigation();
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
  leave(current: string, next: string): boolean | Promise<boolean> {
    if (routeIdentity(this.router, current) === routeIdentity(this.router, next)) return true;
    const stamp = this.drafts.stamp();
    const decision = this.drafts.request('navigation:' + (this.router.currentNavigation()?.id ?? 0));
    return typeof decision === 'boolean' ? decision : decision.then(accepted => accepted && this.drafts.matches(stamp));
  }
}
export const unsavedNavigationGuard: CanDeactivateFn<unknown> = (_component, _route, current, next) =>
  inject(UnsavedNavigation).leave(current.url, next.url);
