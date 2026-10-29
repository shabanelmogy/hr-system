import { computed,signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of,throwError } from 'rxjs';
import { AuthSession,type Session } from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { FiscalContextService } from '../services/fiscal-context-service';
import { fiscalContextFixture as fixture } from '../fiscal-context.fixture';
import { FiscalContextState } from './fiscal-context-state';
describe('Accounting context scope and outcome owner',()=>{
 const permitted={...sessionFixture,permissions:['FiscalYears:View']};
 function setup(initial:Session=sessionFixture){
  const user=signal<Session|null>(initial),pending=signal(false);let current=fixture;
  const service={read:vi.fn(()=>of(current)),select:vi.fn(async(id:number)=>{current={...fixture,selectedFiscalYear:fixture.availableFiscalYears.find(y=>y.id===id)!,hasUserOverride:id!==1};return current;})};
  const auth={user,pending,readIdentity:computed(()=>pending()?null:user()),runScopedContextUpdate:vi.fn(async(action:()=>Promise<boolean>)=>{pending.set(true);try{return await action();}catch{user.set(null);return false;}finally{pending.set(false);if(user())user.set({...user()!});}})};
  TestBed.configureTestingModule({providers:[FiscalContextState,{provide:AuthSession,useValue:auth},{provide:FiscalContextService,useValue:service}]});
  const state=TestBed.inject(FiscalContextState);TestBed.tick();return{user,state,auth,service};
 }
 it('makes zero reads without the exact permission/global scope and masks an old header on company replacement',()=>{
  const {user,state,service}=setup();expect(service.read).not.toHaveBeenCalled();expect(state.visible()).toBe(false);
  user.set(permitted);TestBed.tick();expect(state.context()).toEqual(fixture);
  user.set({...permitted,companyId:2});expect(state.context()).toBeNull();TestBed.tick();
  user.set({...permitted,roles:['super_admin']});expect(state.context()).toBeNull();expect(state.visible()).toBe(false);
 });
 it('guards unlisted/current choices and commits only after the shared barrier',async()=>{
  const {state,service,auth}=setup(permitted);expect(await state.select(1)).toBe(false);expect(await state.select(9)).toBe(false);expect(service.select).not.toHaveBeenCalled();
  expect(await state.select(2)).toBe(true);TestBed.tick();expect(state.context()?.selectedFiscalYear?.id).toBe(2);expect(auth.runScopedContextUpdate).toHaveBeenCalledOnce();
 });
 it('recovers a lost response by reading actual context without repeating the write',async()=>{
  const {state,service}=setup(permitted);service.select.mockRejectedValueOnce(Error('lost response'));
  service.read.mockReturnValue(of({...fixture,selectedFiscalYear:fixture.availableFiscalYears[1],hasUserOverride:true}));
  expect(await state.select(2)).toBe(true);expect(service.select).toHaveBeenCalledOnce();expect(state.error()).toBeNull();
 });
 it('keeps verified old context on denial, and fails closed if recovery cannot verify it',async()=>{
  const {state,service,user}=setup(permitted);service.select.mockRejectedValue(Error('denied'));
  expect(await state.select(2)).toBe(false);expect(state.error()).toBe('fiscalYears.context.switchError');
  service.read.mockReturnValue(throwError(()=>Error('offline')));expect(await state.select(2)).toBe(false);expect(user()).toBeNull();expect(state.context()).toBeNull();
 });
});
