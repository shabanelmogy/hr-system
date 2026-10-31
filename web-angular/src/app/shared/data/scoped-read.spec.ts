import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createScopedRead } from './scoped-read';
describe('Shared scoped read lifetime',()=>{
  it('refreshes a ready read explicitly and deduplicates while loading without bypassing denial',()=>{
    const identity=signal<{allowed:boolean}|null>({allowed:true}),responses:Subject<number>[]=[],load=vi.fn(()=>{const response=new Subject<number>();responses.push(response);return response;});
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,u=>u.allowed,load));TestBed.tick();
    read.refresh();expect(load).toHaveBeenCalledTimes(1);responses[0].next(1);read.refresh();expect(read.state()).toEqual({kind:'loading'});
    read.refresh();expect(load).toHaveBeenCalledTimes(2);responses[1].next(2);expect(read.state()).toEqual({kind:'ready',data:2});
    identity.set({allowed:false});read.refresh();TestBed.tick();expect(load).toHaveBeenCalledTimes(2);
  });
  it('deduplicates consumers, synchronously masks identity replacement and cancels on destruction',()=>{
    const identity=signal<{id:string}|null>({id:'one'}),teardown=vi.fn(),requests:Subject<number>[]=[];
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,()=>true,()=>new Observable<number>(subscriber=>{const response=new Subject<number>();requests.push(response);const subscription=response.subscribe(subscriber);return()=>{subscription.unsubscribe();teardown();};})));
    TestBed.tick();read.state();read.state();read.retry();expect(requests).toHaveLength(1);requests[0].next(42);expect(read.state()).toEqual({kind:'ready',data:42});
    identity.set({id:'two'});expect(read.state()).toEqual({kind:'loading'});TestBed.tick();expect(teardown).toHaveBeenCalledTimes(1);expect(requests).toHaveLength(2);
    TestBed.resetTestingModule();expect(teardown).toHaveBeenCalledTimes(2);
  });
  it('does not subscribe for an unauthorized identity and can retry a finite failed read',()=>{
    const identity=signal<{allowed:boolean}|null>({allowed:false}),response=new Subject<number>(),load=vi.fn(()=>response);
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,u=>u.allowed,load));TestBed.tick();expect(read.state()).toEqual({kind:'forbidden'});expect(load).not.toHaveBeenCalled();
    identity.set({allowed:true});TestBed.tick();response.error(new Error('Synthetic failure'));expect(read.state()).toEqual({kind:'error'});read.retry();expect(load).toHaveBeenCalledTimes(2);
  });
  it('passes captured identity and closes after the first complete body, not as a watcher',()=>{
    const user={id:'one'},identity=signal<typeof user|null>(user),response=new Subject<number>(),teardown=vi.fn(),load=vi.fn((captured:typeof user)=>new Observable<number>(subscriber=>{expect(captured).toBe(user);const subscription=response.subscribe(subscriber);return()=>{subscription.unsubscribe();teardown();};}));
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,()=>true,load));TestBed.tick();response.next(1);expect(read.state()).toEqual({kind:'ready',data:1});expect(teardown).toHaveBeenCalledOnce();expect(response.observed).toBe(false);response.next(2);expect(read.state()).toEqual({kind:'ready',data:1});
  });
  it.each([0,false,null,''])('retains first literal data %j without truthy filtering',value=>{
    const read=TestBed.runInInjectionContext(()=>createScopedRead(signal<object|null>({}),()=>true,()=>of(value)));TestBed.tick();expect(read.state()).toEqual({kind:'ready',data:value});
  });
  it('contains a synchronous factory failure and can retry without killing identity observation',()=>{
    const identity=signal<{id:string}|null>({id:'one'}),load=vi.fn().mockImplementationOnce(()=>{throw new Error('Factory fixture');}).mockImplementation(()=>of(7));
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,()=>true,load));TestBed.tick();expect(read.state()).toEqual({kind:'error'});read.retry();expect(read.state()).toEqual({kind:'ready',data:7});identity.set({id:'two'});expect(read.state()).toEqual({kind:'loading'});TestBed.tick();expect(load).toHaveBeenCalledTimes(3);expect(read.state()).toEqual({kind:'ready',data:7});
  });
  it('turns empty completion into retryable error rather than permanent loading',()=>{
    let empty=true;const read=TestBed.runInInjectionContext(()=>createScopedRead(signal<object|null>({}),()=>true,()=>empty?EMPTY:of(8)));TestBed.tick();expect(read.state()).toEqual({kind:'error'});empty=false;read.retry();expect(read.state()).toEqual({kind:'ready',data:8});
  });
  it('maps authoritative403 to forbidden and cannot bypass it with refresh/retry/hints',()=>{
    const identity=signal<{id:string}|null>({id:'one'}),load=vi.fn(()=>throwError(()=>new HttpErrorResponse({status:403})));
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,()=>true,load));TestBed.tick();expect(read.state()).toEqual({kind:'forbidden'});read.retry();read.refresh();read.invalidate();expect(load).toHaveBeenCalledOnce();identity.set({id:'two'});TestBed.tick();expect(load).toHaveBeenCalledTimes(2);
  });
  it('coalesces manual refresh during loading but a live invalidation cancels that snapshot',()=>{
    const requests:Subject<number>[]=[],teardown=vi.fn(),load=vi.fn(()=>new Observable<number>(subscriber=>{const source=new Subject<number>();requests.push(source);const subscription=source.subscribe(subscriber);return()=>{subscription.unsubscribe();teardown();};}));
    const read=TestBed.runInInjectionContext(()=>createScopedRead(signal<object|null>({}),()=>true,load));TestBed.tick();read.refresh();expect(load).toHaveBeenCalledOnce();read.invalidate();expect(load).toHaveBeenCalledTimes(2);expect(teardown).toHaveBeenCalledTimes(1);requests[0].next(99);expect(read.state()).toEqual({kind:'loading'});requests[1].next(2);expect(read.state()).toEqual({kind:'ready',data:2});expect(teardown).toHaveBeenCalledTimes(2);
  });
  it('does not dispatch an old subscription when identity changes before its effect',()=>{
    const identity=signal<{id:string}|null>({id:'one'}),responses:Subject<string>[]=[],load=vi.fn((captured:{id:string})=>{const response=new Subject<string>();responses.push(response);expect(captured).toBe(identity());return response;});
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,()=>true,load));TestBed.tick();identity.set({id:'two'});read.invalidate();read.refresh();expect(load).toHaveBeenCalledOnce();expect(read.state()).toEqual({kind:'loading'});responses[0].next('old');expect(read.state()).toEqual({kind:'loading'});TestBed.tick();expect(load).toHaveBeenCalledTimes(2);responses[1].next('new');expect(read.state()).toEqual({kind:'ready',data:'new'});
  });
  it('synchronously quarantines permission/null identity and suppresses every dispatch until replacement',()=>{
    const identity=signal<{allowed:boolean}|null>({allowed:true}),responses:Subject<number>[]=[],load=vi.fn(()=>{const response=new Subject<number>();responses.push(response);return response;});
    const read=TestBed.runInInjectionContext(()=>createScopedRead(identity,u=>u.allowed,load));TestBed.tick();identity.set({allowed:false});expect(read.state()).toEqual({kind:'forbidden'});read.invalidate();read.refresh();read.retry();responses[0].next(1);expect(read.state()).toEqual({kind:'forbidden'});TestBed.tick();expect(responses[0].observed).toBe(false);identity.set(null);read.invalidate();TestBed.tick();expect(load).toHaveBeenCalledOnce();expect(read.state()).toEqual({kind:'loading'});
  });
  it('owns a separate live subscription outside finite bootstrap and tears down both on destruction',()=>{
    const hints=new Subject<void>(),responses:Subject<number>[]=[],teardown=vi.fn(),load=vi.fn(()=>new Observable<number>(subscriber=>{const source=new Subject<number>();responses.push(source);const subscription=source.subscribe(subscriber);return()=>{subscription.unsubscribe();teardown();};}));
    const read=TestBed.runInInjectionContext(()=>{const read=createScopedRead(signal<object|null>({}),()=>true,load);hints.pipe(takeUntilDestroyed()).subscribe(()=>read.invalidate());return read;});TestBed.tick();responses[0].next(1);expect(responses[0].observed).toBe(false);expect(hints.observed).toBe(true);hints.next();expect(load).toHaveBeenCalledTimes(2);TestBed.resetTestingModule();expect(hints.observed).toBe(false);expect(teardown).toHaveBeenCalledTimes(2);hints.next();read.invalidate();read.refresh();read.retry();expect(load).toHaveBeenCalledTimes(2);
  });
});
