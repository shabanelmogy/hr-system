import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { ModuleCatalogState } from './module-catalog-state';
import { ModuleContextState, overviewApplication } from './module-context-state';

@Component({template:''}) class Destination {}
describe('Application context navigation',()=>{
  const url='https://localhost:7037/api/v1/modules/accessible';
  const modules=[
    {code:'hr',name:'HR',isDefault:true,submodules:[{code:'basic-data',name:'Basic',entryPath:'https://untrusted.invalid',requiredPermissions:[]}]},
    {code:'acc',name:'Accounting',isDefault:false,submodules:[{code:'ledger-setup',name:'Ledger',entryPath:null,requiredPermissions:[]}]},
  ];
  let state:ModuleContextState,router:Router,http:HttpTestingController;
  let user:ReturnType<typeof signal<Session|null>>,pending:ReturnType<typeof signal<boolean>>,changing:ReturnType<typeof signal<boolean>>;
  beforeEach(async()=>{
    user=signal<Session|null>(sessionFixture);pending=signal(false);changing=signal(false);
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),provideRouter([
      {path:'apps',component:Destination},{path:'apps/:moduleCode',component:Destination},{path:'apps/:moduleCode/:area',component:Destination},
    ]),{provide:ERP_API_ORIGIN,useValue:'https://localhost:7037'},ModuleCatalogState,ModuleContextState,
    {provide:AuthSession,useValue:{user,pending,restoring:signal(false),contextChanging:changing,readIdentity:computed(()=>changing()?null:user())}}]});
    router=TestBed.inject(Router);await router.navigateByUrl('/apps');state=TestBed.inject(ModuleContextState);http=TestBed.inject(HttpTestingController);TestBed.tick();http.expectOne(url).flush(modules);
  });
  afterEach(()=>{http.verify({ignoreCancelled:true});vi.restoreAllMocks();});
  it('derives overview/module from successful navigation, query/fragment and browser history destinations',async()=>{
    expect(state.value()).toBe(overviewApplication);await state.select('hr');expect(router.url).toBe('/apps/hr');expect(state.value()).toBe('hr');
    await router.navigateByUrl('/apps/acc/ledger-setup?view=one#section');expect(state.value()).toBe('acc');
    await state.select(overviewApplication);expect(router.url).toBe('/apps');expect(state.value()).toBe(overviewApplication);http.expectNone(url);
  });
  it('never navigates to supplied server entryPath, unknown code or a duplicate selection',async()=>{
    const navigate=vi.spyOn(router,'navigateByUrl');await state.select('https://untrusted.invalid');await state.select('administration');await state.select(overviewApplication);expect(navigate).not.toHaveBeenCalled();
    await router.navigateByUrl('/apps/unknown');expect(state.value()).toBe('');await state.select('hr');expect(router.url).toBe('/apps/hr');
  });
  it('keeps the committed selection on canceled/rejected navigation and exposes dismissible feedback',async()=>{
    const navigate=vi.spyOn(router,'navigateByUrl').mockResolvedValue(false);await state.select('hr');expect(state.value()).toBe(overviewApplication);expect(state.navigationFailed()).toBe(true);
    state.clearError();expect(state.navigationFailed()).toBe(false);navigate.mockRejectedValue(new Error('Synthetic navigation failure'));await state.select('acc');expect(state.value()).toBe(overviewApplication);expect(state.navigationFailed()).toBe(true);expect(state.busy()).toBe(false);
  });
  it('locks duplicate callbacks until navigation resolves and never optimistically changes selection',async()=>{
    let release!:(value:boolean)=>void;const navigate=vi.spyOn(router,'navigateByUrl').mockReturnValue(new Promise(resolve=>release=resolve));
    const first=state.select('hr');await state.select('acc');expect(navigate).toHaveBeenCalledTimes(1);expect(state.value()).toBe(overviewApplication);expect(state.busy()).toBe(true);release(false);await first;expect(state.busy()).toBe(false);
  });
  it('blocks pending/context transitions and synchronously removes stale options until authoritative reload',async()=>{
    const navigate=vi.spyOn(router,'navigateByUrl');pending.set(true);await state.select('hr');expect(navigate).not.toHaveBeenCalled();
    pending.set(false);changing.set(true);expect(state.value()).toBe('');await state.select('hr');expect(navigate).not.toHaveBeenCalled();TestBed.tick();http.expectNone(url);
    changing.set(false);TestBed.tick();http.expectOne(url).flush([modules[1]]);await state.select('hr');expect(navigate).not.toHaveBeenCalled();await state.select('acc');expect(router.url).toBe('/apps/acc');
  });
  it('hides the control/catalog for global, blank tenant and logout and scopes old navigation errors',async()=>{
    const navigate=vi.spyOn(router,'navigateByUrl').mockResolvedValue(false);await state.select('hr');expect(state.navigationFailed()).toBe(true);
    for(const identity of [{...sessionFixture,roles:[' SUPER_ADMIN ']},{...sessionFixture,tenantId:''},null]){
      user.set(identity);expect(state.visible()).toBe(false);expect(state.navigationFailed()).toBe(false);await state.select('acc');TestBed.tick();http.expectNone(url);
    }expect(navigate).toHaveBeenCalledTimes(1);
  });
  it('does not publish a failed navigation into a different identity',async()=>{
    let release!:(value:boolean)=>void;vi.spyOn(router,'navigateByUrl').mockReturnValue(new Promise(resolve=>release=resolve));
    const first=state.select('hr');user.set({...sessionFixture,userId:'next-user'});release(false);await first;expect(state.navigationFailed()).toBe(false);TestBed.tick();http.expectOne(url).flush([]);
  });
});
