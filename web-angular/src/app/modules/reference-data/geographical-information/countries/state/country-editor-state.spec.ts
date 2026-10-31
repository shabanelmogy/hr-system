import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject,of } from 'rxjs';
import { AuthSession,type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { CommandFailure,UnsavedChanges } from '../../../../../shared/data/public-api';
import { CountryService } from '../services/country-service';
import { countryFixture } from '../country.fixture';
import { countryDetailSchema } from '../types/country';
import { CountryReadState } from './country-read-state';
import { CountryEditorState } from './country-editor-state';
describe('Country editor command lifetime',()=>{
 const actor:Session={...sessionFixture,roles:['super_admin'],permissions:['Countries:View','Countries:Create','Countries:Edit']};
 const detail=countryDetailSchema.parse(countryFixture);
 function setup(initial=actor){
  const identity=signal<Session|null>(initial),write=new Subject<typeof detail>(),read=new Subject<typeof detail>();
  const service={create:vi.fn(()=>write.asObservable()),update:vi.fn(()=>write.asObservable()),detail:vi.fn(()=>read.asObservable())};
  const ready=signal({kind:'ready' as const,data:{items:[countryFixture]}}),refresh=vi.fn();
  TestBed.configureTestingModule({providers:[CountryEditorState,{provide:AuthSession,useValue:{readIdentity:identity}},{provide:CountryService,useValue:service},{provide:CountryReadState,useValue:{source:()=>({kind:'ready'}),view:ready,refresh}}]});
  const state=TestBed.inject(CountryEditorState);TestBed.tick();return{state,service,write,read,identity,refresh};
 }
 afterEach(()=>TestBed.resetTestingModule());
 const fill=(state:CountryEditorState)=>state.form.setValue({nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:'EGY',phoneCode:'+20',currencyCode:'EGP'});
 it('rechecks exact action permissions and read-only authority for direct callbacks',()=>{
  const{state,service}=setup({...actor,permissions:['Countries:View'],tenantReadOnly:true});state.create();state.edit(1);state.save();expect(state.active()).toBe(false);expect(service.create).not.toHaveBeenCalled();expect(service.detail).not.toHaveBeenCalled();
 });
 it('blocks invalid and double submit, preserves pending drafts and completes once',()=>{
  const{state,service,write}=setup();state.create();state.save();expect(service.create).not.toHaveBeenCalled();fill(state);const saved=vi.fn();state.saved.subscribe(saved);state.save();state.save();expect(service.create).toHaveBeenCalledOnce();
  expect(TestBed.inject(UnsavedChanges).busy()).toBe(true);state.close({identity:state.identity(),revision:state.revision(),token:0});expect(state.active()).toBe(true);
  write.next(detail);expect(saved).toHaveBeenCalledOnce();expect(state.active()).toBe(false);
 });
 it('loads edit details before submitting and rejects an archived detail',()=>{
  const{state,service,read}=setup();state.edit(1);state.save();expect(service.update).not.toHaveBeenCalled();expect(state.phase()).toBe('loading');read.next({...detail,isDeleted:true});expect(state.phase()).toBe('error');
 });
 it('latches a write denial until actor replacement and ignores late success after actor loss',()=>{
  const{state,write,identity,service}=setup();state.create();fill(state);state.save();write.error(new CommandFailure('rejected',403));expect(state.phase()).toBe('forbidden');state.close({identity:state.identity(),revision:state.revision(),token:1});state.create();expect(state.active()).toBe(false);expect(service.create).toHaveBeenCalledOnce();
  identity.set({...actor});TestBed.tick();state.create();expect(state.active()).toBe(true);
 });
 it('retains rejected fields, blocks replay of uncertain results and clears late actor effects',()=>{
  const{state,write,identity}=setup();state.create();fill(state);state.save();write.error(new CommandFailure('rejected',400,{nameEn:'Use a unique name'}));expect(state.form.controls.nameEn.errors?.['server']).toBe('Use a unique name');expect(state.active()).toBe(true);expect(state.pending()).toBe(false);
  identity.set(null);TestBed.tick();expect(state.active()).toBe(false);expect(state.form.controls.nameEn.value).toBe('');
 });
 it('keeps a later draft revision after a successful earlier submission',()=>{
  const{state,write}=setup();state.create();fill(state);state.save();state.form.controls.nameEn.setValue('Later draft');write.next(detail);expect(state.active()).toBe(true);expect(state.form.controls.nameEn.value).toBe('Later draft');expect(state.unsaved()).toBe(true);
 });
 it('requires explicit close/review after an uncertain submission and never resubmits',()=>{
  const{state,write,service,refresh}=setup();state.create();fill(state);state.save();write.error(new CommandFailure('uncertain',0));state.save();expect(state.uncertain()).toBe(true);expect(service.create).toHaveBeenCalledOnce();
  state.close({identity:state.identity(),revision:state.revision(),token:1});expect(state.active()).toBe(false);expect(refresh).toHaveBeenCalledOnce();
 });
});
