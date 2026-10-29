import { computed, type Signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, Subject, switchMap, type Observable } from 'rxjs';

export type ReadState<T> = { kind: 'loading' } | { kind: 'error' } | { kind: 'forbidden' } | { kind: 'ready'; data: T };
/** Component-scoped read; identity and authorization remain caller-owned. */
export function createScopedRead<I extends object,T>(identity: Signal<I|null>, allowed: (identity:I)=>boolean, load:()=>Observable<T>) {
  type Snapshot = { identity:I|null; state:ReadState<T> };
  const retries=new Subject<void>();
  const snapshot=toSignal(toObservable(identity).pipe(switchMap(user=>{
    const loading:Snapshot={identity:user,state:{kind:'loading'}};
    if(!user)return of(loading);
    if(!allowed(user))return of<Snapshot>({identity:user,state:{kind:'forbidden'}});
    return retries.pipe(startWith(undefined),switchMap(()=>load().pipe(
      map(data=>({identity:user,state:{kind:'ready',data}} satisfies Snapshot)),
      catchError((error:unknown)=>of<Snapshot>({identity:user,state:{kind:error instanceof HttpErrorResponse&&error.status===403?'forbidden':'error'}})),
      startWith(loading),
    )));
  })),{initialValue:{identity:null,state:{kind:'loading'}} as Snapshot});
  const state=computed<ReadState<T>>(()=>{
    const user=identity();if(user&&!allowed(user))return {kind:'forbidden'};
    return user&&snapshot().identity===user?snapshot().state:{kind:'loading'};
  });
  return {state,retry:()=>{if(state().kind==='error')retries.next();}};
}
