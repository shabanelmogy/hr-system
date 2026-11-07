import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { GlobalTemplateService } from './global-template-service';

describe('global manager HTTP boundary', () => {
  const origin = 'https://localhost:7037';
  let http: HttpTestingController;
  let service: GlobalTemplateService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
      ],
    });
    service = TestBed.inject(GlobalTemplateService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('verifies the stored version through the protected management route and consumes the published result', async () => {
    const id = 'c6518e27-5e26-4790-932c-80d572099a32';
    const versionId = '104c0411-c988-449d-9a36-e27d2d7532f5';
    const result = firstValueFrom(service.verifyDatabase(id, versionId));
    http.expectOne(origin + '/api/v1/browser-auth/csrf').flush({ requestToken: 'fixture-csrf' });
    const request = await vi.waitFor(() =>
      http.expectOne(
        origin +
          '/api/v1/global-crystal-reports/manage/' +
          id +
          '/versions/' +
          versionId +
          '/verify-database',
      ),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('fixture-csrf');
    expect(request.request.body).toEqual({});
    request.flush({
      id,
      entityKey: 'countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
      description: null,
      updatedOn: '2026-11-07T00:00:00Z',
      currentVersionNumber: 2,
      isPublished: true,
      isArchived: false,
      rowVersion: 'AQEBAQEBAQE=',
      versions: [],
    });
    expect(await result).toMatchObject({ currentVersionNumber: 2, isPublished: true });
  });
  it('resolves filename identity within the entity using an authenticated non-null response', async () => {
    const result = firstValueFrom(service.uploadTarget('countries', 'Countries.Directory.rpt'));
    const request = http.expectOne((entry) => entry.url.endsWith('/upload-target'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('entityKey')).toBe('countries');
    expect(request.request.params.get('fileName')).toBe('Countries.Directory.rpt');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ report: null, canReplace: false });
    expect(await result).toEqual({ report: null, canReplace: false });
  });
  it('sends the confirmed source and row version in one CSRF-protected replacement request', async () => {
    const id = 'c6518e27-5e26-4790-932c-80d572099a32';
    const file = new File(['fixture'], 'Countries.Directory.rpt');
    const result = firstValueFrom(service.replace(id, 'countries', file, 'AAAAAAAAAAA='));
    http.expectOne(origin + '/api/v1/browser-auth/csrf').flush({ requestToken: 'fixture-csrf' });
    const request = await vi.waitFor(() =>
      http.expectOne(origin + '/api/v1/global-crystal-reports/manage/' + id + '/replace'),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('fixture-csrf');
    const body: unknown = request.request.body;
    if (!(body instanceof FormData)) throw new Error('Expected multipart replacement');
    expect(body.get('entityKey')).toBe('countries');
    expect(body.get('file')).toBeInstanceOf(File);
    expect((body.get('file') as File).name).toBe(file.name);
    expect(body.get('rowVersion')).toBe('AAAAAAAAAAA=');
    const response = {
      id,
      entityKey: 'countries',
      reportKey: 'countries-directory',
      displayName: 'Directory',
      description: null,
      updatedOn: '2026-11-04T00:00:00Z',
      currentVersionNumber: 2,
      isPublished: true,
      isArchived: false,
      rowVersion: 'AQEBAQEBAQE=',
      versions: [],
    };
    request.flush(response);
    expect(await result).toEqual(response);
    http.expectNone((entry) => entry.url.includes('/publish'));
  });
  it('reads the authenticated global-only catalog with server paging', async () => {
    const result = firstValueFrom(service.list('countries', 'Directory', 2, 10));
    const request = http.expectOne((entry) => entry.url.endsWith('/global-crystal-reports/manage'));
    expect(request.request.params.get('page')).toBe('3');
    expect(request.request.params.get('entityKey')).toBe('countries');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ items: [], totalCount: 0 });
    expect(await result).toEqual({ items: [], totalCount: 0 });
  });
  it('queries column rules with CSRF and credentials before server paging', async () => {
    const filters = [
      {
        field: 'displayName',
        operator: 'and',
        constraints: [{ matchMode: 'contains', value: 'Directory' }],
      },
    ] as const;
    const result = firstValueFrom(service.list('countries', '', 2, 10, 'draft', filters));
    http.expectOne(origin + '/api/v1/browser-auth/csrf').flush({ requestToken: 'fixture-csrf' });
    const request = await vi.waitFor(() =>
      http.expectOne(origin + '/api/v1/global-crystal-reports/manage/query'),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('fixture-csrf');
    expect(request.request.body).toEqual({
      entityKey: 'countries',
      search: '',
      page: 3,
      pageSize: 10,
      status: 'draft',
      filters,
    });
    request.flush({ items: [], totalCount: 0 });
    expect(await result).toEqual({ items: [], totalCount: 0 });
  });
  it('reads database View metadata with credentials, source-scoped search and bounded paging', async () => {
    const result = firstValueFrom(service.databaseViews('countries', 'dbo.', 2));
    const request = http.expectOne((entry) => entry.url.endsWith('/database-views'));
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('sourceKey')).toBe('countries');
    expect(request.request.params.get('search')).toBe('dbo.');
    expect(request.request.params.get('page')).toBe('2');
    request.flush({
      items: [
        {
          viewName: 'dbo.vw_Countries',
          isCompatible: false,
          rejectionCode: 'SchemaBindingRequired',
        },
      ],
      totalCount: 21,
    });
    expect((await result).items[0]?.isCompatible).toBe(false);
  });
  it('requests paged discovery metadata and preserves registered and rejected entries', async () => {
    const response = firstValueFrom(service.candidates('countries', 'Directory', 1, 10));
    const request = http.expectOne((entry) => entry.url.endsWith('/deployment-candidates'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('search')).toBe('Directory');
    expect(request.request.withCredentials).toBe(true);
    const entry = {
      sourceId: 'a'.repeat(64),
      entityKey: 'countries',
      reportKey: 'countries-directory',
      fileName: 'Countries.Directory.rpt',
      displayName: 'Directory',
      subject: null,
      size: 0,
      sha256: '',
      isImportable: false,
      isImported: true,
      validationReason: 'Empty file',
    };
    request.flush({ items: [entry], totalCount: 11 });
    expect((await response).items[0]).toMatchObject({
      isImported: true,
      isImportable: false,
      validationReason: 'Empty file',
    });
  });
  it('obtains CSRF and sends file bytes to inspect without publishing', async () => {
    const file = new File(['fixture'], 'Countries.rpt');
    const result = firstValueFrom(service.inspect('countries', file));
    http.expectOne(origin + '/api/v1/browser-auth/csrf').flush({ requestToken: 'fixture-csrf' });
    await Promise.resolve();
    await Promise.resolve();
    const request = await vi.waitFor(() =>
      http.expectOne(origin + '/api/v1/global-crystal-reports/manage/inspect'),
    );
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('fixture-csrf');
    expect(request.request.withCredentials).toBe(true);
    const body: unknown = request.request.body;
    expect(body).toBeInstanceOf(FormData);
    if (!(body instanceof FormData)) throw new Error('Expected multipart source');
    expect(body.get('entityKey')).toBe('countries');
    expect(body.get('file')).toBeInstanceOf(File);
    expect(body.get('reportPath')).toBeNull();
    request.flush({
      isValid: false,
      validationReason: 'Rejected fixture',
      contractFingerprint: null,
      contractSchemaVersion: null,
      failure: 1,
    });
    expect((await result).isValid).toBe(false);
    http.expectNone((entry) => entry.url.includes('/publish'));
  });
  it('accepts the deployed legacy array without inventing registration status', async () => {
    const result = firstValueFrom(service.candidates('countries', 'Directory', 0, 10));
    http
      .expectOne((entry) => entry.url.endsWith('/deployment-candidates'))
      .flush([
        {
          sourceId: 'a'.repeat(64),
          entityKey: 'countries',
          reportKey: 'countries-directory',
          displayName: 'Directory',
          fileName: 'Countries.Directory.rpt',
          subject: null,
          size: 32,
          sha256: 'b'.repeat(64),
          isImportable: true,
          validationReason: null,
        },
        {
          sourceId: 'c'.repeat(64),
          entityKey: 'countries',
          reportKey: 'countries-other',
          displayName: 'Other',
          fileName: 'Countries.Other.rpt',
          subject: null,
          size: 32,
          sha256: 'd'.repeat(64),
          isImportable: true,
          validationReason: null,
        },
      ]);
    const page = await result;
    expect(page.totalCount).toBe(1);
    expect(page.items[0]?.isImported).toBeNull();
    expect(page.items[0]?.fileName).toBe('Countries.Directory.rpt');
  });
  it('rejects an HTTP200 empty JSON body instead of inventing an empty catalog', async () => {
    const result = firstValueFrom(service.candidates('countries'));
    const rejected = expect(result).rejects.toThrow();
    http.expectOne((entry) => entry.url.endsWith('/deployment-candidates')).flush(null);
    await rejected;
  });
});
