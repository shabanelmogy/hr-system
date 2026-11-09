import { fixtureItem } from '../../../../../../testing/fixture-item';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { RealtimeEvents, type RealtimeEvent } from '../../../../../platform/realtime/public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { countryFixture, countryPageFixture } from '../country.fixture';
import type { CountryDetail, CountryPage, CountryQuery } from '../types/country';
import { CountryService } from '../services/country-service';
import { CountryReadState } from './country-read-state';

describe('Countries current actor and criteria read lifetime', () => {
  const permitted: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Countries:View'],
  };
  function setup(initial: Session = permitted) {
    const identity = signal<Session | null>(initial);
    const events = new Subject<RealtimeEvent>();
    const live = { watch: vi.fn(() => events.asObservable()) };
    const pages: { query: CountryQuery; subject: Subject<CountryPage>; cancelled: boolean }[] = [];
    const details: { id: number; subject: Subject<CountryDetail>; cancelled: boolean }[] = [];
    const service = {
      page: vi.fn(
        (query: CountryQuery) =>
          new Observable<CountryPage>((observer) => {
            const entry = { query, subject: new Subject<CountryPage>(), cancelled: false };
            pages.push(entry);
            const subscription = entry.subject.subscribe(observer);
            return () => {
              entry.cancelled = true;
              subscription.unsubscribe();
            };
          }),
      ),
      detail: vi.fn(
        (id: number) =>
          new Observable<CountryDetail>((observer) => {
            const entry = { id, subject: new Subject<CountryDetail>(), cancelled: false };
            details.push(entry);
            const subscription = entry.subject.subscribe(observer);
            return () => {
              entry.cancelled = true;
              subscription.unsubscribe();
            };
          }),
      ),
    };
    TestBed.configureTestingModule({
      providers: [
        CountryReadState,
        { provide: RealtimeEvents, useValue: live },
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: CountryService, useValue: service },
      ],
    });
    const state = TestBed.inject(CountryReadState);
    TestBed.tick();
    const ready = () => {
      const latest = pages.at(-1)!;
      latest.subject.next(countryPageFixture(latest.query));
      TestBed.tick();
    };
    return { state, identity, service, pages, details, ready, events, live };
  }
  it('clears only explicit sorting and retains filters before accepting a new ID sort', () => {
    const { state, ready } = setup();
    ready();
    state.changeStatus('all');
    state.changeSort({ field: 'id', direction: 'asc' });
    expect(state.sort()).toEqual({ field: 'id', direction: 'asc' });
    expect(state.query().sortBy).toBe('id');
    state.changeSort(null);
    expect(state.sort()).toBeNull();
    expect(state.query()).toMatchObject({
      status: 'all',
      sortBy: 'createdOn',
      sortDirection: 'desc',
      pageNumber: 1,
    });
    state.changeSort({ field: 'unknown', direction: 'asc' });
    expect(state.sort()).toBeNull();
    state.changeSort({ field: 'id', direction: 'desc' });
    expect(state.sort()).toEqual({ field: 'id', direction: 'desc' });
    state.reset();
    expect(state.sort()).toEqual({ field: 'createdOn', direction: 'desc' });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('exports every matching server page with captured filters while leaving visible paging unchanged', async () => {
    const { state, pages, ready } = setup();
    ready();
    state.changeColumnFilters([
      { field: 'statesCount', operator: 'and', constraints: [{ matchMode: 'equals', value: 4 }] },
    ]);
    TestBed.tick();
    ready();
    const visibleQuery = state.query();
    const source = state.exportSource([{ key: 'id', header: 'ID', value: (row) => row.id }], 'en');
    if (!source) throw Error('Expected authorized export source');
    const exported = source.load(new AbortController().signal);
    const first = pages.at(-1);
    if (!first) throw Error('Expected first export page');
    expect(first.query).toEqual({ ...visibleQuery, pageNumber: 1, pageSize: 200 });
    first.subject.next(
      countryPageFixture(
        first.query,
        Array.from({ length: 200 }, (_, index) => ({ ...countryFixture, id: index + 1 })),
        201,
      ),
    );
    await vi.waitFor(() => expect(pages.at(-1)).not.toBe(first));
    const second = pages.at(-1);
    if (!second || second === first) throw Error('Expected next export page');
    expect(second.query).toEqual({ ...visibleQuery, pageNumber: 2, pageSize: 200 });
    second.subject.next(countryPageFixture(second.query, [{ ...countryFixture, id: 201 }], 201));
    const records = await exported;
    expect(records).toHaveLength(201);
    expect(records.at(-1)).toEqual({ ID: 201 });
    expect(state.query()).toBe(visibleQuery);
  });
  it('resets structured column filters by replacing criteria rather than merging absent optional defaults', () => {
    const { state, pages, ready } = setup();
    ready();
    state.changeColumnFilters([
      { field: 'statesCount', operator: 'and', constraints: [{ matchMode: 'equals', value: 0 }] },
    ]);
    TestBed.tick();
    expect(state.query().filters).toHaveLength(1);
    ready();
    state.changePage({ pageIndex: 1, pageSize: 5 });
    TestBed.tick();
    state.reset();
    TestBed.tick();
    expect(state.query().filters).toBeUndefined();
    expect(state.query()).toMatchObject({
      pageNumber: 1,
      pageSize: 10,
      status: 'active',
      search: '',
    });
    expect(pages.at(-1)?.query.filters).toBeUndefined();
  });
  it('starts zero requests without exact global authority, including direct callbacks', () => {
    const { state, service, live } = setup(sessionFixture);
    state.refresh();
    state.changeSearch({ value: 'Egypt' });
    state.open(1);
    state.changeStatus('all');
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    expect(service.page).not.toHaveBeenCalled();
    expect(service.detail).not.toHaveBeenCalled();
    expect(live.watch).not.toHaveBeenCalled();
  });
  it('masks previous rows synchronously and cancels a page before criteria replacement', () => {
    const { state, pages, ready } = setup();
    ready();
    expect(state.source().result?.rows).toHaveLength(1);
    state.changeStatus('all');
    expect(state.source().kind).toBe('loading');
    TestBed.tick();
    expect(pages).toHaveLength(2);
    state.changeSort({ field: 'nameEn', direction: 'asc' });
    expect(state.source().kind).toBe('loading');
    TestBed.tick();
    expect(fixtureItem(pages, 1).cancelled).toBe(true);
    fixtureItem(pages, 1).subject.next(countryPageFixture(fixtureItem(pages, 1).query));
    expect(state.source().kind).toBe('loading');
    ready();
    expect(state.query()).toMatchObject({ status: 'all', sortBy: 'nameEn', pageNumber: 1 });
  });
  it('debounces and trims valid Unicode text once and never sends invalid query choices', async () => {
    vi.useFakeTimers();
    const { state, pages, ready } = setup();
    ready();
    state.changeSearch({ value: ' م ' });
    state.changeSearch({ value: ' مصر ' });
    await vi.advanceTimersByTimeAsync(299);
    TestBed.tick();
    expect(pages).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    TestBed.tick();
    expect(pages).toHaveLength(2);
    expect(fixtureItem(pages, 1).query.search).toBe('مصر');
    state.changeSearch({ value: 'x'.repeat(201) });
    state.changeSearch({ field: 'secret' });
    state.changeStatus('deleted');
    state.changeSort({ field: 'statesCount', direction: 'asc' });
    await vi.advanceTimersByTimeAsync(500);
    TestBed.tick();
    expect(pages).toHaveLength(2);
    state.reset();
    TestBed.tick();
    expect(state.searchDraft()).toBe('');
    expect(pages).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();
    expect(pages).toHaveLength(3);
  });
  it('clamps only after a real out-of-range response and retains server paging', () => {
    const { state, pages } = setup();
    state.changePage({ pageIndex: 3, pageSize: 10 });
    TestBed.tick();
    expect(state.query().pageNumber).toBe(4);
    expect(fixtureItem(pages, 0).cancelled).toBe(true);
    fixtureItem(pages, 1).subject.next(countryPageFixture(fixtureItem(pages, 1).query, [], 12));
    expect(state.source().kind).toBe('loading');
    TestBed.tick();
    expect(state.query().pageNumber).toBe(2);
    expect(pages).toHaveLength(3);
    fixtureItem(pages, 2).subject.next(
      countryPageFixture(fixtureItem(pages, 2).query, [{ ...countryFixture, id: 12 }], 12),
    );
    TestBed.tick();
    expect(state.source().query.pageIndex).toBe(1);
    expect(state.source().result?.total).toBe(12);
  });
  it('latches server403 for the actor across criteria changes and refresh', () => {
    const { state, pages, identity } = setup();
    fixtureItem(pages, 0).subject.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    state.changeStatus('all');
    state.refresh();
    state.open(1);
    TestBed.tick();
    expect(pages).toHaveLength(1);
    identity.set({ ...permitted });
    TestBed.tick();
    expect(pages).toHaveLength(2);
    expect(state.source().kind).toBe('loading');
  });
  it('closes/masks detail on actor replacement and ignores old page/detail results', () => {
    const { state, pages, details, identity, ready } = setup();
    ready();
    state.open(999);
    expect(details).toHaveLength(0);
    state.open(1);
    TestBed.tick();
    expect(state.detailOpen()).toBe(true);
    identity.set({ ...permitted, companyId: 2 });
    expect(state.source().kind).toBe('loading');
    expect(state.detailOpen()).toBe(false);
    TestBed.tick();
    expect(fixtureItem(details, 0).cancelled).toBe(true);
    fixtureItem(details, 0).subject.next(countryFixture);
    expect(state.detailOpen()).toBe(false);
    fixtureItem(pages, 0).subject.error(new HttpErrorResponse({ status: 403 }));
    expect(state.source().kind).toBe('loading');
    ready();
    expect(state.source().kind).toBe('ready');
    identity.set(null);
    expect(state.source().kind).toBe('loading');
  });
  it('keeps detail errors separate, retries safely, and closes a pending read immediately', () => {
    const { state, details, ready } = setup();
    ready();
    state.open(1);
    TestBed.tick();
    fixtureItem(details, 0).subject.error(new HttpErrorResponse({ status: 404 }));
    TestBed.tick();
    expect(state.detail().kind).toBe('error');
    expect(state.source().kind).toBe('ready');
    state.retryDetail();
    TestBed.tick();
    expect(details).toHaveLength(2);
    state.close();
    expect(state.detailOpen()).toBe(false);
    TestBed.tick();
    expect(fixtureItem(details, 1).cancelled).toBe(true);
  });
  it('coalesces pending refresh and cancels all active reads on destruction', () => {
    const { state, pages } = setup();
    state.refresh();
    state.refresh();
    TestBed.tick();
    expect(pages).toHaveLength(1);
    TestBed.resetTestingModule();
    expect(fixtureItem(pages, 0).cancelled).toBe(true);
  });
  it('coalesces remote bursts and reconnect into authoritative page and read-only detail refreshes', async () => {
    vi.useFakeTimers();
    const { state, events, pages, details, ready } = setup();
    ready();
    state.open(1);
    TestBed.tick();
    fixtureItem(details, 0).subject.next(countryFixture);
    TestBed.tick();
    for (let i = 0; i < 20; i++)
      events.next({
        kind: 'change',
        change: {
          eventId: String(i),
          occurredAtUtc: '2026-10-31T00:00:00Z',
          resource: 'countries',
          action: 'future',
          entityId: null,
        },
      });
    events.next({ kind: 'reconcile' });
    await vi.advanceTimersByTimeAsync(249);
    TestBed.tick();
    expect(pages).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    TestBed.tick();
    expect(pages).toHaveLength(2);
    expect(details).toHaveLength(2);
    expect(state.detailOpen()).toBe(true);
    expect(state.query()).toEqual(fixtureItem(pages, 0).query);
  });
  it('retains one trailing hint while reads are in flight without cancelling them or creating a retry loop', async () => {
    vi.useFakeTimers();
    const { events, pages, ready } = setup();
    events.next({ kind: 'reconcile' });
    await vi.advanceTimersByTimeAsync(250);
    TestBed.tick();
    expect(pages).toHaveLength(1);
    expect(fixtureItem(pages, 0).cancelled).toBe(false);
    ready();
    expect(pages).toHaveLength(2);
    for (let i = 0; i < 4; i++) {
      events.next({ kind: 'reconcile' });
      await vi.advanceTimersByTimeAsync(250);
      TestBed.tick();
    }
    expect(pages).toHaveLength(2);
    expect(fixtureItem(pages, 1).cancelled).toBe(false);
    ready();
    expect(pages).toHaveLength(3);
    fixtureItem(pages, 2).subject.error(new Error('offline'));
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(30000);
    TestBed.tick();
    expect(pages).toHaveLength(3);
  });
  it('ignores other resources, keeps ready rows during connection failure and masks status immediately on actor change', async () => {
    vi.useFakeTimers();
    const { state, events, pages, identity, ready, live } = setup();
    ready();
    events.next({ kind: 'status', status: 'disconnected' });
    events.next({
      kind: 'change',
      change: {
        eventId: 'other',
        occurredAtUtc: '2026-10-31T00:00:00Z',
        resource: 'states',
        action: 'updated',
        entityId: null,
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();
    expect(pages).toHaveLength(1);
    expect(state.source().kind).toBe('ready');
    expect(state.liveStatus()).toBe('disconnected');
    const current = live.watch.mock.calls[0] as unknown as [() => boolean];
    identity.set({ ...permitted, companyId: 2 });
    expect(current[0]()).toBe(false);
    expect(state.liveStatus()).toBe(null);
    TestBed.tick();
    expect(live.watch).toHaveBeenCalledTimes(2);
  });
  it('discards old criteria hints and pending hints after permission replacement or page disposal', async () => {
    vi.useFakeTimers();
    const { state, events, pages, ready, identity } = setup();
    ready();
    events.next({ kind: 'reconcile' });
    await vi.advanceTimersByTimeAsync(250);
    TestBed.tick();
    state.changeStatus('all');
    TestBed.tick();
    ready();
    expect(pages).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(500);
    TestBed.tick();
    expect(pages).toHaveLength(3);
    events.next({ kind: 'reconcile' });
    identity.set(sessionFixture);
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(250);
    TestBed.tick();
    expect(pages).toHaveLength(3);
    expect(events.observed).toBe(false);
    identity.set({ ...permitted });
    TestBed.tick();
    events.next({ kind: 'reconcile' });
    TestBed.resetTestingModule();
    await vi.advanceTimersByTimeAsync(250);
    expect(events.observed).toBe(false);
  });
});
