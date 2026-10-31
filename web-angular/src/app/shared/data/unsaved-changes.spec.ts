import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UnsavedChanges, type DraftState } from './unsaved-changes';

describe('Registered unsaved draft consent', () => {
  let drafts: UnsavedChanges;
  const initial: DraftState = { identity: 'A', revision: 1, active: true, unsaved: true, pending: false };
  beforeEach(() => { TestBed.configureTestingModule({}); drafts = TestBed.inject(UnsavedChanges); });
  it('permits clean state, blocks clean busy work and never resets on consent', async () => {
    const state = signal({ ...initial, unsaved: false }); const invalidate = vi.fn();
    drafts.register({ read: state, invalidate }); expect(drafts.request('route')).toBe(true);
    state.update(value => ({ ...value, pending: true })); expect(drafts.request('route')).toBe(false);
    state.set(initial); const request = drafts.request('route'); drafts.answer(drafts.prompt()!, true);
    expect(await request).toBe(true); expect(invalidate).not.toHaveBeenCalled(); expect(drafts.dirty()).toBe(true);
  });
  it('joins same destination and refuses a competing destination, cancellation retains data', async () => {
    drafts.register({ read: () => initial, invalidate: vi.fn() });
    const first = drafts.request('company:2'); expect(drafts.request('company:2')).toBe(first);
    expect(drafts.request('logout')).toBe(false); drafts.answer(drafts.prompt()!, false);
    expect(await first).toBe(false); expect(drafts.dirty()).toBe(true);
  });
  it('reads current plain getters before a queued confirmation, including before rendering', async () => {
    let state = initial; drafts.register({ read: () => state, invalidate: vi.fn() });
    const first = drafts.request('route'); const old = drafts.prompt()!;
    state = { ...state, revision: 2 }; drafts.answer(old, true); expect(await first).toBe(false);
    const next = drafts.request('route'); const current = drafts.prompt()!;
    drafts.answer(old, true); expect(drafts.prompt()).toBe(current); drafts.answer(current, true); expect(await next).toBe(true);
  });
  it.each([{ pending: true }, { revision: 2 }, { identity: 'B' }, { active: false }, { unsaved: false }])('cancels reactive participant replacement %o', async replacement => {
    const state = signal(initial); drafts.register({ read: state, invalidate: vi.fn() }); TestBed.tick();
    const request = drafts.request('route'); state.update(value => ({ ...value, ...replacement })); TestBed.tick();
    expect(await request).toBe(false); expect(drafts.prompt()).toBeNull();
  });
  it('old cleanup cannot release another registration and cleanup invalidates consent', async () => {
    const first = drafts.register({ read: () => initial, invalidate: vi.fn() }); first();
    const invalidate = vi.fn(); drafts.register({ read: () => initial, invalidate }); first();
    const request = drafts.request('navigation:1'); drafts.invalidate(); expect(await request).toBe(false);
    expect(invalidate).toHaveBeenCalledOnce(); expect(drafts.requiresDecision()).toBe(false);
  });
  it('navigation supersession cancels only navigation; failed owner getters fail closed', async () => {
    const release = drafts.register({ read: () => initial, invalidate: vi.fn() });
    const context = drafts.request('company:2'); drafts.cancelNavigation(); expect(drafts.prompt()).not.toBeNull();
    drafts.cancel(); expect(await context).toBe(false); release();
    drafts.register({ read: () => { throw Error('Unavailable owner'); }, invalidate: vi.fn() });
    expect(drafts.request('navigation:2')).toBe(false);
  });
});
