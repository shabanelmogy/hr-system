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
 const fill=(state:CountryEditorState)=>state.form().value.set({nameAr:'مصر',nameEn:'Egypt',alpha2Code:'EG',alpha3Code:'EGY',phoneCode:'+20',currencyCode:'EGP'});
 it('rechecks exact action permissions and read-only authority for direct callbacks',()=>{
  const{state,service}=setup({...actor,permissions:['Countries:View'],tenantReadOnly:true});state.create();state.edit(1);state.save();expect(state.active()).toBe(false);expect(service.create).not.toHaveBeenCalled();expect(service.detail).not.toHaveBeenCalled();
 });
 it('blocks invalid and double submit, preserves pending drafts and completes once',async()=>{
  const{state,service,write}=setup();state.create();state.save();expect(service.create).not.toHaveBeenCalled();fill(state);const saved=vi.fn();state.saved.subscribe(saved);const saving=state.save();void state.save();expect(service.create).toHaveBeenCalledOnce();
  expect(TestBed.inject(UnsavedChanges).busy()).toBe(true);state.close({identity:state.identity(),revision:state.revision(),token:0});expect(state.active()).toBe(true);
  write.next(detail);await saving;expect(saved).toHaveBeenCalledOnce();expect(state.active()).toBe(false);
 });
 it('loads edit details before submitting and rejects an archived detail',()=>{
  const{state,service,read}=setup();state.edit(1);state.save();expect(service.update).not.toHaveBeenCalled();expect(state.phase()).toBe('loading');read.next({...detail,isDeleted:true});expect(state.phase()).toBe('error');
 });
 it('latches a write denial until actor replacement and ignores late success after actor loss',async()=>{
  const{state,write,identity,service}=setup();state.create();fill(state);const saving=state.save();write.error(new CommandFailure('rejected',403));await saving;expect(state.phase()).toBe('forbidden');state.close({identity:state.identity(),revision:state.revision(),token:1});state.create();expect(state.active()).toBe(false);expect(service.create).toHaveBeenCalledOnce();
  identity.set({...actor});TestBed.tick();state.create();expect(state.active()).toBe(true);
 });
 it('retains rejected fields, blocks replay of uncertain results and clears late actor effects',async()=>{
  const{state,write,identity}=setup();state.create();fill(state);const saving=state.save();write.error(new CommandFailure('rejected',400,{nameEn:'Use a unique name'}));await saving;expect(state.form.nameEn().getError('server')?.message).toBe('Use a unique name');expect(state.active()).toBe(true);expect(state.pending()).toBe(false);
  identity.set(null);TestBed.tick();expect(state.active()).toBe(false);expect(state.form.nameEn().value()).toBe('');
 });
 it('keeps a later draft revision after a successful earlier submission',async()=>{
  const{state,write}=setup();state.create();fill(state);const saving=state.save();state.form.nameEn().value.set('Later draft');write.next(detail);await saving;expect(state.active()).toBe(true);expect(state.form.nameEn().value()).toBe('Later draft');expect(state.unsaved()).toBe(true);
 });
 it('allows an unchanged retry after a definite rejection without field errors',async()=>{
  const{state,write,service}=setup();state.create();fill(state);const saving=state.save();
  write.error(new CommandFailure('rejected',400));await saving;
  expect(state.form().valid()).toBe(true);expect(state.uncertain()).toBe(false);
  service.create.mockReturnValue(of(detail));await state.save();
  expect(service.create).toHaveBeenCalledTimes(2);expect(state.active()).toBe(false);
 });
 it('requires explicit close/review after an uncertain submission and never resubmits',async()=>{
  const{state,write,service,refresh}=setup();state.create();fill(state);const saving=state.save();write.error(new CommandFailure('uncertain',0));await saving;void state.save();expect(state.uncertain()).toBe(true);expect(service.create).toHaveBeenCalledOnce();
  state.close({identity:state.identity(),revision:state.revision(),token:1});expect(state.active()).toBe(false);expect(refresh).toHaveBeenCalledOnce();
 });
});
