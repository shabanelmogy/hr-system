import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createViewPreference } from './view-preference';

describe('Allowlisted presentation view preference', () => {
  const storageKey = 'erp-angular:views:fixture';
  type View = 'grid' | 'cards' | 'report';
  const eventName = 'erp-angular:view:' + storageKey;
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });
  function setup() {
    const allowed = signal<readonly View[]>(['grid', 'cards', 'report']);
    const safe = signal(true);
    const create = () =>
      TestBed.runInInjectionContext(() =>
        createViewPreference<View>({
          storageKey,
          defaultValue: 'grid',
          allowedValues: allowed,
          canSynchronize: safe,
        }),
      );
    return { preference: create(), create, allowed, safe };
  }
  it('restores only an allowed string and persists explicit choices across fresh owners', () => {
    localStorage.setItem(storageKey, 'cards');
    const { preference, create } = setup();
    expect(preference.value()).toBe('cards');
    expect(preference.choose('report')).toBe(true);
    expect(localStorage.getItem(storageKey)).toBe('report');
    expect(create().value()).toBe('report');
    expect(preference.choose('unknown')).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe('report');
  });
  it('falls back safely when a stored view or a newly unavailable view is not permitted', () => {
    localStorage.setItem(storageKey, '<script>not-a-view</script>');
    const { preference, allowed } = setup();
    expect(preference.value()).toBe('grid');
    preference.choose('report');
    allowed.set(['grid', 'cards']);
    expect(preference.value()).toBe('grid');
    expect(preference.choose('report')).toBe(false);
  });
  it('keeps an in-memory choice when browser storage reads or writes fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const { preference } = setup();
    expect(preference.value()).toBe('grid');
    expect(preference.choose('cards')).toBe(true);
    expect(preference.value()).toBe('cards');
  });
  it('synchronizes same-key owners and storage events without bypassing a pending or dirty owner', () => {
    const { preference, create, safe } = setup();
    const other = create();
    preference.choose('cards');
    expect(other.value()).toBe('cards');
    safe.set(false);
    localStorage.setItem(storageKey, 'report');
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
    expect(preference.value()).toBe('cards');
    safe.set(true);
    window.dispatchEvent(new StorageEvent('storage', { key: 'different-key' }));
    expect(preference.value()).toBe('cards');
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
    expect(preference.value()).toBe('report');
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
    expect(preference.value()).toBe('grid');
  });
  it('removes synchronization listeners when the owning injector is destroyed', () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const preference = runInInjectionContext(injector, () =>
      createViewPreference({
        storageKey,
        defaultValue: 'grid',
        allowedValues: () => ['grid', 'cards'] as const,
      }),
    );
    preference.choose('cards');
    injector.destroy();
    localStorage.setItem(storageKey, 'grid');
    window.dispatchEvent(new Event(eventName));
    expect(preference.value()).toBe('cards');
  });
  it('does not touch browser storage on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(isPlatformBrowser(TestBed.inject(PLATFORM_ID))).toBe(false);
    expect(TestBed.inject(DOCUMENT)).toBeDefined();
    const read = vi.spyOn(Storage.prototype, 'getItem');
    const { preference } = setup();
    expect(preference.value()).toBe('grid');
    expect(preference.choose('cards')).toBe(true);
    expect(preference.value()).toBe('cards');
    expect(read).not.toHaveBeenCalled();
  });
});
