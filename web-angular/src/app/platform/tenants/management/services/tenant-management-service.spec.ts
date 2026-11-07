import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import { defaultTenantQuery } from '../types/tenant';
import { TenantManagementService } from './tenant-management-service';
import { CommandFailure } from '../../../../shared/data/public-api';

const tenant = {
  id: 'tenant-1',
  identifier: 'ACME',
  name: 'Acme',
  isActive: true,
  subscriptionStatus: 'active',
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.999Z',
  planName: null,
  maxAdmins: 2,
  maxUsers: 10,
  adminCount: 1,
  userCount: 3,
  totalUserCount: 4,
  companyCount: 1,
  billingEmail: null,
  contactName: null,
  contactPhone: null,
  notes: null,
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null,
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
  purgeScheduledOn: null,
  rowVersion: 'AQID',
  entitlements: [],
};
const draft = {
  identifier: 'ACME',
  name: 'Acme',
  isActive: true,
  subscriptionStatus: 'active' as const,
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.999Z',
  planName: null,
  maxAdmins: 2,
  maxUsers: 10,
  billingEmail: null,
  contactName: null,
  contactPhone: null,
  notes: null,
  entitlements: [],
};

describe('Tenant management cookie transport', () => {
  const origin = 'https://localhost:7037';
  let service: TenantManagementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: { csrf: () => Promise.resolve('csrf') } },
      ],
    });
    service = TestBed.inject(TenantManagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('sends the exact page query with retained credentials', async () => {
    const result = firstValueFrom(service.page(defaultTenantQuery));
    const request = http.expectOne((item) => item.url === origin + '/api/v1/tenants/getPage');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.get('includeArchived')).toBe('false');
    request.flush({
      items: [tenant],
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
    expect((await result).items[0]?.id).toBe('tenant-1');
  });
  it('reads the complete Tenant assignment catalog without a page-size truncation', async () => {
    const result = firstValueFrom(service.all());
    const request = http.expectOne(origin + '/api/v1/tenants/getAll');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.keys()).toEqual([]);
    request.flush(Array.from({ length: 250 }, (_, index) => ({ ...tenant, id: 't-' + index })));
    expect((await result).length).toBe(250);
  });

  it('gets details and sends CSRF-protected create/update, preserving the real rowVersion', async () => {
    const detail = firstValueFrom(service.detail('tenant-1'));
    const detailRequest = http.expectOne(origin + '/api/v1/tenants/get/tenant-1');
    expect(detailRequest.request.withCredentials).toBe(true);
    detailRequest.flush(tenant);
    expect((await detail).rowVersion).toBe('AQID');

    const create = firstValueFrom(service.create(draft));
    await Promise.resolve();
    const createRequest = http.expectOne(origin + '/api/v1/tenants/create');
    expect(createRequest.request.headers.get('X-ERP-XSRF')).toBe('csrf');
    createRequest.flush(tenant, { status: 201, statusText: 'Created' });
    expect((await create).id).toBe('tenant-1');

    const update = firstValueFrom(service.update('tenant-1', draft, 'AQID'));
    await Promise.resolve();
    const updateRequest = http.expectOne(origin + '/api/v1/tenants/update/tenant-1');
    expect(updateRequest.request.body).toEqual({ ...draft, rowVersion: 'AQID' });
    updateRequest.flush({ ...tenant, rowVersion: 'BAUG' });
    expect((await update).rowVersion).toBe('BAUG');
  });
  it('retains exact public Tenant ProblemDetails codes without exposing the diagnostic detail', async () => {
    const outcome = firstValueFrom(service.update('tenant-1', draft, 'AQID')).catch(
      (error: unknown) => error,
    );
    await Promise.resolve();
    http.expectOne(origin + '/api/v1/tenants/update/tenant-1').flush(
      {
        title: 'Tenant.ConcurrencyConflict',
        detail: 'Private storage diagnostic must not be copied',
        type: 'urn:erp:error:Tenant.ConcurrencyConflict',
      },
      { status: 409, statusText: 'Conflict' },
    );
    const failure = await outcome;
    expect(failure).toBeInstanceOf(CommandFailure);
    expect(failure).toMatchObject({ outcome: 'rejected', codes: ['Tenant.ConcurrencyConflict'] });
    expect(String(failure)).not.toContain('Private storage');
  });
  it('does not promote arbitrary ProblemDetails titles into domain error codes', async () => {
    const outcome = firstValueFrom(service.create(draft)).catch((error: unknown) => error);
    await Promise.resolve();
    http.expectOne(origin + '/api/v1/tenants/create').flush(
      {
        title: 'Private.UnrecognizedCode',
        detail: 'Private diagnostic',
        errors: { 'Private.InternalCode': [], Identifier: ['Choose a unique identifier'] },
      },
      { status: 400, statusText: 'Bad request' },
    );
    expect(await outcome).toMatchObject({
      outcome: 'rejected',
      codes: [],
      fieldErrors: { identifier: 'Choose a unique identifier' },
    });
  });
});
