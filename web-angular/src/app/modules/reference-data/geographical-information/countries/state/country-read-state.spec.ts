import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { countryFixture, countryPageFixture } from '../country.fixture';
import type { CountryDetail, CountryPage, CountryQuery } from '../types/country';
import { CountryService } from '../services/country-service';
import { CountryReadState } from './country-read-state';

describe('Countries current actor and criteria read lifetime', () => {
  const permitted: Session = { ...sessionFixture, roles: ['super_admin'], permissions: ['Countries:View'] };
  function setup(initial: Session = permitted) {
    const identity = signal<Session | null>(initial);
    const pages: { query: CountryQuery; subject: Subject<CountryPage>; cancelled: boolean }[] = [];
    const details: { id: number; subject: Subject<CountryDetail>; cancelled: boolean }[] = [];
    const service = {
      page: vi.fn((query: CountryQuery) => new Observable<CountryPage>(observer => {
        const entry = { query, subject: new Subject<CountryPage>(), cancelled: false }; pages.push(entry);
        const subscription = entry.subject.subscribe(observer); return () => { entry.cancelled = true; subscription.unsubscribe(); };
      })),
      detail: vi.fn((id: number) => new Observable<CountryDetail>(observer => {
        const entry = { id, subject: new Subject<CountryDetail>(), cancelled: false }; details.push(entry);
        const subscription = entry.subject.subscribe(observer); return () => { entry.cancelled = true; subscription.unsubscribe(); };
      })),
    };
    TestBed.configureTestingModule({ providers: [CountryReadState, { provide: AuthSession, useValue: { readIdentity: identity } }, { provide: CountryService, useValue: service }] });
    const state = TestBed.inject(CountryReadState); TestBed.tick();
    const ready = () => { const latest = pages.at(-1)!; latest.subject.next(countryPageFixture(latest.query)); TestBed.tick(); };
    return { state, identity, service, pages, details, ready };
  }
  afterEach(() => { TestBed.resetTestingModule(); vi.useRealTimers(); });
  it('resets structured column filters by replacing criteria rather than merging absent optional defaults',()=>{
    const{state,pages,ready}=setup();ready();state.changeColumnFilters([{field:'statesCount',operator:'and',constraints:[{matchMode:'equals',value:0}]}]);TestBed.tick();expect(state.query().filters).toHaveLength(1);ready();state.changePage({pageIndex:1,pageSize:5});TestBed.tick();state.reset();TestBed.tick();expect(state.query().filters).toBeUndefined();expect(state.query()).toMatchObject({pageNumber:1,pageSize:10,status:'active',search:''});expect(pages.at(-1)?.query.filters).toBeUndefined();
  });
  it('starts zero requests without exact global authority, including direct callbacks', () => {
    const { state, service } = setup(sessionFixture);
    state.refresh(); state.changeSearch({ value: 'Egypt' }); state.open(1); state.changeStatus('all'); TestBed.tick();
    expect(state.source().kind).toBe('forbidden'); expect(service.page).not.toHaveBeenCalled(); expect(service.detail).not.toHaveBeenCalled();
  });
  it('masks previous rows synchronously and cancels a page before criteria replacement', () => {
    const { state, pages, ready } = setup(); ready(); expect(state.source().result?.rows).toHaveLength(1);
    state.changeStatus('all'); expect(state.source().kind).toBe('loading'); TestBed.tick();
    expect(pages).toHaveLength(2); state.changeSort({ field: 'nameEn', direction: 'asc' });
    expect(state.source().kind).toBe('loading'); TestBed.tick(); expect(pages[1].cancelled).toBe(true);
    pages[1].subject.next(countryPageFixture(pages[1].query)); expect(state.source().kind).toBe('loading');
    ready(); expect(state.query()).toMatchObject({ status: 'all', sortBy: 'nameEn', pageNumber: 1 });
  });
  it('debounces and trims valid Unicode text once and never sends invalid query choices', async () => {
    vi.useFakeTimers(); const { state, pages, ready } = setup(); ready();
    state.changeSearch({ value: ' م ' }); state.changeSearch({ value: ' مصر ' });
    await vi.advanceTimersByTimeAsync(299); TestBed.tick(); expect(pages).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1); TestBed.tick(); expect(pages).toHaveLength(2); expect(pages[1].query.search).toBe('مصر');
    state.changeSearch({ value: 'x'.repeat(201) }); state.changeSearch({ field: 'secret' }); state.changeStatus('deleted'); state.changeSort({ field: 'statesCount', direction: 'asc' });
    await vi.advanceTimersByTimeAsync(500); TestBed.tick(); expect(pages).toHaveLength(2);
    state.reset(); TestBed.tick(); expect(state.searchDraft()).toBe(''); expect(pages).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(300); TestBed.tick(); expect(pages).toHaveLength(3);
  });
  it('clamps only after a real out-of-range response and retains server paging', () => {
    const { state, pages } = setup(); state.changePage({ pageIndex: 3, pageSize: 10 }); TestBed.tick();
    expect(state.query().pageNumber).toBe(4); expect(pages[0].cancelled).toBe(true);
    pages[1].subject.next(countryPageFixture(pages[1].query, [], 12)); expect(state.source().kind).toBe('loading');
    TestBed.tick(); expect(state.query().pageNumber).toBe(2); expect(pages).toHaveLength(3);
    pages[2].subject.next(countryPageFixture(pages[2].query, [{ ...countryFixture, id: 12 }], 12)); TestBed.tick();
    expect(state.source().query.pageIndex).toBe(1); expect(state.source().result?.total).toBe(12);
  });
  it('latches server403 for the actor across criteria changes and refresh', () => {
    const { state, pages, identity } = setup();
    pages[0].subject.error(new HttpErrorResponse({ status: 403 })); TestBed.tick();
    expect(state.source().kind).toBe('forbidden'); state.changeStatus('all'); state.refresh(); state.open(1); TestBed.tick(); expect(pages).toHaveLength(1);
    identity.set({ ...permitted }); TestBed.tick(); expect(pages).toHaveLength(2); expect(state.source().kind).toBe('loading');
  });
  it('closes/masks detail on actor replacement and ignores old page/detail results', () => {
    const { state, pages, details, identity, ready } = setup(); ready();
    state.open(999); expect(details).toHaveLength(0); state.open(1); TestBed.tick(); expect(state.detailOpen()).toBe(true);
    identity.set({ ...permitted, companyId: 2 }); expect(state.source().kind).toBe('loading'); expect(state.detailOpen()).toBe(false); TestBed.tick();
    expect(details[0].cancelled).toBe(true); details[0].subject.next(countryFixture); expect(state.detailOpen()).toBe(false);
    pages[0].subject.error(new HttpErrorResponse({ status: 403 })); expect(state.source().kind).toBe('loading');
    ready(); expect(state.source().kind).toBe('ready'); identity.set(null); expect(state.source().kind).toBe('loading');
  });
  it('keeps detail errors separate, retries safely, and closes a pending read immediately', () => {
    const { state, details, ready } = setup(); ready(); state.open(1); TestBed.tick();
    details[0].subject.error(new HttpErrorResponse({ status: 404 })); TestBed.tick(); expect(state.detail().kind).toBe('error'); expect(state.source().kind).toBe('ready');
    state.retryDetail(); TestBed.tick(); expect(details).toHaveLength(2); state.close(); expect(state.detailOpen()).toBe(false); TestBed.tick(); expect(details[1].cancelled).toBe(true);
  });
  it('coalesces pending refresh and cancels all active reads on destruction', () => {
    const { state, pages } = setup(); state.refresh(); state.refresh(); TestBed.tick(); expect(pages).toHaveLength(1);
    TestBed.resetTestingModule(); expect(pages[0].cancelled).toBe(true);
  });
});
