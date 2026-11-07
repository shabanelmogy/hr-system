import { fixtureItem } from '../../../../../../testing/fixture-item';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { RealtimeEvents, type RealtimeEvent } from '../../../../../platform/realtime/public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { districtFixture, districtPageFixture } from '../district.fixture';
import type { DistrictDetail, DistrictPage, DistrictQuery } from '../types/district';
import { DistrictService } from '../services/district-service';
import { DistrictReadState } from './district-read-state';

describe('Districts current actor and criteria read lifetime', () => {
  const permitted: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Districts:View'],
  };
  function setup(initial: Session = permitted) {
    const identity = signal<Session | null>(initial);
    const events = new Subject<RealtimeEvent>();
    const live = { watch: vi.fn(() => events.asObservable()) };
    const pages: { query: DistrictQuery; subject: Subject<DistrictPage>; cancelled: boolean }[] =
      [];
    const details: { id: number; subject: Subject<DistrictDetail>; cancelled: boolean }[] = [];
    const service = {
      page: vi.fn(
        (query: DistrictQuery) =>
          new Observable<DistrictPage>((observer) => {
            const entry = { query, subject: new Subject<DistrictPage>(), cancelled: false };
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
          new Observable<DistrictDetail>((observer) => {
            const entry = { id, subject: new Subject<DistrictDetail>(), cancelled: false };
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
        DistrictReadState,
        { provide: RealtimeEvents, useValue: live },
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: DistrictService, useValue: service },
      ],
    });
    const state = TestBed.inject(DistrictReadState);
    TestBed.tick();
    const ready = () => {
      const latest = fixtureItem(pages, pages.length - 1);
      latest.subject.next(districtPageFixture(latest.query));
      TestBed.tick();
    };
    return { state, identity, service, pages, details, ready, events, live };
  }
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('resets remote paging for valid parent/dependency filters and rejects malformed parent values', () => {
    const { state, pages, ready } = setup();
    ready();
    state.changeState(2);
    TestBed.tick();
    expect(state.query()).toMatchObject({ stateId: 2, pageNumber: 1 });
    ready();
    state.changeHasAddresses(true);
    TestBed.tick();
    expect(state.query().hasAddresses).toBe(true);
    ready();
    const count = pages.length;
    state.changeState('2');
    state.changeState(0);
    state.changeState(-1);
    state.changeState(1.5);
    TestBed.tick();
    expect(pages).toHaveLength(count);
    state.changeState(null);
    state.changeHasAddresses(null);
    TestBed.tick();
    expect(state.query().stateId).toBeUndefined();
    expect(state.query().hasAddresses).toBeUndefined();
    state.reset();
    TestBed.tick();
    expect(state.query()).toMatchObject({ status: 'active', pageNumber: 1, pageSize: 10 });
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
    fixtureItem(pages, 1).subject.next(districtPageFixture(fixtureItem(pages, 1).query));
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
    state.changeSort({ field: 'addressesCount', direction: 'asc' });
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
    fixtureItem(pages, 1).subject.next(districtPageFixture(fixtureItem(pages, 1).query, [], 12));
    expect(state.source().kind).toBe('loading');
    TestBed.tick();
    expect(state.query().pageNumber).toBe(2);
    expect(pages).toHaveLength(3);
    fixtureItem(pages, 2).subject.next(
      districtPageFixture(fixtureItem(pages, 2).query, [{ ...districtFixture, id: 12 }], 12),
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
    fixtureItem(details, 0).subject.next(districtFixture);
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
    fixtureItem(details, 0).subject.next(districtFixture);
    TestBed.tick();
    for (let i = 0; i < 20; i++)
      events.next({
        kind: 'change',
        change: {
          eventId: String(i),
          occurredAtUtc: '2026-10-31T00:00:00Z',
          resource: 'districts',
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
  it('refreshes child Address counts after an Address change and ignores unrelated resources', async () => {
    vi.useFakeTimers();
    const { state, events, pages, ready } = setup();
    ready();
    for (const resource of ['countries', 'addresses']) {
      events.next({
        kind: 'change',
        change: {
          eventId: resource,
          occurredAtUtc: '2026-11-06T00:00:00Z',
          resource,
          action: 'updated',
          entityId: null,
        },
      });
      await vi.advanceTimersByTimeAsync(250);
      TestBed.tick();
      expect(pages).toHaveLength(resource === 'addresses' ? 2 : 1);
    }
    expect(state.parentRevision()).toBe(1);
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
  it('reconciles parent captions and District counts from authoritative reads after related changes', async () => {
    vi.useFakeTimers();
    const { state, events, pages, ready } = setup();
    ready();
    for (const resource of ['states', 'districts']) {
      events.next({
        kind: 'change',
        change: {
          eventId: resource,
          occurredAtUtc: '2026-11-05T00:00:00Z',
          resource,
          action: 'updated',
          entityId: null,
        },
      });
      await vi.advanceTimersByTimeAsync(250);
      TestBed.tick();
      const latest = fixtureItem(pages, pages.length - 1);
      latest.subject.next(
        districtPageFixture(latest.query, [
          {
            ...districtFixture,
            state: { ...districtFixture.state, nameEn: 'Updated State' },
            addressesCount: 9,
          },
        ]),
      );
      TestBed.tick();
    }
    expect(pages).toHaveLength(3);
    expect(state.source().result?.rows[0]?.state.nameEn).toBe('Updated State');
    expect(state.source().result?.rows[0]?.addressesCount).toBe(9);
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
        resource: 'positions',
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
