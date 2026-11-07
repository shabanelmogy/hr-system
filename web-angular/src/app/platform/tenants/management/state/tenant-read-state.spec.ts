import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { sessionFixture } from '../../../auth/auth.fixture';
import { fixtureItem } from '../../../../../testing/fixture-item';
import { TenantManagementService } from '../services/tenant-management-service';
import { defaultTenantQuery, type TenantPage, type TenantQuery } from '../types/tenant';
import { tenantFixture } from '../tenant.fixture';
import { TenantReadState } from './tenant-read-state';

describe('Tenant authoritative list lifetime', () => {
  const actor: Session = { ...sessionFixture, roles: ['super_admin'], permissions: [] };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const calls: { query: TenantQuery; subject: Subject<TenantPage>; cancelled: boolean }[] = [];
    const page = vi.fn(
      (query: TenantQuery) =>
        new Observable<TenantPage>((observer) => {
          const entry = { query, subject: new Subject<TenantPage>(), cancelled: false };
          calls.push(entry);
          const subscription = entry.subject.subscribe(observer);
          return () => {
            entry.cancelled = true;
            subscription.unsubscribe();
          };
        }),
    );
    TestBed.configureTestingModule({
      providers: [
        TenantReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantManagementService, useValue: { page } },
      ],
    });
    const state = TestBed.inject(TenantReadState);
    TestBed.tick();
    const ready = (index = calls.length - 1) => {
      const call = fixtureItem(calls, index);
      call.subject.next({
        items: [tenantFixture],
        metaData: {
          currentPage: call.query.pageNumber,
          pageNumber: call.query.pageNumber,
          pageSize: call.query.pageSize,
          totalCount: 30,
          totalPages: Math.ceil(30 / call.query.pageSize),
          hasPrev: call.query.pageNumber > 1,
          hasNext: call.query.pageNumber < Math.ceil(30 / call.query.pageSize),
        },
      });
      TestBed.tick();
    };
    return { state, identity, calls, page, ready };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('requires the retained super_admin role without inventing permission grants', () => {
    const denied = setup({ ...actor, roles: ['tenant_admin'] });
    expect(denied.state.source().kind).toBe('forbidden');
    expect(denied.page).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    const allowed = setup();
    expect(allowed.page).toHaveBeenCalledExactlyOnceWith(defaultTenantQuery);
  });
  it('cancels the old actor and masks its rows immediately on identity replacement', () => {
    const { state, identity, calls, ready } = setup();
    ready();
    expect(state.source().result?.rows).toEqual([tenantFixture]);
    identity.set({ ...actor });
    expect(state.source().kind).toBe('loading');
    TestBed.tick();
    expect(fixtureItem(calls, 0).cancelled).toBe(true);
    expect(calls).toHaveLength(2);
    ready(0);
    expect(state.source().kind).toBe('loading');
    ready();
    expect(state.source().kind).toBe('ready');
  });
  it('preserves one refresh requested during a pending read and coalesces repeats', () => {
    const { state, calls, ready } = setup();
    state.refresh();
    state.refresh();
    TestBed.tick();
    expect(calls).toHaveLength(1);
    ready();
    expect(calls).toHaveLength(2);
    ready();
    expect(calls).toHaveLength(2);
  });
  it('latches server403 across criteria and retry until a new actor is authoritative', () => {
    const { state, calls, identity } = setup();
    fixtureItem(calls, 0).subject.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    state.changePage({ pageIndex: 1, pageSize: 10 });
    state.refresh();
    TestBed.tick();
    expect(calls).toHaveLength(1);
    identity.set({ ...actor });
    TestBed.tick();
    expect(calls).toHaveLength(2);
  });
  it('debounces search, resets paging on search/sort and rejects unsupported criteria', async () => {
    vi.useFakeTimers();
    const { state, ready, calls } = setup();
    ready();
    state.changePage({ pageIndex: 1, pageSize: 10 });
    TestBed.tick();
    state.changeSearch({ value: ' Alpha ' });
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();
    expect(state.query()).toMatchObject({ searchValue: 'Alpha', pageNumber: 1 });
    state.changeSort({ field: 'identifier', direction: 'desc' });
    expect(state.query()).toMatchObject({ columnName: 'identifier', sortDirection: 'DESC' });
    state.changeSort({ field: 'billingEmail', direction: 'asc' });
    state.changePage({ pageIndex: 0, pageSize: 201 });
    state.changeSearch({ value: 'x'.repeat(201) });
    expect(state.query().columnName).toBe('identifier');
    expect(state.query().pageSize).toBe(10);
    state.reset();
    expect(state.query()).toEqual(defaultTenantQuery);
    TestBed.tick();
    ready();
    const requests = calls.length;
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();
    expect(calls).toHaveLength(requests);
  });
});
