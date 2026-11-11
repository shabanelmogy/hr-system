import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { SystemAuditService } from './system-audit-service';
import { BrowserMutationSecurity } from '../../auth/session.public-api';

const origin = 'https://localhost:7037';
describe('System audit read-only transport', () => {
  let service: SystemAuditService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: { csrf: async () => 'audit-query-token' } },
      ],
    });
    service = TestBed.inject(SystemAuditService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('posts bounded advanced criteria with the same opaque cursor and CSRF to the query endpoint', async () => {
    const filters = JSON.stringify([
      {
        field: 'record',
        operator: 'and',
        constraints: [{ matchMode: 'contains', value: 'Example' }],
      },
    ]);
    const result = firstValueFrom(
      service.page({ columnFilters: filters }, 'opaque+/cursor==', true),
    );
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/system-audit-trail/query');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('audit-query-token');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      columnFilters: filters,
      cursor: 'opaque+/cursor==',
      pageSize: 25,
      includeTotalCount: true,
    });
    request.flush({ items: [], nextCursor: null });
    expect((await result).items).toEqual([]);
  });

  it('sends exact system route, credentials and opaque cursor without page offsets or fake totals', async () => {
    const read = firstValueFrom(
      service.page({ entityKey: '42', action: 'Modified' }, 'opaque+/cursor=='),
    );
    const request = http.expectOne(
      (request) => request.url === origin + '/api/v1/system-audit-trail',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('pageSize')).toBe('25');
    expect(request.request.params.get('cursor')).toBe('opaque+/cursor==');
    expect(request.request.params.get('entityKey')).toBe('42');
    expect(request.request.params.get('action')).toBe('Modified');
    expect(request.request.params.has('pageNumber')).toBe(false);
    expect(request.request.params.has('tenantId')).toBe(false);
    expect(request.request.params.has('includeTotalCount')).toBe(false);
    request.flush({ items: [], nextCursor: null });
    expect(await read).toEqual({ items: [], nextCursor: null });
  });

  it('opts interactive GET reads into real totals while preserving the response', async () => {
    const result = firstValueFrom(service.page({}, null, true));
    const request = http.expectOne(
      (request) => request.url === origin + '/api/v1/system-audit-trail',
    );
    expect(request.request.params.get('includeTotalCount')).toBe('true');
    expect(request.request.params.get('pageSize')).toBe('25');
    request.flush({ items: [], nextCursor: null, totalCount: 0 });
    expect((await result).totalCount).toBe(0);
  });

  it('requires exact successful status and validates the filters body', async () => {
    const read = firstValueFrom(service.filters());
    const reject = expect(read).rejects.toThrow();
    http
      .expectOne(origin + '/api/v1/system-audit-trail/filters')
      .flush({}, { status: 202, statusText: 'Accepted' });
    await reject;
  });

  it('validates criteria before dispatch and encodes the detail module path', async () => {
    const bad = firstValueFrom(service.page({ entityKey: 'x'.repeat(201) }));
    await expect(bad).rejects.toThrow();
    http.expectNone((request) => request.url.startsWith(origin));
    const detail = firstValueFrom(service.detail({ moduleCode: 'module/with space', id: 7 }));
    const reject = expect(detail).rejects.toThrow();
    http.expectOne(origin + '/api/v1/system-audit-trail/module%2Fwith%20space/7').flush({});
    await reject;
  });

  it('propagates authority denial so the state can mask stale data', async () => {
    const read = firstValueFrom(service.filters());
    const reject = expect(read).rejects.toMatchObject({ status: 403 });
    http
      .expectOne(origin + '/api/v1/system-audit-trail/filters')
      .flush({ title: 'PRIVATE_DIAGNOSTIC' }, { status: 403, statusText: 'Forbidden' });
    await reject;
  });
});
