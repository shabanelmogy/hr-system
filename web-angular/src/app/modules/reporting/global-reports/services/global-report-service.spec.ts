import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import { globalReportFixture as report } from '../report.fixture';
import { emptyReportFilters } from '../types/global-report';
import { GlobalReportService, reportFailure } from './global-report-service';

describe('Global PDF HTTP transport', () => {
  const origin = 'https://localhost:7037';
  const list = origin + '/api/v1/global-crystal-reports';
  const render = list + '/' + report.id + '/render';
  const csrfUrl = origin + '/api/v1/browser-auth/csrf';
  let service: GlobalReportService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(GlobalReportService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    try {
      http.verify();
    } finally {
      TestBed.resetTestingModule();
    }
  });
  it('reads only the global countries deployment catalog with cookie credentials', async () => {
    const result = firstValueFrom(service.catalog());
    const request = http.expectOne(list + '?entityKey=countries');
    expect(request.request.withCredentials).toBe(true);
    request.flush([report]);
    expect(await result).toEqual([report]);
  });
  it('renews CSRF and sends the exact source/hash/filters with a binary response', async () => {
    const security = TestBed.inject(BrowserMutationSecurity);
    const warm = security.csrf();
    http.expectOne(csrfUrl).flush({ requestToken: 'old' });
    await warm;
    const result = firstValueFrom(service.render(report, { nameAr: 'مصر', nameEn: '' }, 'ar'));
    const csrf = http.expectOne(csrfUrl);
    expect(csrf.request.withCredentials).toBe(true);
    csrf.flush({ requestToken: 'fresh' });
    await Promise.resolve();
    await Promise.resolve();
    const request = await vi.waitFor(() => http.expectOne(render));
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('fresh');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.responseType).toBe('blob');
    expect(request.request.body).toEqual({
      entityKey: 'countries',
      expectedSha256: report.rowVersion,
      language: 'ar',
      filters: { NameAr: 'مصر' },
    });
    const bytes = new Blob(['%PDF-1.7\nfixture'], { type: 'application/pdf' });
    request.flush(bytes);
    expect((await result).bytes).toBe(bytes);
  });
  it('does not start a POST after cancellation while the CSRF promise is pending', async () => {
    const subscription = service.render(report, emptyReportFilters, 'en').subscribe();
    const csrf = http.expectOne(csrfUrl);
    subscription.unsubscribe();
    csrf.flush({ requestToken: 'late' });
    await TestBed.inject(BrowserMutationSecurity).csrf();
    http.expectNone(render);
  });
  it('cancels an in-flight binary request when its consumer leaves', async () => {
    const subscription = service.render(report, emptyReportFilters, 'en').subscribe();
    http.expectOne(csrfUrl).flush({ requestToken: 'fixture' });
    await Promise.resolve();
    await Promise.resolve();
    const request = await vi.waitFor(() => http.expectOne(render));
    subscription.unsubscribe();
    expect(request.cancelled).toBe(true);
  });
  for (const status of [401, 403, 409])
    it(`maps HTTP ${status} to a bounded failure`, async () => {
      const result = firstValueFrom(service.render(report, emptyReportFilters, 'en'));
      const assertion = expect(result).rejects.toMatchObject({
        kind: status === 409 ? 'stale' : 'forbidden',
      });
      http.expectOne(csrfUrl).flush({ requestToken: 'fixture' });
      await Promise.resolve();
      await Promise.resolve();
      (await vi.waitFor(() => http.expectOne(render))).flush(new Blob(), {
        status,
        statusText: 'Fixture rejection',
      });
      await assertion;
    });
  it('rejects a successful HTTP response containing JSON instead of PDF', async () => {
    const result = firstValueFrom(service.render(report, emptyReportFilters, 'en'));
    const assertion = expect(result).rejects.toMatchObject({ kind: 'invalidPdf' });
    http.expectOne(csrfUrl).flush({ requestToken: 'fixture' });
    await Promise.resolve();
    await Promise.resolve();
    (await vi.waitFor(() => http.expectOne(render))).flush(
      new Blob(['{}'], { type: 'application/json' }),
    );
    await assertion;
  });
  it('maps only owned server fields from bounded ProblemDetails blobs', async () => {
    const failure = await reportFailure(
      new HttpErrorResponse({
        status: 400,
        error: new Blob([
          JSON.stringify({
            errors: {
              'Filters.NameAr': ['Arabic fixture'],
              NameEn: 'English fixture',
              connectionString: 'never render',
            },
          }),
        ]),
      }),
    );
    expect(failure).toMatchObject({
      kind: 'validation',
      fields: { nameAr: 'Arabic fixture', nameEn: 'English fixture' },
    });
    for (const error of [new Blob(['<html>secret</html>']), new Blob(['x'.repeat(65537)])]) {
      expect((await reportFailure(new HttpErrorResponse({ status: 400, error }))).fields).toEqual(
        {},
      );
    }
  });
});
