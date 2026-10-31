import { computed, DestroyRef, inject, type Signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, defer, map, of, startWith, Subject, switchMap, take, throwIfEmpty, type Observable } from 'rxjs';

export type ReadState<T> = { kind: 'loading' } | { kind: 'error' } | { kind: 'forbidden' } | { kind: 'ready'; data: T };
/** One validated body per read. Owners supply immutable identity, authorization,
 * service timeout and a separate optional live-hint subscription. */
export function createScopedRead<I extends object,T>(identity: Signal<I|null>, allowed: (identity:I)=>boolean, load:(identity:I)=>Observable<T>) {
  type Snapshot = { identity:I|null; state:ReadState<T> };
  const retries=new Subject<void>();
  inject(DestroyRef).onDestroy(()=>retries.complete());
  const snapshot=toSignal(toObservable(identity).pipe(switchMap(user=>{
    const loading:Snapshot={identity:user,state:{kind:'loading'}};
    if(!user)return of(loading);
    if(!allowed(user))return of<Snapshot>({identity:user,state:{kind:'forbidden'}});
    return retries.pipe(startWith(undefined),switchMap(()=>defer(()=>load(user)).pipe(
      take(1),throwIfEmpty(()=>new Error('Scoped read completed without a snapshot')),
      map(data=>({identity:user,state:{kind:'ready',data}} satisfies Snapshot)),
      catchError((error:unknown)=>of<Snapshot>({identity:user,state:{kind:error instanceof HttpErrorResponse&&error.status===403?'forbidden':'error'}})),
      startWith(loading),
    )));
  })),{initialValue:{identity:null,state:{kind:'loading'}} as Snapshot});
  const state=computed<ReadState<T>>(()=>{
    const user=identity();if(user&&!allowed(user))return {kind:'forbidden'};
    return user&&snapshot().identity===user?snapshot().state:{kind:'loading'};
  });
  const dispatch=()=>{const user=identity();if(user&&snapshot().identity===user&&allowed(user)&&state().kind!=='forbidden')retries.next();};
  return {state,retry:()=>{if(state().kind==='error')dispatch();},
    refresh:()=>{if(state().kind==='ready'||state().kind==='error')dispatch();},
    invalidate:dispatch};
}
