import { strict as assert } from 'node:assert';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { apiV1CountriesGet$Json } from './generated/fn/countries/api-v-1-countries-get-json';
import { apiV1CountriesIdGet$Json } from './generated/fn/countries/api-v-1-countries-id-get-json';
import { apiV1FiscalYearsIdPut$Json } from './generated/fn/fiscal-years/api-v-1-fiscal-years-id-put-json';
import { apiV1FilesUploadPost } from './generated/fn/files/api-v-1-files-upload-post';
import { apiV1FilesDownloadStoredFilenameGet } from './generated/fn/files/api-v-1-files-download-stored-filename-get';
import { RequestBuilder } from './generated/request-builder';
import type { CountryDetailResponse } from './generated/models/country-detail-response';
import type { UpdateFiscalYearRequest } from './generated/models/update-fiscal-year-request';
import type { FiscalPeriodFrequency } from './generated/models/fiscal-period-frequency';
import type { CreateEnvelopeAmendmentRequest } from './generated/models/create-envelope-amendment-request';

// These type checks deliberately expose the captured schema's weak requirements.
const structurallyAcceptedEmptyResponse: CountryDetailResponse = {};
const optionalId: number | undefined = structurallyAcceptedEmptyResponse.id;
const opaqueVersion: UpdateFiscalYearRequest = { rowVersion: 'AQIDBA==' };
const amount: CreateEnvelopeAmendmentRequest = { additionalSalaryCost: 1234.56 };
const numericEnum: FiscalPeriodFrequency = 1;
// @ts-expect-error Wire IDs are numbers, not strings.
const invalidId: CountryDetailResponse = { id: '0' };
// @ts-expect-error Wire date-only values remain strings, not Date objects.
const invalidDate: UpdateFiscalYearRequest = { startDate: new Date() };
void [optionalId, opaqueVersion, amount, numericEnum, invalidId, invalidDate];

class RecordingBackend implements HttpBackend {
  last!: HttpRequest<unknown>;
  response: unknown = { items: [], metaData: { currentPage: 1, totalCount: 0 } };
  failure?: HttpErrorResponse;
  pending = false;
  cancelled = false;
  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.last = request;
    if (this.pending) return new Observable(() => () => { this.cancelled = true; });
    if (this.failure) return throwError(() => this.failure);
    return of(new HttpResponse({ status: 200, body: this.response }));
  }
}

export async function runProbe() {
  const backend = new RecordingBackend();
  const http = new HttpClient(backend);
  const root = 'https://api.invalid'; // RecordingBackend never accesses the network.
  const checks: string[] = [];
  const check = (name: string, test: () => void) => { test(); checks.push(name); };

  await firstValueFrom(apiV1CountriesGet$Json(http, root, {
    PageNumber: 2, PageSize: 25, Search: 'مصر & Egypt', HasStates: false, SortBy: 'nameEn', SortDirection: 'desc',
  }));
  check('Actual query names, paging, Unicode and false preserved', () => {
    assert.equal(backend.last.params.get('PageNumber'), '2');
    assert.equal(backend.last.params.get('PageSize'), '25');
    assert.equal(backend.last.params.get('Search'), 'مصر & Egypt');
    assert.equal(backend.last.params.get('HasStates'), 'false');
    assert.equal(backend.last.params.has('Status'), false);
  });
  check('Unadapted cross-origin Cookie credential gap reproduced', () => {
    assert.equal(backend.last.withCredentials, false);
    assert.equal(backend.last.headers.has('Authorization'), false);
  });
  await firstValueFrom(apiV1CountriesIdGet$Json(http, root, { id: 0 }));
  check('Numeric zero path ID is serialized without a synthetic sentinel', () => {
    assert.equal(backend.last.url, root + '/api/v1/Countries/0');
  });
  const body: UpdateFiscalYearRequest = {
    code: 'FY-TEST', nameAr: 'اختبار', nameEn: 'Test', startDate: '2026-01-01', endDate: '2026-12-31',
    periodFrequency: numericEnum, rowVersion: 'AQIDBA==',
  };
  await firstValueFrom(apiV1FiscalYearsIdPut$Json(http, root, { id: 7, body }));
  check('Opaque concurrency token, date-only and numeric enum survive unchanged', () => {
    assert.deepEqual(backend.last.body, body);
  });
  check('Unadapted mutation has no current CSRF header', () => {
    assert.equal(backend.last.headers.has('X-ERP-XSRF'), false);
  });
  check('Observed media alias collision emits wildcard JSON content type', () => {
    assert.equal(backend.last.headers.get('Content-Type'), 'application/*+json');
  });

  backend.pending = true;
  const subscription = apiV1CountriesGet$Json(http, root).subscribe();
  subscription.unsubscribe();
  check('Observable unsubscribe reaches backend teardown', () => assert.equal(backend.cancelled, true));
  backend.pending = false;

  const problem = { status: 400, errors: { 'items[1].nameEn': ['Required'] }, traceId: 'fixture-trace', correlationId: 'fixture-correlation' };
  backend.failure = new HttpErrorResponse({ status: 400, error: problem });
  await assert.rejects(firstValueFrom(apiV1CountriesGet$Json(http, root)), (error: unknown) => {
    assert.ok(error instanceof HttpErrorResponse);
    assert.equal(error.error, problem);
    return true;
  });
  checks.push('ProblemDetails extensions/nested validation are raw unknown transport, not generated validation');
  backend.failure = undefined;

  await firstValueFrom(apiV1FilesUploadPost(http, root, { body: { File: new Blob(['fixture'], { type: 'text/plain' }) } }));
  check('Multipart Blob uses FormData without setting its boundary header', () => {
    assert.ok(backend.last.body instanceof FormData);
    assert.ok(backend.last.body.get('File') instanceof Blob);
    assert.equal(backend.last.headers.has('Content-Type'), false);
  });
  await firstValueFrom(apiV1FilesDownloadStoredFilenameGet(http, root, { storedFilename: 'fixture.pdf' }));
  check('Missing binary response metadata produces text request instead of Blob', () => {
    assert.equal(backend.last.responseType, 'text');
  });

  // Supplemental serializer fixture only: the captured subset has no query-array endpoint.
  const arrayRequest = new RequestBuilder(root, '/technical-fixture', 'get');
  arrayRequest.query('ids', [0, 2], { style: 'form', explode: true });
  check('Supplemental repeated query array encoding; no live binder claim', () => {
    assert.deepEqual(arrayRequest.build().params.getAll('ids'), ['0', '2']);
  });
  check('Decimal JSON number has no automatic decimal string conversion', () => {
    const request = new RequestBuilder(root, '/technical-fixture', 'post');
    request.body(amount, 'application/json');
    assert.equal(request.build().serializeBody(), '{"additionalSalaryCost":1234.56}');
  });
  check('Schema accepts incomplete response, requiring existing owner runtime validation', () => {
    assert.deepEqual(structurallyAcceptedEmptyResponse, {});
  });
  return { checks, count: checks.length, networkRequests: 0, businessWrites: 0 };
}
