import { computed, DestroyRef, inject, type Signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  defer,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  throwIfEmpty,
  type Observable,
} from 'rxjs';

export type ReadState<T> =
  { kind: 'loading' } | { kind: 'error' } | { kind: 'forbidden' } | { kind: 'ready'; data: T };
/** One validated body per read. Owners supply immutable identity, authorization,
 * service timeout and a separate optional live-hint subscription. */
export function createScopedRead<I extends object, T>(
  identity: Signal<I | null>,
  allowed: (identity: I) => boolean,
  load: (identity: I) => Observable<T>,
) {
  type Snapshot = { identity: I | null; state: ReadState<T>; pending: boolean; error?: unknown };
  const retries = new Subject<boolean>();
  inject(DestroyRef).onDestroy(() => retries.complete());
  const snapshot: Signal<Snapshot> = toSignal(
    toObservable(identity).pipe(
      switchMap((user) => {
        const loading: Snapshot = { identity: user, state: { kind: 'loading' }, pending: !!user };
        if (!user) return of(loading);
        if (!allowed(user))
          return of<Snapshot>({ identity: user, state: { kind: 'forbidden' }, pending: false });
        let ready: Snapshot | undefined;
        return retries.pipe(
          startWith(false),
          switchMap((background) =>
            defer(() => load(user)).pipe(
              take(1),
              throwIfEmpty(() => new Error('Scoped read completed without a snapshot')),
              map(
                (data) =>
                  (ready = { identity: user, state: { kind: 'ready', data }, pending: false }),
              ),
              catchError((error: unknown) =>
                of<Snapshot>({
                  identity: user,
                  error,
                  state: {
                    kind:
                      error instanceof HttpErrorResponse && error.status === 403
                        ? 'forbidden'
                        : 'error',
                  },
                  pending: false,
                }),
              ),
              startWith(background && ready ? { ...ready, pending: true } : loading),
            ),
          ),
        );
      }),
    ),
    { initialValue: { identity: null, state: { kind: 'loading' }, pending: false } },
  );
  const state = computed<ReadState<T>>(() => {
    const user = identity();
    if (user && !allowed(user)) return { kind: 'forbidden' };
    return user && snapshot().identity === user ? snapshot().state : { kind: 'loading' };
  });
  const pending = computed(() => {
    const user = identity();
    return !!user && allowed(user) && (snapshot().identity !== user || snapshot().pending);
  });
  const dispatch = (background = false) => {
    const user = identity();
    if (user && snapshot().identity === user && allowed(user) && state().kind !== 'forbidden')
      retries.next(background);
  };
  return {
    state,
    pending,
    error: computed<unknown>(() =>
      identity() && snapshot().identity === identity() ? snapshot().error : undefined,
    ),
    retry: () => {
      if (!pending() && state().kind === 'error') dispatch();
    },
    refresh: () => {
      if (!pending() && (state().kind === 'ready' || state().kind === 'error')) dispatch();
    },
    refreshInBackground: () => {
      if (!pending() && (state().kind === 'ready' || state().kind === 'error'))
        dispatch(state().kind === 'ready');
    },
    invalidate: () => dispatch(),
  };
}
