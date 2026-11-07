import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../../platform/auth/session.public-api';
import { defaultStateQuery } from '../types/state';
import { StateService } from './state-service';

describe('States cookie transport', () => {
  const origin = 'https://localhost:7037',
    base = origin + '/api/v1/states';
  let service: StateService, http: HttpTestingController;
  const detail = {
    id: 1,
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    code: 'CAI',
    countryId: 7,
    country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    createdOn: '2026-01-01T00:00:00.000Z',
    updatedOn: null,
    isDeleted: false,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: { csrf: () => Promise.resolve('csrf') } },
      ],
    });
    service = TestBed.inject(StateService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('sends only the supported server GET query with credentials', async () => {
    const result = firstValueFrom(
      service.page({ ...defaultStateQuery, countryId: 7, hasDistricts: false }),
    );
    const request = http.expectOne((item) => item.url === base);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('countryId')).toBe('7');
    expect(request.request.params.get('hasDistricts')).toBe('false');
    request.flush({
      items: [{ ...detail, districtsCount: 0 }],
      metaData: {
        currentPage: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    });
    expect((await result).items).toHaveLength(1);
  });
  it('uses CSRF once for a write and treats malformed dispatched success as uncertain', async () => {
    const draft = { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 },
      result = firstValueFrom(service.create(draft));
    await Promise.resolve();
    const request = http.expectOne(base);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('csrf');
    expect(request.request.body).toEqual(draft);
    request.flush({ id: 'bad' }, { status: 201, statusText: 'Created' });
    await expect(result).rejects.toMatchObject({ outcome: 'uncertain' });
  });
  it('treats a returned parent different from the dispatched mutation as uncertain', async () => {
    const result = firstValueFrom(
      service.update(1, { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }),
    );
    await Promise.resolve();
    http
      .expectOne(base + '/1')
      .flush({ ...detail, countryId: 8, country: { ...detail.country, id: 8 } });
    await expect(result).rejects.toMatchObject({ outcome: 'uncertain' });
  });
  it('maps only indexed bulk field errors and preserves idempotent zero archive counts', async () => {
    const importResult = firstValueFrom(
      service.bulkCreate([{ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }]),
    );
    await Promise.resolve();
    http
      .expectOne(base + '/bulk')
      .flush(
        { errors: { 'States[0].Code': ['Exists'], 'States[1].Code': ['Other'] } },
        { status: 400, statusText: 'Invalid' },
      );
    await expect(importResult).rejects.toMatchObject({
      outcome: 'rejected',
      fieldErrors: { 'states[0].code': 'Exists' },
    });
    const archive = firstValueFrom(service.bulkArchive([1, 2]));
    await Promise.resolve();
    http.expectOne(base + '/bulk-archive').flush({ archivedCount: 0 });
    expect(await archive).toBe(0);
  });
  it('requires documented lifecycle statuses and exact bulk-create count', async () => {
    for (const [action, requestUrl, method] of [
      ['archive', base + '/1', 'DELETE'],
      ['restore', base + '/1/restore', 'POST'],
    ] as const) {
      const result = firstValueFrom(service[action](1));
      await Promise.resolve();
      const request = http.expectOne(requestUrl);
      expect(request.request.method).toBe(method);
      request.flush(null, { status: 204, statusText: 'No Content' });
      expect(await result).toBe(1);
    }
    const created = firstValueFrom(
      service.bulkCreate([{ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }]),
    );
    await Promise.resolve();
    http
      .expectOne(base + '/bulk')
      .flush({ createdCount: 1 }, { status: 201, statusText: 'Created' });
    expect(await created).toBe(1);
  });
});
