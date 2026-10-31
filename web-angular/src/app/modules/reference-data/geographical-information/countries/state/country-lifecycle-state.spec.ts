import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession,type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { CommandFailure,UnsavedChanges } from '../../../../../shared/data/public-api';
import { CollectionRecordFeedback,FeedbackNotifications,type CollectionSource } from '../../../../../shared/ui/public-api';
import { CountryService } from '../services/country-service';
import { countryFixture } from '../country.fixture';
import type { CountryListItem } from '../types/country';
import { CountryReadState } from './country-read-state';
import { CountryEditorState } from './country-editor-state';
import { CountryLifecycleState } from './country-lifecycle-state';

describe('Countries lifecycle authority and confirmation',()=>{
 const actor:Session={...sessionFixture,roles:['super_admin'],permissions:['Countries:View','Countries:Archive','Countries:Restore']};
 const row:CountryListItem={...countryFixture,statesCount:0};
 function setup(initial=actor){
  const identity=signal<Session|null>(initial),source=signal<CollectionSource<CountryListItem>>({kind:'ready',query:{scopeKey:'global',criteriaKey:'active',pageIndex:0,pageSize:10},result:{query:{scopeKey:'global',criteriaKey:'active',pageIndex:0,pageSize:10},rows:[row,{...row,id:2},{...row,id:3,isDeleted:true}],total:3,hasNextPage:false}});
  const write=new Subject<number>(),service={archive:vi.fn(()=>write.asObservable()),restore:vi.fn(()=>write.asObservable()),bulkArchive:vi.fn(()=>write.asObservable())},refresh=vi.fn(),editor=signal(false);
  TestBed.configureTestingModule({providers:[CountryLifecycleState,CollectionRecordFeedback,{provide:AuthSession,useValue:{readIdentity:identity}},{provide:CountryService,useValue:service},{provide:CountryReadState,useValue:{source,refresh}},{provide:CountryEditorState,useValue:{active:editor}}]});
  const state=TestBed.inject(CountryLifecycleState);TestBed.tick();return{state,identity,source,write,service,refresh,editor,notices:TestBed.inject(FeedbackNotifications)};
 }
 afterEach(()=>TestBed.resetTestingModule());
 it('guards direct callbacks with exact grants, read-only and current row state',()=>{
  const{state,service}=setup({...actor,tenantReadOnly:true});state.select([1,2]);state.request(row,'archive');state.requestBulk();state.confirm();expect(state.allowed()).toBe(false);expect(state.open()).toBe(false);expect(service.archive).not.toHaveBeenCalled();expect(service.bulkArchive).not.toHaveBeenCalled();
 });
 it('selects only distinct active current-page records and requires current confirmation',()=>{
  const{state,source,service}=setup();state.select([1,2,3,99,1,'1']);expect(state.selected()).toEqual([1,2]);state.requestBulk();expect(state.targets().map(row=>row.id)).toEqual([1,2]);
  source.set({...source(),query:{...source().query,criteriaKey:'changed'}});state.confirm();expect(service.bulkArchive).not.toHaveBeenCalled();TestBed.tick();expect(state.open()).toBe(false);expect(state.selected()).toEqual([]);
 });
 it('locks pending confirm/cancel and reconciles a single authoritative zero-count success',()=>{
  const{state,service,write,refresh,notices}=setup();state.select([1,2]);state.requestBulk();state.confirm();state.confirm();state.cancel();TestBed.tick();expect(state.selected()).toEqual([1,2]);expect(state.selectable(row)).toBe(true);expect(state.open()).toBe(true);expect(TestBed.inject(UnsavedChanges).busy()).toBe(true);expect(service.bulkArchive).toHaveBeenCalledExactlyOnceWith([1,2]);
  write.next(0);expect(state.open()).toBe(false);expect(state.selected()).toEqual([]);expect(refresh).toHaveBeenCalledOnce();expect(notices.toasts()[0]).toMatchObject({key:'countries.bulkArchived',params:{count:0}});
 });
 it('maps dependency rejection to a safe localized Modal and does not fabricate success',()=>{
  const{state,write,notices,refresh}=setup();state.request(row,'archive');state.confirm();write.error(new CommandFailure('rejected',400,{},['Country.CountryInUseByCompany']));expect(notices.error()?.key).toBe('countries.inUseByCompany');expect(notices.toasts()).toEqual([]);expect(refresh).not.toHaveBeenCalled();expect(state.open()).toBe(false);
 });
 it('reconciles uncertain outcomes without replay, and masks pending effects on actor loss',()=>{
  const{state,write,notices,service,refresh}=setup();state.select([1,2]);state.requestBulk();state.confirm();write.error(new CommandFailure('uncertain',0));state.confirm();expect(service.bulkArchive).toHaveBeenCalledOnce();expect(notices.error()?.key).toBe('countries.lifecycleUncertain');expect(refresh).toHaveBeenCalledOnce();expect(state.selected()).toEqual([]);
 });
 it('cancels stale actor effects, latches denial, and requires Restore for archived records',()=>{
  const{state,write,identity,service,notices}=setup();state.request({...row,id:3,isDeleted:true},'archive');expect(state.open()).toBe(false);state.request({...row,id:3,isDeleted:true},'restore');state.confirm();expect(service.restore).toHaveBeenCalledExactlyOnceWith(3);identity.set(null);TestBed.tick();write.next(1);expect(notices.toasts()).toEqual([]);expect(state.open()).toBe(false);
 });
 it('prevents reopening a denied actor and permits a newly verified actor',()=>{
  const{state,write,identity}=setup();state.request(row,'archive');state.confirm();write.error(new CommandFailure('rejected',403));state.request(row,'archive');expect(state.open()).toBe(false);identity.set({...actor});TestBed.tick();state.request(row,'archive');expect(state.open()).toBe(true);
 });
 it('blocks lifecycle while a form editor is active',()=>{
  const{state,editor}=setup();editor.set(true);state.request(row,'archive');state.select([1]);expect(state.open()).toBe(false);expect(state.selected()).toEqual([]);
 });
});
