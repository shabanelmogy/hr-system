import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { LanguageTranslationService } from './language-translation-service';
import type { TranslationQuery } from '../types/language-translation';
describe('System translation transport', () => {
  const origin = 'https://localhost:7037';
  const query: TranslationQuery = {
    source: 'reference-countries',
    baseLanguage: 'ar',
    targetLanguage: 'en',
    status: 'customized',
    search: 'code',
    page: 2,
    pageSize: 25,
  };
  let service: LanguageTranslationService;
  let http: HttpTestingController;
  const security = { csrf: vi.fn<BrowserMutationSecurity['csrf']>() };
  beforeEach(() => {
    security.csrf.mockReset().mockResolvedValue('translation-fixture-csrf');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: security },
      ],
    });
    service = TestBed.inject(LanguageTranslationService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('loads permitted catalog sources before requesting texts', async () => {
    const result = firstValueFrom(service.settings());
    const request = http.expectOne(origin + '/api/v1/system-ui-localizations/settings');
    expect(request.request.withCredentials).toBe(true);
    request.flush({
      revision: 3,
      languages: ['en', 'ar'],
      sources: [],
      catalogVersions: { web: 'v1' },
    });
    await expect(result).resolves.toMatchObject({ revision: 3, sources: [] });
  });
  it('preserves source, language pair, server search, status and requested page', async () => {
    const result = firstValueFrom(service.list(query));
    const request = http.expectOne((request) =>
      request.url.endsWith('/system-ui-localizations/texts'),
    );
    expect(request.request.withCredentials).toBe(true);
    for (const [key, value] of Object.entries(query))
      expect(request.request.params.get(key)).toBe(String(value));
    request.flush({
      revision: 3,
      catalogVersion: 'v1',
      totalCount: 26,
      page: 2,
      pageSize: 25,
      items: [
        {
          key: 'countries.code',
          baseValue: 'رمز',
          targetValue: 'Code',
          shippedValue: 'Country code',
          isCustomized: true,
        },
      ],
    });
    await expect(result).resolves.toMatchObject({ totalCount: 26, revision: 3 });
  });
  it('rejects mismatched paging and invalid response rows', async () => {
    const result = firstValueFrom(service.list(query));
    const failure = expect(result).rejects.toThrow();
    http
      .expectOne((request) => request.url.endsWith('/texts'))
      .flush({
        revision: 3,
        catalogVersion: 'v1',
        totalCount: 0,
        page: 1,
        pageSize: 25,
        items: [],
      });
    await failure;
  });
  it('uses the existing system-text writer with a captured expected revision and CSRF', async () => {
    const payload = {
      source: query.source,
      language: 'en' as const,
      key: 'countries.code',
      value: 'Code',
      expectedRevision: 3,
    };
    const result = firstValueFrom(service.update(payload));
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/system-ui-localizations/text');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('translation-fixture-csrf');
    expect(request.request.body).toEqual(payload);
    request.flush(null, { status: 204, statusText: 'No Content' });
    await expect(result).resolves.toBeUndefined();
  });
  it('resets only the selected key through POST and classifies conflicts', async () => {
    const payload = {
      source: query.source,
      language: 'ar' as const,
      key: 'countries.code',
      expectedRevision: 3,
    };
    const result = firstValueFrom(service.reset(payload));
    const failure = expect(result).rejects.toMatchObject({ status: 409, outcome: 'rejected' });
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/system-ui-localizations/reset');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({}, { status: 409, statusText: 'Conflict' });
    await failure;
  });
  it('does not dispatch without CSRF', async () => {
    security.csrf.mockRejectedValueOnce(Error('unavailable'));
    await expect(
      firstValueFrom(
        service.reset({
          source: query.source,
          language: 'ar',
          key: 'countries.code',
          expectedRevision: 3,
        }),
      ),
    ).rejects.toMatchObject({ outcome: 'not-sent' });
    http.expectNone((request) => request.url.endsWith('/reset'));
  });
});
