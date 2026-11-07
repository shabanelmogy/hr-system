import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { LanguageTranslationService } from '../services/language-translation-service';
import { LanguageTranslationState } from './language-translation-state';
import type { TranslationPage, TranslationQuery } from '../types/language-translation';

describe('System translation reads', () => {
  const actor = { ...sessionFixture, roles: ['super_admin'], permissions: ['SystemUiTexts:View'] };
  const settings = {
    revision: 3,
    languages: ['en', 'ar'],
    catalogVersions: { web: 'v1' },
    sources: [{ id: 'reference-countries', client: 'web', namespace: 'reference-countries' }],
  };
  function setup(initial: Session = actor) {
    const identity = signal<Session | null>(initial);
    const requests: { query: TranslationQuery; response: Subject<TranslationPage> }[] = [];
    const service = {
      settings: vi.fn(() => of(settings)),
      list: vi.fn((query: TranslationQuery) => {
        const response = new Subject<TranslationPage>();
        requests.push({ query, response });
        return response.asObservable();
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        LanguageTranslationState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: LanguageTranslationService, useValue: service },
      ],
    });
    const state = TestBed.inject(LanguageTranslationState);
    TestBed.tick();
    TestBed.tick();
    return { state, identity, service, requests };
  }
  function requestAt(requests: ReturnType<typeof setup>['requests'], index: number) {
    const request = requests[index];
    if (!request) throw Error('Expected translation request ' + index);
    return request;
  }
  function complete(request: ReturnType<typeof requestAt>, totalCount = 26) {
    request.response.next({
      revision: 3,
      catalogVersion: 'v1',
      totalCount,
      page: request.query.page,
      pageSize: request.query.pageSize,
      items: [
        {
          key: 'countries.code',
          baseValue: 'Code',
          targetValue: 'رمز',
          shippedValue: 'الرمز',
          isCustomized: true,
        },
      ],
    });
    TestBed.tick();
  }
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });
  it('loads permitted sources and queries the available source without a hardcoded platform-auth fallback', () => {
    const { state, requests } = setup();
    const request = requestAt(requests, 0);
    expect(request.query).toMatchObject({
      source: 'reference-countries',
      baseLanguage: 'en',
      targetLanguage: 'ar',
      page: 1,
      pageSize: 25,
    });
    complete(request);
    expect(state.source().result?.total).toBe(26);
  });
  it('preserves server page size and resets paging when changing status or language', () => {
    const { state, requests } = setup();
    complete(requestAt(requests, 0));
    state.changePage({ pageIndex: 1, pageSize: 25 });
    TestBed.tick();
    expect(requestAt(requests, 1).query.page).toBe(2);
    complete(requestAt(requests, 1));
    state.patch({ status: 'customized', targetLanguage: 'en' });
    TestBed.tick();
    expect(requestAt(requests, 2).query).toMatchObject({
      status: 'customized',
      targetLanguage: 'en',
      page: 1,
    });
  });
  it('cancels old criteria reads and refuses stale actor results', () => {
    const { state, identity, requests } = setup();
    const first = requestAt(requests, 0);
    state.patch({ source: 'reference-countries', targetLanguage: 'en' });
    TestBed.tick();
    expect(first.response.observed).toBe(false);
    identity.set({ ...actor, userId: 'another' });
    expect(state.source().result?.rows).toBeUndefined();
    TestBed.tick();
    first.response.next({
      revision: 0,
      catalogVersion: 'old',
      page: 1,
      pageSize: 25,
      totalCount: 0,
      items: [],
    });
    expect(state.source().kind).toBe('loading');
  });
  it('keeps tenant-only localization permissions separate from Super Admin system texts', () => {
    const { state, service } = setup({
      ...actor,
      roles: ['admin'],
      permissions: ['Localizations:View'],
    });
    expect(state.canRead()).toBe(false);
    expect(service.settings).not.toHaveBeenCalled();
  });
  it('turns server denial into forbidden feedback without retaining stale rows', () => {
    const { state, requests } = setup();
    requestAt(requests, 0).response.error(new HttpErrorResponse({ status: 403 }));
    TestBed.tick();
    expect(state.source().kind).toBe('forbidden');
    expect(state.source().result).toBeUndefined();
  });
});
