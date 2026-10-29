import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
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
});
