import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { catalogFixture } from '../module.fixture';
import { ModuleCatalogState } from './module-catalog-state';
import { ERP_API_ORIGIN } from '../../../config/api-origin';

describe('Scoped module catalog state', () => {
  const url = 'https://localhost:7037/api/v1/modules/accessible';
  let user: ReturnType<typeof signal<Session|null>>; let state: ModuleCatalogState; let http: HttpTestingController;
  beforeEach(() => {
    user = signal<Session|null>(sessionFixture);
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ERP_API_ORIGIN, useValue: 'https://localhost:7037' }, ModuleCatalogState, { provide: AuthSession, useValue: { user,readIdentity:user } }] });
    state = TestBed.inject(ModuleCatalogState); http = TestBed.inject(HttpTestingController); TestBed.tick();
  });
  afterEach(() => { http.verify({ ignoreCancelled: true }); vi.restoreAllMocks(); });
  it('shares a fresh catalog on re-entry, refreshes after30 seconds and deduplicates refresh consumers',()=>{
    const clock=vi.spyOn(Date,'now').mockReturnValue(1000);http.expectOne(url).flush(catalogFixture);
    clock.mockReturnValue(30_999);state.refreshIfStale();http.expectNone(url);
    clock.mockReturnValue(31_000);state.refreshIfStale();state.refreshIfStale();const refresh=http.expectOne(url);refresh.flush(catalogFixture);expect(state.state().kind).toBe('ready');
  });
  it('denies blank tenant scope without a request and masks the current catalog immediately',()=>{
    http.expectOne(url).flush(catalogFixture);user.set({...sessionFixture,tenantId:'  '});expect(state.state()).toEqual({kind:'forbidden'});TestBed.tick();state.refreshIfStale();http.expectNone(url);
  });
  it('sends one credentialed request for multiple consumers and ignores a retry while loading', () => {
    state.state(); state.state(); state.retry(); const request = http.expectOne(url);
    expect(request.request.withCredentials).toBe(true); expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(catalogFixture); expect(state.state().kind).toBe('ready'); http.expectNone(url);
  });
  it('hides a completed catalog synchronously when the session object changes, even within the same company', () => {
    http.expectOne(url).flush(catalogFixture); expect(state.state().kind).toBe('ready');
    user.set({ ...sessionFixture, userId: 'different-user' }); expect(state.state()).toEqual({ kind: 'loading' });
    TestBed.tick(); http.expectOne(url).flush([]); expect(state.state()).toEqual({ kind: 'ready', modules: [] });
  });
  it('cancels an outstanding request on logout and never exposes a late result before effect cleanup', () => {
    const request = http.expectOne(url); user.set(null); request.flush(catalogFixture);
    expect(state.state()).toEqual({ kind: 'loading' }); TestBed.tick(); http.expectNone(url);
  });
  it('unsubscribes the previous identity request and the component injector lifetime', () => {
    const first = http.expectOne(url); user.set({ ...sessionFixture, companyId: 2 }); TestBed.tick();
    expect(first.cancelled).toBe(true); const second = http.expectOne(url); TestBed.resetTestingModule(); expect(second.cancelled).toBe(true);
  });
  it('shows finite errors, permits explicit retry and rejects malformed success payloads', () => {
    http.expectOne(url).flush({}, { status: 503, statusText: 'Unavailable' }); expect(state.state()).toEqual({ kind: 'error' });
    state.retry(); http.expectOne(url).flush({ unexpected: true }); expect(state.state()).toEqual({ kind: 'error' });
    state.retry(); http.expectOne(url).flush(catalogFixture); expect(state.state().kind).toBe('ready');
  });
  it('treats forbidden as denial without showing stale modules or an automatic retry loop', () => {
    http.expectOne(url).flush({}, { status: 403, statusText: 'Forbidden' }); expect(state.state()).toEqual({ kind: 'forbidden' });
    state.retry(); http.expectNone(url);
  });
  it('preserves the source global-role exclusion even when the server could return a catalog', () => {
    http.expectOne(url).flush(catalogFixture); user.set({ ...sessionFixture, roles: [' SUPER_ADMIN '] });
    expect(state.state()).toEqual({ kind: 'forbidden' }); TestBed.tick(); http.expectNone(url);
  });
});
