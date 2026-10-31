import { computed,DestroyRef,inject,signal } from '@angular/core';
import { ActivatedRoute,NavigationEnd,Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged,filter,map,startWith } from 'rxjs';
import type { CollectionCriteria,CollectionCriteriaCodec,CriteriaResolution } from './collection-criteria';
export type CriteriaNavigationResult='applied'|'unchanged'|'blocked'|'invalid'|'cancelled'|'destroyed';
/** Component-scoped committed URL state; owners retain drafts, auth, scope and requests. */
export function createRouteCollectionCriteria(codec:CollectionCriteriaCodec,parameter='list'){
 if(!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(parameter))throw new Error('Invalid collection criteria parameter');
 const router=inject(Router),route=inject(ActivatedRoute),destroy=inject(DestroyRef),pending=signal(false);
 const read=(values:readonly string[]):CriteriaResolution=>values.length>1?{value:codec.defaults,valid:false,reason:'schema'}:codec.decode(values[0]??null);
 const initial=read(route.snapshot.queryParamMap.getAll(parameter));
 const resolution=toSignal(router.events.pipe(filter((event):event is NavigationEnd=>event instanceof NavigationEnd),map(event=>read(router.parseUrl(event.urlAfterRedirects).queryParamMap.getAll(parameter))),startWith(initial),distinctUntilChanged((a,b)=>a.valid===b.valid&&a.reason===b.reason&&codec.encode(a.value)===codec.encode(b.value))),{requireSync:true});
 const applied=computed(()=>resolution().value,{equal:(a,b)=>codec.encode(a)===codec.encode(b)});
 async function navigate(value:CollectionCriteria,clear=false):Promise<CriteriaNavigationResult>{
  if(destroy.destroyed)return'destroyed';if(pending())return'blocked';
  const serialized=codec.encode(value);if(serialized===null)return'invalid';
  const tree=router.createUrlTree([],{relativeTo:route,queryParams:{[parameter]:clear?null:serialized},queryParamsHandling:'merge',preserveFragment:true});
  if(router.serializeUrl(tree)===router.url)return'unchanged';
  // A canonical equivalent value never rewrites a valid URL just for formatting.
  if(!clear&&resolution().valid&&serialized===codec.encode(applied()))return'unchanged';
  pending.set(true);
  try{const accepted=await router.navigateByUrl(tree);return destroy.destroyed?'destroyed':accepted?'applied':'cancelled';}
  catch{return destroy.destroyed?'destroyed':'cancelled';}
  finally{pending.set(false);}
 }
 return{applied,resolution,pending:pending.asReadonly(),apply:(patch:Partial<CollectionCriteria>):Promise<CriteriaNavigationResult>=>{
  if(destroy.destroyed)return Promise.resolve('destroyed');if(pending())return Promise.resolve('blocked');
  const next=codec.change(applied(),patch);return next?navigate(next):Promise.resolve('invalid');
 },reset:()=>navigate(codec.defaults,true)};
}
