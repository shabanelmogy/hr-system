import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterOutlet, provideRouter, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { UnsavedChanges } from './unsaved-changes';
import { UnsavedNavigation, routeIdentity, unsavedNavigationGuard } from './unsaved-navigation';

@Component({ imports: [RouterOutlet], template: '<router-outlet />' }) class Frame {}
@Component({ template: '' }) class Editor {}

describe('Actual reused-route unsaved guard', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([
      { path: 'work', component: Frame, canDeactivate: [unsavedNavigationGuard], runGuardsAndResolvers: 'always', children: [{ path: ':record', component: Editor }] },
      { path: 'next', component: Editor }, { path: 'denied', component: Editor, canActivate: [() => false] },
    ], withRouterConfig({ canceledNavigationResolution: 'computed' }))] });
    const harness = await RouterTestingHarness.create('/work/1'); const router = TestBed.inject(Router);
    TestBed.inject(UnsavedNavigation); const drafts = TestBed.inject(UnsavedChanges); const invalidate = vi.fn();
    drafts.register({ read: () => ({ identity: 'A', revision: 1, active: true, unsaved: true, pending: false }), invalidate });
    return { harness, router, drafts, invalidate };
  }
  it('permits query/fragment while retaining the routed component, guards record and matrix replacement', async () => {
    const { router, drafts, harness } = await setup(); const element = harness.routeNativeElement;
    expect(await router.navigateByUrl('/work/1?search=one#section')).toBe(true); expect(drafts.prompt()).toBeNull(); expect(harness.routeNativeElement).toBe(element);
    const record = router.navigateByUrl('/work/2'); await vi.waitFor(() => expect(drafts.prompt()).not.toBeNull());
    drafts.answer(drafts.prompt()!, false); expect(await record).toBe(false); expect(router.url).toBe('/work/1?search=one#section');
    const matrix = router.navigateByUrl('/work/1;mode=edit'); await vi.waitFor(() => expect(drafts.prompt()).not.toBeNull());
    drafts.answer(drafts.prompt()!, true); expect(await matrix).toBe(true); expect(router.url).toBe('/work/1;mode=edit');
    expect(routeIdentity(router, '/work/1(right:detail/2)?q=x#part')).toContain('(right:detail/2)');
  });
  it('retains registration on a target denial after consent, and blocks departure while busy', async () => {
    const { router, drafts, invalidate } = await setup();
    const denied = router.navigateByUrl('/denied'); await vi.waitFor(() => expect(drafts.prompt()).not.toBeNull());
    drafts.answer(drafts.prompt()!, true); expect(await denied).toBe(false); expect(router.url).toBe('/work/1');
    expect(drafts.dirty()).toBe(true); expect(invalidate).not.toHaveBeenCalled();
    drafts.register({ read: () => ({ identity: 'busy', revision: 1, active: true, unsaved: false, pending: true }), invalidate: vi.fn() });
    expect(await router.navigateByUrl('/next')).toBe(false); expect(drafts.prompt()).toBeNull();
  });
  it('superseded navigation cannot consume the old consent or lose the current draft', async () => {
    const { router, drafts } = await setup(); const first = router.navigateByUrl('/next');
    await vi.waitFor(() => expect(drafts.prompt()).not.toBeNull()); const old = drafts.prompt()!;
    const second = router.navigateByUrl('/work/2'); await vi.waitFor(() => expect(drafts.prompt()?.token).not.toBe(old.token));
    expect(await first).toBe(false); drafts.answer(old, true); expect(router.url).toBe('/work/1');
    await vi.waitFor(() => expect(drafts.prompt()).not.toBeNull()); drafts.answer(drafts.prompt()!, false); expect(await second).toBe(false);
  });
});
