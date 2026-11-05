import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocalizationService } from './localization-service';
import { LocalizationRuntime } from './localization-runtime';
import { uiCatalogVersion } from './catalog.generated';
import { ERP_API_ORIGIN } from '../../config/api-origin';

describe('Existing persisted UI translation HTTP contract', () => {
  let service: LocalizationService; let http: HttpTestingController; let runtime: LocalizationRuntime;
  beforeEach(() => {
    document.cookie = 'i18next=en; Path=/';
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ERP_API_ORIGIN, useValue: 'https://localhost:7037' }] });
    service = TestBed.inject(LocalizationService); http = TestBed.inject(HttpTestingController); runtime = TestBed.inject(LocalizationRuntime);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); document.cookie = 'i18next=; Path=/; Max-Age=0'; });
  const identity = { userId: 'u', tenantId: 't', companyId: 1, roles: ['user'], permissions: [] };

  it('loads the existing web fingerprint and scoped SQL runtime with Cookies', async () => {
    const pending = service.connect(identity);
    const request = http.expectOne(req => req.url.endsWith('/company-localizations/runtime'));
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('client')).toBe('web');
    expect(request.request.params.get('catalogVersion')).toBe(uiCatalogVersion);
    request.flush({ tenantId: 't', companyId: 1, defaultLanguage: 'en', catalogVersion: uiCatalogVersion, revision: 2,
      overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'Persisted' }] });
    expect(await pending).toBe(true); expect(runtime.translate('general.mainTitle')).toBe('Persisted');
  });

  it('uses honest global endpoint for super_admin and clears fallback on error', async () => {
    const pending = service.connect({ ...identity, roles: ['super_admin'] });
    http.expectOne(req => req.url.endsWith('/system-ui-localizations/runtime')).flush({ error: 'unavailable' }, { status: 503, statusText: 'Unavailable' });
    expect(await pending).toBe(false); expect(service.runtimeUnavailable()).toBe(true);
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');
  });

  it('cancels previous-context request without clearing the newer context', async () => {
    const old = service.connect(identity);
    const oldRequest = http.expectOne(req => req.url.endsWith('/runtime'));
    const current = service.connect({ ...identity, companyId: 2 });
    expect(oldRequest.cancelled).toBe(true);
    http.expectOne(req => req.url.endsWith('/runtime')).flush({ tenantId: 't', companyId: 2, defaultLanguage: 'en', catalogVersion: uiCatalogVersion, revision: 0, overrides: [] });
    expect(await old).toBe(false); expect(await current).toBe(true); expect(service.runtimeUnavailable()).toBe(false);
  });

  it('sends exact revision/save/reset DTOs and preserves 409 without replay', () => {
    const write = { source: 'web:core', language: 'en' as const, key: 'general.mainTitle', value: 'Stored', expectedRevision: 7 };
    let status = 0;
    service.setText('company', write, 'memory-csrf').subscribe({ error: error => { status = error.status; } });
    const request = http.expectOne('https://localhost:7037/api/v1/company-localizations/text');
    expect(request.request.method).toBe('PUT'); expect(request.request.body).toEqual(write);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('memory-csrf');
    request.flush({}, { status: 409, statusText: 'Conflict' }); expect(status).toBe(409);
    const { value: omitted, ...reset } = write;
    service.resetText('system', reset, 'memory-csrf').subscribe();
    const resetRequest = http.expectOne('https://localhost:7037/api/v1/system-ui-localizations/reset');
    expect(resetRequest.request.method).toBe('POST'); expect(resetRequest.request.body).toEqual(reset); resetRequest.flush(null);
    expect(() => service.setText('company', write, '')).toThrow();
  });

  it('does not let an older same-context refresh overwrite a newer accepted result', async () => {
    const older = service.connect(identity);
    const oldRequest = http.expectOne(req => req.url.endsWith('/runtime'));
    const newer = service.refresh();
    const newRequest = http.expectOne(req => req.url.endsWith('/runtime'));
    const response = (value: string) => ({ tenantId: 't', companyId: 1, defaultLanguage: 'en', catalogVersion: uiCatalogVersion, revision: 2,
      overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value }] });
    newRequest.flush(response('Newer SQL text')); expect(await newer).toBe(true);
    oldRequest.flush(response('Older SQL text')); expect(await older).toBe(false);
    expect(runtime.translate('general.mainTitle')).toBe('Newer SQL text');
  });

  it('rejects malformed company responses before applying any override and recovers on refresh', async () => {
    runtime.setLanguage(null);
    const pending = service.connect(identity);
    const response = {
      tenantId: 't', companyId: 1, defaultLanguage: 'ar', revision: 1,
      catalogVersion: uiCatalogVersion,
      overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'Validated caption' }],
    };
    http.expectOne(req => req.url.endsWith('/runtime')).flush(response);
    expect(await pending).toBe(true);
    expect(runtime.language()).toBe('ar');

    const invalid = service.refresh();
    http.expectOne(req => req.url.endsWith('/runtime')).flush({
      ...response, overrides: [...response.overrides, { namespace: 'core', key: 'actions.cancel', language: 'en', value: 42 }],
    });
    expect(await invalid).toBe(false);
    expect(service.runtimeUnavailable()).toBe(true);
    expect(runtime.language()).toBe('en');
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');

    const recovered = service.refresh();
    http.expectOne(req => req.url.endsWith('/runtime')).flush({ ...response, defaultLanguage: 'en' });
    expect(await recovered).toBe(true);
    expect(service.runtimeUnavailable()).toBe(false);
    expect(runtime.translate('general.mainTitle')).toBe('Validated caption');
  });

  it.each([
    { name: 'negative revision', invalid: { revision: -1 } },
    { name: 'invalid company', invalid: { companyId: 0 } },
    { name: 'unsupported language', invalid: { defaultLanguage: 'fr' } },
    { name: 'too many overrides', invalid: { overrides: Array.from({ length: 5001 }, () => ({ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'Too many' })) } },
    { name: 'oversized text', invalid: { overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'x'.repeat(4001) }] } },
  ])('rejects $name without changing the fallback', async ({ invalid }) => {
    const pending = service.connect(identity);
    http.expectOne(req => req.url.endsWith('/runtime')).flush({
      tenantId: 't', companyId: 1, defaultLanguage: 'en', revision: 1,
      catalogVersion: uiCatalogVersion, overrides: [], ...invalid,
    });
    expect(await pending).toBe(false);
    expect(service.runtimeUnavailable()).toBe(true);
    expect(runtime.translate('general.mainTitle')).toBe('ERP System');
  });

  it('keeps the system response strict and accepts only its own wire shape', async () => {
    const pending = service.connect({ ...identity, roles: ['super_admin'] });
    const response = { catalogVersion: uiCatalogVersion, revision: 1, overrides: [] };
    http.expectOne(req => req.url.endsWith('/system-ui-localizations/runtime')).flush({ ...response, companyId: 1 });
    expect(await pending).toBe(false);
    expect(service.runtimeUnavailable()).toBe(true);

    const recovered = service.refresh();
    http.expectOne(req => req.url.endsWith('/system-ui-localizations/runtime')).flush(response);
    expect(await recovered).toBe(true);
    expect(service.runtimeUnavailable()).toBe(false);
  });
});
