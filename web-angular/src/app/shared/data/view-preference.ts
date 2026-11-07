import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';

interface ViewPreferenceOptions<T extends string> {
  readonly storageKey: string;
  readonly defaultValue: T;
  readonly allowedValues: () => readonly T[];
  readonly canSynchronize?: () => boolean;
}

export function createViewPreference<T extends string>(options: ViewPreferenceOptions<T>) {
  if (!options.storageKey.trim()) throw Error('A view preference storage key is required.');
  const document = inject(DOCUMENT);
  const target = isPlatformBrowser(inject(PLATFORM_ID)) ? document.defaultView : null;
  const eventName = 'erp-angular:view:' + options.storageKey;
  const read = (): { readonly ok: boolean; readonly value: string | null } => {
    try {
      return target
        ? { ok: true, value: target.localStorage.getItem(options.storageKey) }
        : { ok: false, value: null };
    } catch {
      return { ok: false, value: null };
    }
  };
  const requested = signal(read().value);
  const allowed = (value: string | null): value is T =>
    value !== null && options.allowedValues().some((candidate) => candidate === value);
  const synchronize = () => {
    if (options.canSynchronize && !options.canSynchronize()) return;
    const stored = read();
    if (stored.ok) requested.set(stored.value);
  };
  if (target) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === options.storageKey) synchronize();
    };
    target.addEventListener('storage', onStorage);
    target.addEventListener(eventName, synchronize);
    inject(DestroyRef).onDestroy(() => {
      target.removeEventListener('storage', onStorage);
      target.removeEventListener(eventName, synchronize);
    });
  }
  return {
    value: computed(() => {
      const value = requested();
      return allowed(value) ? value : options.defaultValue;
    }),
    choose: (value: string): boolean => {
      if (!allowed(value)) return false;
      requested.set(value);
      if (target) {
        try {
          target.localStorage.setItem(options.storageKey, value);
          target.dispatchEvent(new Event(eventName));
        } catch {
          // Presentation persistence is optional; a valid in-memory choice still works.
        }
      }
      return true;
    },
  };
}
