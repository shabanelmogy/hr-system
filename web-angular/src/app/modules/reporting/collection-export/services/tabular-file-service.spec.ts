import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import {
  AuthSession,
  BrowserMutationSecurity,
  type Session,
} from '../../../../platform/auth/session.public-api';
import { sessionFixture } from '../../../../platform/auth/auth.fixture';
import { TabularFileService } from './tabular-file-service';

describe('Reporting tabular file transport', () => {
  const origin = 'https://fixture.test';
  const globalActor: Session = {
    ...sessionFixture,
    roles: ['super_admin'],
    permissions: ['GlobalDataExports:Export'],
  };
  function setup(actor = globalActor) {
    const identity = signal<Session | null>(actor);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: BrowserMutationSecurity, useValue: { csrf: async () => 'export-csrf' } },
      ],
    });
    return {
      service: TestBed.inject(TabularFileService),
      http: TestBed.inject(HttpTestingController),
      identity,
    };
  }
  afterEach(() => TestBed.resetTestingModule());
  it('selects the global formatter with exact body, credentials and CSRF, then validates the file response', async () => {
    const { service, http } = setup();
    const rows = [{ Name: 'مصر', Value: 2 }];
    const response = service.write(
      { actor: globalActor, format: 'csv', fileName: 'records', culture: 'ar', rows },
      new AbortController().signal,
    );
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/global-data-exports/csv/records/ar');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(rows);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('export-csrf');
    request.flush(new Blob(['\uFEFFName,Value\r\nمصر,2\r\n'], { type: 'text/csv' }), {
      headers: { 'content-type': 'text/csv; charset=utf-8' },
    });
    expect((await response).fileName).toBe('records.csv');
    http.verify();
  });
  it('retains the tenant formatter route and requires an export grant independently of source View', async () => {
    const tenant = { ...sessionFixture, roles: ['admin'], permissions: ['Analytics:Export'] };
    const { service, http, identity } = setup(tenant);
    const controller = new AbortController();
    const response = service.write(
      { actor: tenant, format: 'xlsx', fileName: 'records', culture: 'en', rows: [{ Value: 2 }] },
      controller.signal,
    );
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/export/exportExcel/records/en');
    request.flush(
      new Blob([new Uint8Array([80, 75, 3, 4])], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      {
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
    );
    expect((await response).fileName).toBe('records.xlsx');
    identity.set({ ...tenant, permissions: [] });
    expect(service.allowed()).toBe(false);
    http.verify();
  });
  it('never dispatches for a replaced actor or unsafe file name', async () => {
    const { service, http } = setup();
    await expect(
      service.write(
        { actor: {}, format: 'csv', fileName: 'records', culture: 'en', rows: [{ Value: 2 }] },
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    await expect(
      service.write(
        {
          actor: globalActor,
          format: 'csv',
          fileName: '../secret',
          culture: 'en',
          rows: [{ Value: 2 }],
        },
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    http.expectNone(() => true);
  });
});
