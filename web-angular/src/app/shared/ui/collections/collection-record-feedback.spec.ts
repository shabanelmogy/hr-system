import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createCollectionController } from './collection-controller';
import { CollectionRecordFeedback } from './collection-record-feedback';
import type { CollectionSource } from './collection.types';
describe('Scoped collection mutation feedback',()=>{
 function setup(pageIndex=0){
  TestBed.configureTestingModule({providers:[CollectionRecordFeedback]});
  const query={scopeKey:'actor',criteriaKey:'criteria',pageIndex,pageSize:5},rows=Array.from({length:5},(_,i)=>({id:pageIndex*5+i+1}));
  const source=signal<CollectionSource<{id:number}>>({query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}}),feedback=TestBed.inject(CollectionRecordFeedback),page=vi.fn();
  const model=TestBed.runInInjectionContext(()=>createCollectionController(source,signal((row:{id:number})=>row.id),signal(()=>true),{page,active:()=>{},selected:()=>{}},undefined,feedback.request));TestBed.tick();return{query,source,feedback,page,model,rows};
 }
 afterEach(()=>{TestBed.resetTestingModule();vi.useRealTimers();});
 it('waits for fresh ready data, selects/focuses the edited ID and expires flash without replaying a later refresh',async()=>{
  vi.useFakeTimers();const{query,source,feedback,model,rows}=setup();feedback.edited(source(),3);source.set({query,kind:'loading'});TestBed.tick();expect(model.flashedId()).toBeNull();
  source.set({query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}});TestBed.tick();expect(model.activeId()).toBe(3);expect(model.focusRequest()?.id).toBe(3);expect(model.flashedId()).toBe(3);await vi.advanceTimersByTimeAsync(2401);expect(model.flashedId()).toBeNull();expect(model.activeId()).toBe(3);
  source.set({query,kind:'loading'});TestBed.tick();source.set({query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}});TestBed.tick();expect(model.flashedId()).toBeNull();
  feedback.edited(source(),3);source.set({query,kind:'loading'});TestBed.tick();source.set({query,kind:'ready',result:{query,rows,total:12,hasNextPage:true}});TestBed.tick();expect(model.flashedId()).toBe(3);
  model.navigate('next');expect(model.activeId()).toBe(4);expect(model.focusRequest()?.id).toBe(4);expect(model.flashedId()).toBeNull();model.navigate('previous');expect(model.activeId()).toBe(3);expect(model.flashedId()).toBeNull();
 });
 it('selects the preceding global record after a first-row archive crosses a server-page boundary',()=>{
  const{query,source,feedback,model,page}=setup(1);feedback.removed(source(),row=>row.id,[6]);source.set({query,kind:'loading'});TestBed.tick();source.set({query,kind:'ready',result:{query,rows:[7,8,9,10,11].map(id=>({id})),total:11,hasNextPage:true}});TestBed.tick();expect(page).toHaveBeenCalledExactlyOnceWith({pageIndex:0,pageSize:5});
  const previous={...query,pageIndex:0};source.set({query:previous,kind:'ready',result:{query:previous,rows:[1,2,3,4,5].map(id=>({id})),total:11,hasNextPage:true}});TestBed.tick();expect(model.activeId()).toBe(5);expect(model.focusRequest()?.id).toBe(5);expect(model.flashedId()).toBeNull();
 });
 it('falls back to the first survivor, leaves an empty collection unselected and drops stale authority',()=>{
  const{query,source,feedback,model}=setup();feedback.removed(source(),row=>row.id,[1,2]);source.set({query,kind:'ready',result:{query,rows:[3,4,5].map(id=>({id})),total:3,hasNextPage:false}});TestBed.tick();expect(model.activeId()).toBe(3);
  feedback.removed(source(),row=>row.id,[3,4,5]);source.set({query,kind:'ready',result:{query,rows:[],total:0,hasNextPage:false}});TestBed.tick();expect(model.activeId()).toBeNull();
  feedback.edited(source(),3);const other={...query,scopeKey:'other'};source.set({query:other,kind:'ready',result:{query:other,rows:[{id:3}],total:1,hasNextPage:false}});TestBed.tick();expect(model.flashedId()).toBeNull();expect(model.focusRequest()).toBeNull();
 });
});
