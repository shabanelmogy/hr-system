import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../../platform/auth/auth.fixture';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { StateLookupService, type StateLookup } from '../../states/lookup.public-api';
import { DistrictStatesState } from './district-states-state';

describe('Districts active State dependency', () => {
  const actor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['Districts:View', 'States:View'],
  };
  const egypt: StateLookup = { id: 1, nameAr: 'مصر', nameEn: 'Egypt', code: 'CAI', countryId: 1 };
  const saudi: StateLookup = {
    id: 2,
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    code: 'CAI',
    countryId: 1,
  };
  function setup(initial = actor) {
    const identity = signal<Session | null>(initial);
    const language = signal('en');
    const requests: Subject<readonly StateLookup[]>[] = [];
    const lookup = vi.fn(() => {
      const request = new Subject<readonly StateLookup[]>();
      requests.push(request);
      return request.asObservable();
    });
    TestBed.configureTestingModule({
      providers: [
        DistrictStatesState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LocalizationRuntime, useValue: { language } },
        { provide: StateLookupService, useValue: { lookup } },
      ],
    });
    const state = TestBed.inject(DistrictStatesState);
    TestBed.tick();
    const current = () => {
      const request = requests.at(-1);
      if (!request) throw Error('Expected an active State lookup request');
      return request;
    };
    const ready = (rows: readonly StateLookup[] = [egypt, saudi]) => {
      current().next(rows);
      TestBed.tick();
    };
    return { state, identity, language, lookup, requests, current, ready };
  }
  afterEach(() => TestBed.resetTestingModule());

  it('requires the independent State grant and never turns forbidden lookup into an empty list', () => {
    const { state, lookup } = setup({ ...actor, permissions: ['Districts:View'] });
    state.refresh();
    state.changeSearch('Egypt');
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    expect(state.source().result).toBeUndefined();
    expect(state.canSelect(1)).toBe(false);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('searches the authorized active snapshot in either language and keeps selected captions outside the search', () => {
    const { state, language, ready, lookup } = setup();
    expect(state.source().kind).toBe('loading');
    ready();
    state.changeSearch('مصر');
    expect(state.source().result?.options.map((option) => option.value)).toEqual([1]);
    expect(state.selection(2)?.option?.label).toBe('Saudi Arabia');
    language.set('ar');
    expect(state.selection(2)?.option?.label).toBe('السعودية');
    expect(state.canSelect(2)).toBe(true);
    expect(lookup).toHaveBeenCalledOnce();
    state.changeSearch('x'.repeat(201));
    expect(state.searchText()).toBe('مصر');
  });

  it('retains an unavailable detail parent for display without making it selectable', () => {
    const { state, ready } = setup();
    ready([egypt]);
    const retained = saudi;
    expect(state.selection(2, retained)).toMatchObject({
      value: 2,
      kind: 'ready',
      option: { value: 2, label: 'Saudi Arabia', disabled: true },
    });
    expect(state.canSelect(2)).toBe(false);
    expect(state.selection(3)?.kind).toBe('missing');
    expect(state.selection(null)).toBeNull();
  });

  it('masks the old actor immediately and cancels the old lookup before accepting a new snapshot', () => {
    const { state, identity, requests, current, ready } = setup();
    const old = current();
    identity.set({ ...actor, companyId: 2 });
    expect(state.source().kind).toBe('loading');
    expect(state.source().result).toBeUndefined();
    TestBed.tick();
    expect(old.observed).toBe(false);
    expect(requests).toHaveLength(2);
    old.next([egypt]);
    expect(state.source().kind).toBe('loading');
    ready([saudi]);
    expect(state.source().result?.options.map((option) => option.value)).toEqual([2]);
    identity.set(null);
    expect(state.source().result).toBeUndefined();
  });

  it('distinguishes empty/error/forbidden and only reopens a server denial after actor replacement', () => {
    const { state, current, identity, ready, lookup } = setup();
    current().error(new Error('offline'));
    TestBed.tick();
    expect(state.source().kind).toBe('error');
    state.refresh();
    ready([]);
    expect(state.source()).toMatchObject({ kind: 'ready', result: { options: [] } });
    state.refresh();
    current().error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    state.refresh();
    expect(lookup).toHaveBeenCalledTimes(3);
    identity.set({ ...actor });
    TestBed.tick();
    expect(lookup).toHaveBeenCalledTimes(4);
  });
  it('coalesces invalidations while a lookup is pending and reconciles once after it finishes', () => {
    const { state, lookup, ready } = setup();
    state.invalidate();
    state.invalidate();
    TestBed.tick();
    expect(lookup).toHaveBeenCalledOnce();
    ready();
    expect(lookup).toHaveBeenCalledTimes(2);
    ready();
    expect(lookup).toHaveBeenCalledTimes(2);
  });
});
