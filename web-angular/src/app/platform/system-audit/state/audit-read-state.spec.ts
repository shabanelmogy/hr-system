import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemAuditService } from '../services/system-audit-service';
import type { AuditCriteria, AuditPage } from '../types/audit-trail';
import { AuditReadState } from './audit-read-state';
import { AuditDetailState } from './audit-detail-state';
import { AuditFilterState } from './audit-filter-state';
import type { AuditDetails, AuditModuleFilter } from '../types/audit-trail';

const actor: Session = {
  ...sessionFixture,
  roles: ['super_admin'],
  permissions: ['SystemAuditTrail:View'],
};
const entry = {
  moduleCode: 'hr',
  id: 1,
  entityName: 'Department',
  entityKey: '42',
  entityDisplay: null,
  action: 'Modified' as const,
  userId: null,
  userName: null,
  occurredOn: '2026-11-06T07:00:00Z',
  correlationId: null,
  changeCount: 1,
};

describe('Audit cursor pages and actor lifetime', () => {
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });
  function setup(initial: Session | null = actor) {
    const identity = signal(initial);
    const requests: {
      criteria: AuditCriteria;
      cursor: string | null;
      response: Subject<AuditPage>;
    }[] = [];
    const page = vi.fn((criteria: AuditCriteria, cursor: string | null) => {
      const response = new Subject<AuditPage>();
      requests.push({ criteria, cursor, response });
      return response.asObservable();
    });
    const detailResponse = new Subject<AuditDetails>();
    const filtersResponse = new Subject<readonly AuditModuleFilter[]>();
    const filters = vi.fn(() => filtersResponse.asObservable());
    TestBed.configureTestingModule({
      providers: [
        AuditReadState,
        AuditDetailState,
        AuditFilterState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        {
          provide: SystemAuditService,
          useValue: { page, detail: () => detailResponse.asObservable(), filters },
        },
      ],
    });
    const state = TestBed.inject(AuditReadState);
    TestBed.tick();
    return { state, identity, requests, page, detailResponse, filtersResponse, filters };
  }
  it('resets cursor history for typed column criteria and never applies a local-page substitute', () => {
    const { state, requests } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'next-cursor' });
    state.changePage({ pageIndex: 1, pageSize: 50 });
    requests[1]?.response.next({ items: [{ ...entry, id: 2 }], nextCursor: null });
    const rules = [
      { field: 'changeCount', operator: 'and', constraints: [{ matchMode: 'gte', value: 3 }] },
    ];
    state.changeColumnFilters(rules);
    TestBed.tick();
    expect(requests.at(-1)?.cursor).toBeNull();
    expect(JSON.parse(requests.at(-1)?.criteria.columnFilters ?? 'null')).toEqual(rules);
    expect(state.source().query.pageIndex).toBe(0);
    state.changeColumnFilters([
      { field: 'unknown', operator: 'and', constraints: [{ matchMode: 'equals', value: 1 }] },
    ]);
    expect(state.columnFilters()).toEqual(rules);
  });
  it('fetches only the next opaque cursor, keeps totals unknown and reuses previous pages', () => {
    const { state, requests, page } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'next-cursor' });
    expect(state.source().result?.total).toBeNull();
    state.changePage({ pageIndex: 4, pageSize: 50 });
    expect(page).toHaveBeenCalledTimes(1);
    state.changePage({ pageIndex: 1, pageSize: 50 });
    state.changePage({ pageIndex: 1, pageSize: 50 });
    expect(page).toHaveBeenCalledTimes(2);
    expect(requests[1]?.cursor).toBe('next-cursor');
    expect(state.source().query.pageIndex).toBe(0);
    requests[1]?.response.next({ items: [{ ...entry, id: 2 }], nextCursor: null });
    expect(state.source().query.pageIndex).toBe(1);
    state.changePage({ pageIndex: 0, pageSize: 50 });
    expect(state.source().result?.rows[0]?.id).toBe(1);
    expect(page).toHaveBeenCalledTimes(2);
  });
  it('does not advance a failed next read and explicitly retries that same cursor', () => {
    const { state, requests } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'next-cursor' });
    state.changePage({ pageIndex: 1, pageSize: 50 });
    requests[1]?.response.error(new Error('PRIVATE_DIAGNOSTIC'));
    expect(state.source().query.pageIndex).toBe(0);
    expect(state.source().result?.rows).toEqual([entry]);
    expect(state.pageError()).toBe(true);
    state.retry();
    expect(requests[2]?.cursor).toBe('next-cursor');
    requests[2]?.response.next({ items: [], nextCursor: null });
    expect(state.source().query.pageIndex).toBe(1);
  });
  it('invalidates the cursor chain and cancels pending reads when criteria change', () => {
    const { state, requests } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'old' });
    state.changePage({ pageIndex: 1, pageSize: 50 });
    state.patchFilters({ moduleCode: 'reference-data' });
    expect(state.source().result).toBeUndefined();
    TestBed.tick();
    expect(requests[1]?.response.observed).toBe(false);
    expect(requests[2]?.cursor).toBeNull();
    expect(requests[2]?.criteria.moduleCode).toBe('reference-data');
  });
  it('suppresses invalid date requests and debounces record-key searches', () => {
    vi.useFakeTimers();
    const { state, requests } = setup();
    state.patchFilters({ from: '2026-11-07', to: '2026-11-06' });
    TestBed.tick();
    expect(state.invalid()).toBe('range');
    expect(requests).toHaveLength(1);
    state.patchFilters({ from: '', to: '' });
    TestBed.tick();
    state.changeSearch({ value: ' 42 ' });
    vi.advanceTimersByTime(299);
    TestBed.tick();
    expect(requests).toHaveLength(2);
    vi.advanceTimersByTime(1);
    TestBed.tick();
    expect(requests[2]?.criteria.entityKey).toBe('42');
  });
  it('masks actor data synchronously and never retries a denied actor', () => {
    const { state, requests, identity } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: null });
    identity.set({ ...actor, userId: 'another' });
    expect(state.source().result).toBeUndefined();
    TestBed.tick();
    requests[1]?.response.error(new HttpErrorResponse({ status: 403 }));
    expect(state.source().kind).toBe('forbidden');
    state.retry();
    state.refresh();
    expect(requests).toHaveLength(2);
    identity.set({ ...actor, permissions: [] });
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    expect(requests).toHaveLength(2);
  });
  it('refreshes from the first page and cleans up owned subscriptions on destruction', () => {
    const { state, requests } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'old' });
    state.refresh();
    expect(requests[1]?.cursor).toBeNull();
    expect(state.source().result).toBeUndefined();
    TestBed.resetTestingModule();
    expect(requests[1]?.response.observed).toBe(false);
  });
  it('masks already loaded history and filter choices when a detail request denies the same actor', () => {
    const { state, requests, page, detailResponse, filtersResponse, filters } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: 'next' });
    const options = TestBed.inject(AuditFilterState);
    const detail = TestBed.inject(AuditDetailState);
    TestBed.tick();
    filtersResponse.next([{ moduleCode: 'hr', entityNames: ['Department'] }]);
    TestBed.tick();
    expect(options.modules()).toHaveLength(1);
    detail.open(entry);
    TestBed.tick();
    detailResponse.error(new HttpErrorResponse({ status: 403 }));
    expect(state.source().result).toBeUndefined();
    expect(state.source().kind).toBe('forbidden');
    expect(options.modules()).toEqual([]);
    TestBed.tick();
    state.refresh();
    state.retry();
    state.changePage({ pageIndex: 1, pageSize: 50 });
    options.refresh();
    detail.retry();
    expect(page).toHaveBeenCalledTimes(1);
    expect(filters).toHaveBeenCalledTimes(1);
  });
  it('treats filters401 as an actor-wide denial and blocks retry while retaining new-actor recovery', () => {
    const { state, requests, page, filtersResponse, filters, identity } = setup();
    requests[0]?.response.next({ items: [entry], nextCursor: null });
    const options = TestBed.inject(AuditFilterState);
    TestBed.tick();
    filtersResponse.error(new HttpErrorResponse({ status: 401 }));
    expect(options.view().kind).toBe('forbidden');
    expect(state.source().result).toBeUndefined();
    state.refresh();
    options.refresh();
    TestBed.tick();
    expect(page).toHaveBeenCalledTimes(1);
    expect(filters).toHaveBeenCalledTimes(1);
    identity.set({ ...actor, userId: 'new-actor' });
    TestBed.tick();
    expect(page).toHaveBeenCalledTimes(2);
  });
});
