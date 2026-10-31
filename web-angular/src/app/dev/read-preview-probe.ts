import { Injectable,signal } from '@angular/core';import { HttpErrorResponse } from '@angular/common/http';import { Observable,Subject } from 'rxjs';
export type ReadScenario='ready'|'error'|'empty'|'throw'|'forbidden';
export interface ReadIdentity{readonly scope:'a'|'b';readonly allowed:boolean;readonly epoch:number;}
export interface ReadSnapshot{readonly scope:'a'|'b';readonly revision:number;}
/** Development-only source/watch instrumentation, never a product cache or API. */
@Injectable({providedIn:'root'})export class ReadPreviewProbe{
 readonly starts=signal(0);readonly active=signal(0);readonly closed=signal(0);readonly cancelled=signal(0);readonly watchers=signal(0);
 scenario:ReadScenario='ready';delayMs=180;private readonly revisions=new Map<string,number>();private readonly hints=new Subject<{scope:string}>();
 readonly hints$=new Observable<{scope:string}>(subscriber=>{this.watchers.update(n=>n+1);const subscription=this.hints.subscribe(subscriber);return()=>{subscription.unsubscribe();this.watchers.update(n=>n-1);};});
 hint(scope:string){this.revisions.set(scope,(this.revisions.get(scope)??0)+1);this.hints.next({scope});}
 load(identity:ReadIdentity):Observable<ReadSnapshot>{
  this.starts.update(n=>n+1);const scenario=this.scenario,revision=this.revisions.get(identity.scope)??0,delay=this.delayMs;
  if(scenario==='throw')throw new Error('Synthetic read factory failure');
  return new Observable<ReadSnapshot>(subscriber=>{
   this.active.update(n=>n+1);let answered=false,late:ReturnType<typeof setInterval>|undefined;
   const first=setTimeout(()=>{
    answered=true;
    if(scenario==='empty'){subscriber.complete();return;}
    if(scenario==='error'||scenario==='forbidden'){subscriber.error(new HttpErrorResponse({status:scenario==='forbidden'?403:503}));return;}
    subscriber.next({scope:identity.scope,revision});
    // A wrongly retained bootstrap subscription would keep receiving these values.
    if(!subscriber.closed)late=setInterval(()=>subscriber.next({scope:identity.scope,revision:revision+1}),100);
   },delay);
   return()=>{clearTimeout(first);clearInterval(late);this.active.update(n=>n-1);this.closed.update(n=>n+1);if(!answered)this.cancelled.update(n=>n+1);};
  });
 }
}
