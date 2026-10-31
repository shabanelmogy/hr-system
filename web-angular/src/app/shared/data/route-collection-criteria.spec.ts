import { Component,effect } from '@angular/core';import { TestBed } from '@angular/core/testing';
import { Router,provideRouter } from '@angular/router';import { RouterTestingHarness } from '@angular/router/testing';
import { createCollectionCriteriaCodec } from './collection-criteria';import { createRouteCollectionCriteria } from './route-collection-criteria';
const codec=createCollectionCriteriaCodec({pageSizes:[10,25],defaultPageSize:10,sortFields:['id','name'],defaultSort:{field:'id',direction:'asc'},filters:[{field:'active',url:'approved-public',kind:'boolean',operators:['equals'],nullable:true}]});
@Component({template:''})class Listing{readonly state=createRouteCollectionCriteria(codec);reads=0;constructor(){effect(()=>{this.state.applied();this.reads++;});}}
@Component({template:''})class Other{}
describe('Committed collection criteria with actual Router',()=>{
 async function setup(url='/list',gate:()=>boolean|Promise<boolean>=()=>true){TestBed.configureTestingModule({providers:[provideRouter([{path:'list',component:Listing,canActivate:[gate],runGuardsAndResolvers:'always'},{path:'other',component:Other}])]});const harness=await RouterTestingHarness.create();const owner=await harness.navigateByUrl(url,Listing);return{harness,owner,router:TestBed.inject(Router)};}
 it('hydrates deep links once and ignores unrelated params/fragment without another applied read',async()=>{
  const encoded=codec.encode({...codec.defaults,filters:[{field:'active',operator:'equals',value:false}]})!;const{owner,router,harness}=await setup('/list?list='+encodeURIComponent(encoded)+'&keep=yes#section');expect(owner.state.applied().filters[0].value).toBe(false);const reads=owner.reads;await router.navigate([],{queryParams:{keep:'next'},queryParamsHandling:'merge',fragment:'other'});harness.detectChanges();await vi.waitFor(()=>expect(owner.reads).toBe(reads));expect(owner.state.applied().filters[0].value).toBe(false);
 });
 it('does not navigate for canonical no-op and preserves unrelated params/fragment on a real apply',async()=>{
  const{owner,router}=await setup('/list?keep=yes#section');const spy=vi.spyOn(router,'navigateByUrl');expect(await owner.state.apply({})).toBe('unchanged');expect(spy).not.toHaveBeenCalled();expect(await owner.state.apply({pageIndex:2})).toBe('applied');expect(owner.state.applied().pageIndex).toBe(2);expect(router.parseUrl(router.url).queryParamMap.get('keep')).toBe('yes');expect(router.parseUrl(router.url).fragment).toBe('section');expect(await owner.state.apply({pageSize:25})).toBe('applied');expect(owner.state.applied().pageIndex).toBe(0);
 });
 it('keeps committed state after guard denial and allows a later retry',async()=>{
  let allowed=true;const{owner,router}=await setup('/list',()=>allowed);allowed=false;expect(await owner.state.apply({pageIndex:2})).toBe('cancelled');expect(router.url).toBe('/list');expect(owner.state.applied().pageIndex).toBe(0);allowed=true;expect(await owner.state.apply({pageIndex:2})).toBe('applied');expect(owner.state.applied().pageIndex).toBe(2);
 });
 it('blocks a second apply while navigation waits and never exposes speculative criteria',async()=>{
  let resolve:((value:boolean)=>void)|undefined,waiting=false;const{owner}=await setup('/list',()=>waiting?new Promise<boolean>(done=>{resolve=done;}):true);waiting=true;const first=owner.state.apply({pageIndex:2});await vi.waitFor(()=>expect(resolve).toBeDefined());expect(owner.state.pending()).toBe(true);expect(owner.state.applied().pageIndex).toBe(0);expect(await owner.state.apply({pageIndex:3})).toBe('blocked');resolve!(true);expect(await first).toBe('applied');expect(owner.state.applied().pageIndex).toBe(2);expect(owner.state.pending()).toBe(false);
 });
 it('does not rewrite malformed/duplicate URL parameters until explicit reset/apply',async()=>{
  const{owner,router}=await setup('/list?list=bad&list=also-bad&keep=yes#section');expect(owner.state.resolution().valid).toBe(false);expect(owner.state.applied()).toEqual(codec.defaults);expect(router.url).toContain('list=bad');expect(await owner.state.reset()).toBe('applied');expect(router.url).toBe('/list?keep=yes#section');expect(owner.state.resolution().valid).toBe(true);expect(await owner.state.reset()).toBe('unchanged');
 });
 it('repairs an invalid URL only on explicit successful application and rejects invalid input',async()=>{
  const{owner,router,harness}=await setup('/list?list=bad');const reads=owner.reads;expect(await owner.state.apply({pageSize:7})).toBe('invalid');expect(router.url).toBe('/list?list=bad');expect(await owner.state.apply({})).toBe('applied');harness.detectChanges();expect(owner.state.resolution().valid).toBe(true);expect(owner.state.applied()).toEqual(codec.defaults);expect(owner.reads).toBe(reads);
 });
 it('cannot navigate from a destroyed owner',async()=>{
  const{owner,router}=await setup();await router.navigateByUrl('/other');expect(await owner.state.apply({pageIndex:2})).toBe('destroyed');expect(await owner.state.reset()).toBe('destroyed');expect(router.url).toBe('/other');
 });
 it('contains a rejected Router promise without changing the applied state',async()=>{
  const{owner,router}=await setup();vi.spyOn(router,'navigateByUrl').mockRejectedValueOnce(new Error('Navigation fixture'));expect(await owner.state.apply({pageIndex:2})).toBe('cancelled');expect(owner.state.applied().pageIndex).toBe(0);expect(owner.state.pending()).toBe(false);
 });
});
