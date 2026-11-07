import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { SystemErrorLogService } from '../services/system-error-log-service';
import type { ErrorLogCriteria, ErrorLogPage } from '../types/error-log';
import { ErrorLogReadState } from './error-log-read-state';

const actor: Session = {
  ...sessionFixture,
  roles: ['super_admin'],
  permissions: ['SystemErrorLogs:View'],
};
const row = {
  id: '2b92450e-c383-feee-339f-77cae87a7ad6',
  occurredOnUtc: '2026-10-17T12:00:00Z',
  source: 'api' as const,
  severity: 'error' as const,
  userName: null,
  service: null,
  action: null,
  statusCode: 500,
  durationMs: null,
  correlationId: null,
  summary: 'x',
  client: null,
  browser: null,
  ipAddress: null,
};
describe('error log known-total reads', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('uses known server totals and resets page for changed filters', () => {
    const identity = signal<Session | null>(actor),
      requests: { criteria: ErrorLogCriteria; response: Subject<ErrorLogPage> }[] = [];
    const list = vi.fn((criteria: ErrorLogCriteria) => {
      const response = new Subject<ErrorLogPage>();
      requests.push({ criteria, response });
      return response.asObservable();
    });
    TestBed.configureTestingModule({
      providers: [
        ErrorLogReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: SystemErrorLogService, useValue: { list } },
      ],
    });
    const state = TestBed.inject(ErrorLogReadState);
    TestBed.tick();
    requests[0]?.response.next({ items: [row], totalCount: 50, page: 1, pageSize: 25 });
    expect(state.source().result?.total).toBe(50);
    state.changePage({ pageIndex: 1, pageSize: 25 });
    TestBed.tick();
    state.patchFilters({ source: 'api' });
    TestBed.tick();
    expect(requests.at(-1)?.criteria.page).toBe(1);
    expect(requests.at(-1)?.criteria.source).toBe('api');
    const rules = [
      {
        field: 'summary',
        operator: 'and',
        constraints: [{ matchMode: 'contains', value: 'Failure' }],
      },
    ];
    state.changeColumnFilters(rules);
    TestBed.tick();
    expect(requests.at(-1)?.criteria.page).toBe(1);
    expect(requests.at(-1)?.criteria.source).toBe('api');
    expect(JSON.parse(requests.at(-1)?.criteria.columnFilters ?? 'null')).toEqual(rules);
    state.reset();
    TestBed.tick();
    expect(state.columnFilters()).toEqual([]);
    expect(requests.at(-1)?.criteria.columnFilters).toBeUndefined();
  });
  it('resets to page one on a changed page size and rejects pages beyond the API maximum', () => {
    const identity = signal<Session | null>(actor),
      requests: { criteria: ErrorLogCriteria; response: Subject<ErrorLogPage> }[] = [];
    const list = vi.fn((criteria: ErrorLogCriteria) => {
      const response = new Subject<ErrorLogPage>();
      requests.push({ criteria, response });
      return response.asObservable();
    });
    TestBed.configureTestingModule({
      providers: [
        ErrorLogReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: SystemErrorLogService, useValue: { list } },
      ],
    });
    const state = TestBed.inject(ErrorLogReadState);
    TestBed.tick();
    state.changePage({ pageIndex: 1, pageSize: 25 });
    TestBed.tick();
    state.changePage({ pageIndex: 3, pageSize: 50 });
    TestBed.tick();
    expect(requests.at(-1)?.criteria).toMatchObject({ page: 1, pageSize: 50 });
    state.changePage({ pageIndex: 100000, pageSize: 50 });
    expect(state.invalid()).toBeNull();
  });
  it('suppresses queued search text after reset or actor replacement', () => {
    vi.useFakeTimers();
    const identity = signal<Session | null>(actor),
      list = vi.fn(() => new Subject<ErrorLogPage>().asObservable());
    TestBed.configureTestingModule({
      providers: [
        ErrorLogReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: SystemErrorLogService, useValue: { list } },
      ],
    });
    const state = TestBed.inject(ErrorLogReadState);
    TestBed.tick();
    state.changeSearch({ value: 'stale' });
    state.reset();
    vi.advanceTimersByTime(300);
    TestBed.tick();
    expect(state.criteria()?.search).toBeUndefined();
    state.changeSearch({ value: 'other actor stale' });
    identity.set({ ...actor, userId: 'replacement' });
    vi.advanceTimersByTime(300);
    TestBed.tick();
    expect(state.criteria()?.search).toBeUndefined();
    vi.useRealTimers();
  });
});
