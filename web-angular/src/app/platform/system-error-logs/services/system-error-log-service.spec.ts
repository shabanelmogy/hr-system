import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { SystemErrorLogService } from './system-error-log-service';

const origin = 'https://localhost:7037';
const row = {
  id: '2b92450e-c383-feee-339f-77cae87a7ad6',
  occurredOnUtc: '2026-10-17T12:00:00Z',
  source: 'web',
  severity: 'error',
  userName: null,
  service: 'ClientError',
  action: null,
  statusCode: null,
  durationMs: null,
  correlationId: null,
  summary: 'A raw summary',
  client: 'browser',
  browser: null,
  ipAddress: '127.0.0.1',
};
describe('System error log transport', () => {
  let service: SystemErrorLogService;
  let http: HttpTestingController;
  const security = { csrf: vi.fn<BrowserMutationSecurity['csrf']>() };

  beforeEach(() => {
    security.csrf.mockReset().mockResolvedValue('settings-fixture-csrf');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: security },
      ],
    });
    service = TestBed.inject(SystemErrorLogService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('keeps advanced read filters in a bounded CSRF body rather than the URL', async () => {
    const columnFilters = JSON.stringify([
      {
        field: 'summary',
        operator: 'and',
        constraints: [{ matchMode: 'contains', value: 'Example' }],
      },
    ]);
    const result = firstValueFrom(service.list({ page: 1, pageSize: 25, columnFilters }));
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/system-error-logs/query');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('settings-fixture-csrf');
    expect(request.request.body).toEqual({ page: 1, pageSize: 25, columnFilters });
    request.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });
    expect((await result).items).toEqual([]);
  });

  it('sends only allowlisted criteria to the system list route and validates matching page data', async () => {
    const read = firstValueFrom(
      service.list({ page: 2, pageSize: 25, source: 'web', search: '  raw text  ' }),
    );
    const request = http.expectOne(
      (request) => request.url === origin + '/api/v1/system-error-logs',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.keys()).toEqual(['page', 'pageSize', 'source', 'search']);
    expect(request.request.params.get('search')).toBe('  raw text  ');
    request.flush({ items: [row], totalCount: 1, page: 2, pageSize: 25 });
    expect((await read).items[0]?.id).toBe(row.id);
  });
  it('rejects invalid criteria before an HTTP request and rejects a mismatched response page', async () => {
    await expect(firstValueFrom(service.list({ page: 0, pageSize: 25 }))).rejects.toThrow();
    http.expectNone((request) => request.url.startsWith(origin));
    const read = firstValueFrom(service.list({ page: 1, pageSize: 25 }));
    const rejection = expect(read).rejects.toThrow();
    http
      .expectOne((request) => request.url === origin + '/api/v1/system-error-logs')
      .flush({ items: [row], totalCount: 1, page: 2, pageSize: 25 });
    await rejection;
  });
  it('uses the requested detail identity and preserves HTTP errors', async () => {
    const read = firstValueFrom(service.detail(row.id));
    const rejection = expect(read).rejects.toMatchObject({ status: 403 });
    const request = http.expectOne(origin + '/api/v1/system-error-logs/' + row.id);
    expect(request.request.withCredentials).toBe(true);
    request.flush({ title: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    await rejection;
  });
  it('canonicalizes an uppercase requested detail GUID before dispatch and comparison', async () => {
    const read = firstValueFrom(service.detail(row.id.toUpperCase()));
    const request = http.expectOne(origin + '/api/v1/system-error-logs/' + row.id);
    request.flush({ entry: row, diagnostics: [] });
    await expect(read).resolves.toMatchObject({ entry: { id: row.id } });
  });
  it('sends only settings retention and revision, then validates a successful settings response', async () => {
    const save = firstValueFrom(service.saveSettings(90, 4));
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/system-error-logs/settings');
    expect(request.request.method).toBe('PUT');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('settings-fixture-csrf');
    expect(request.request.body).toEqual({ retentionDays: 90, expectedRevision: 4 });
    request.flush({
      retentionDays: 90,
      revision: 5,
      queueDepth: 2,
      droppedCount: 0,
      failedWrites: 0,
    });
    await expect(save).resolves.toMatchObject({ revision: 5 });
  });
  it('does not dispatch settings without CSRF and distinguishes a rejected command from an uncertain one', async () => {
    security.csrf.mockRejectedValueOnce(Error('CSRF unavailable'));
    await expect(firstValueFrom(service.saveSettings(90, 4))).rejects.toMatchObject({
      outcome: 'not-sent',
    });
    http.expectNone(origin + '/api/v1/system-error-logs/settings');
    const rejected = firstValueFrom(service.saveSettings(90, 4));
    const rejectedResult = expect(rejected).rejects.toMatchObject({
      outcome: 'rejected',
      status: 400,
      fieldErrors: { 'Request.RetentionDays': 'Use a lower retention period.' },
    });
    await Promise.resolve();
    http
      .expectOne(origin + '/api/v1/system-error-logs/settings')
      .flush(
        { errors: { 'Request.RetentionDays': ['Use a lower retention period.'] } },
        { status: 400, statusText: 'Bad Request' },
      );
    await rejectedResult;
    const uncertain = firstValueFrom(service.saveSettings(90, 4));
    const uncertainResult = expect(uncertain).rejects.toMatchObject({
      outcome: 'uncertain',
      status: 500,
    });
    await Promise.resolve();
    http
      .expectOne(origin + '/api/v1/system-error-logs/settings')
      .flush({}, { status: 500, statusText: 'Server Error' });
    await uncertainResult;
  });
  it('reads settings through its exact route and rejects a non-success status', async () => {
    const settings = firstValueFrom(service.settings());
    const rejection = expect(settings).rejects.toThrow();
    const request = http.expectOne(origin + '/api/v1/system-error-logs/settings');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ retentionDays: 90 }, { status: 202, statusText: 'Accepted' });
    await rejection;
  });
  it('exports the full filtered criteria as XLSX', async () => {
    const exported = firstValueFrom(service.exportXlsx({ page: 3, pageSize: 25, statusCode: 500 }));
    const request = http.expectOne(
      (request) => request.url === origin + '/api/v1/system-error-logs/export',
    );
    expect(request.request.responseType).toBe('blob');
    expect(request.request.params.get('statusCode')).toBe('500');
    request.flush(
      new Blob(['xlsx'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      {
        headers: {
          'content-disposition': 'attachment; filename="error-logs.xlsx"',
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
    );
    await expect(exported).resolves.toMatchObject({ fileName: 'error-logs.xlsx' });
  });
});
