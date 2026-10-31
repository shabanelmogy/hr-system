import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createCollectionController } from './collection-controller';
import type { CollectionSource } from './collection.types';
describe('Shared collection presentation lifecycle',()=>{
 it('moves records within one page independently of page navigation without requesting data',()=>{
  const{model,source,page,query}=setup();
  source.set({query,kind:'ready',result:{query,rows:[1,2,3].map(id=>({id})),total:3,hasNextPage:false}});TestBed.tick();
  expect(model.canNavigate('first')).toBe(false);expect(model.canNavigate('previous')).toBe(false);expect(model.canNavigate('next')).toBe(true);
  model.navigate('next');expect(model.activeId()).toBe(2);expect(model.focusRequest()?.id).toBe(2);
  model.navigate('last');expect(model.activeId()).toBe(3);expect(model.canNavigate('next')).toBe(false);expect(model.canNavigate('last')).toBe(false);
  model.navigate('previous');expect(model.activeId()).toBe(2);model.navigate('first');expect(model.activeId()).toBe(1);
  expect(page).not.toHaveBeenCalled();
 });
 it('ignores an unloaded keyboard target and crosses a short unknown page safely',()=>{
  const{model,source,page,query}=setup();
  source.set({query,kind:'ready',result:{query,rows:[{id:1},{id:2}],total:null,hasNextPage:true}});TestBed.tick();
  model.activate(2);expect(()=>model.navigateIndex(3)).not.toThrow();expect(page).not.toHaveBeenCalled();
  model.navigate('next');expect(page).toHaveBeenCalledExactlyOnceWith({pageIndex:1,pageSize:5});
 });
 function setup(){
  const query={scopeKey:'one',criteriaKey:'all',pageIndex:0,pageSize:5};
  const source=signal<CollectionSource<{id:number}>>({query,kind:'ready',result:{query,rows:[1,2,3,4,5].map(id=>({id})),total:12,hasNextPage:true}});
  const page=vi.fn(),active=vi.fn(),selected=vi.fn();
  const model=TestBed.runInInjectionContext(()=>createCollectionController(source,signal((row:{id:number})=>row.id),signal((row:{id:number})=>row.id!==3),{page,active,selected}));TestBed.tick();
  return{model,source,page,active,selected,query};
 }
 it('separates activation from eligible page-only selection and resets synchronously on scope replacement',()=>{
  const{model,source,selected}=setup();expect(model.activeId()).toBe(1);model.toggle(2,true);model.activate(4);
  expect(model.activeId()).toBe(4);expect(model.selectedIds()).toEqual([2]);model.selectPage(true);expect(model.selectedIds()).toEqual([1,2,4,5]);expect(model.allSelected()).toBe(true);
  source.update(s=>({...s,query:{...s.query,scopeKey:'two'}}));expect(model.activeId()).toBeNull();expect(model.selectedIds()).toEqual([]);TestBed.tick();expect(selected).toHaveBeenLastCalledWith([]);
 });
 it('emits one record page request and acquires its intended row only after the matching response',()=>{
  const{model,source,page,query}=setup();model.activate(5);model.navigate('next');expect(page).toHaveBeenCalledExactlyOnceWith({pageIndex:1,pageSize:5});
  const next={...query,pageIndex:1};source.set({...source(),query:next,kind:'loading'});TestBed.tick();expect(model.activeId()).toBeNull();expect(model.view().rows).toEqual([]);
  source.set({query:next,kind:'ready',result:{query:next,rows:[6,7,8,9,10].map(id=>({id})),total:12,hasNextPage:true}});TestBed.tick();expect(model.activeId()).toBe(6);expect(model.focusRequest()?.id).toBe(6);expect(page).toHaveBeenCalledOnce();
 });
 it('discards a pending record target on error/unrelated criteria and never requests a competing page clamp',()=>{
  const{model,source,page,query}=setup();model.navigate('last');expect(page).toHaveBeenCalledOnce();
  const other={...query,criteriaKey:'changed',pageIndex:0};source.set({query:other,kind:'ready',result:{query:other,rows:[{id:20}],total:1,hasNextPage:false}});TestBed.tick();expect(model.activeId()).toBe(20);expect(model.focusRequest()).toBeNull();expect(page).toHaveBeenCalledOnce();
 });
 it('blocks duplicate/current/invalid requests and selection while loading',()=>{
  const{model,source,page}=setup();model.page({pageIndex:0,pageSize:5});model.page({pageIndex:-1,pageSize:5});model.page({pageIndex:99,pageSize:5});expect(page).not.toHaveBeenCalled();
  source.update(s=>({...s,kind:'loading'}));model.page({pageIndex:1,pageSize:5});model.selectPage(true);expect(page).not.toHaveBeenCalled();expect(model.selectedIds()).toEqual([]);
 });
});
