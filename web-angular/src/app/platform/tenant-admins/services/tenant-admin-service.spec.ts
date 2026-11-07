import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { CommandFailure } from '../../../shared/data/public-api';
import { TenantAdminService } from './tenant-admin-service';
import { adminFixture } from '../tenant-admin.fixture';
const origin = 'https://localhost:7037';
const draft = {
  firstName: 'Ali',
  lastName: 'Hassan',
  userName: 'ali',
  email: 'ali@example.test',
  password: 'Example123',
  tenantIds: ['t'],
  defaultTenantId: 't',
};
describe('Tenant administrator cookie/CSRF transport', () => {
  let service: TenantAdminService, http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: { csrf: () => Promise.resolve('token') } },
      ],
    });
    service = TestBed.inject(TenantAdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('reads complete unpaged accounts and rejects a mismatched detail identity', async () => {
    const read = firstValueFrom(service.all());
    const request = http.expectOne(origin + '/api/v1/tenantAdmins/getAll');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.params.keys()).toEqual([]);
    request.flush([adminFixture]);
    expect((await read).length).toBe(1);
    const detail = firstValueFrom(service.detail('other'));
    const rejected = expect(detail).rejects.toThrow();
    http.expectOne(origin + '/api/v1/tenantAdmins/get/other').flush(adminFixture);
    await rejected;
  });
  it('requires exact command statuses, sends CSRF, omits blank edit password and archives with DELETE204', async () => {
    const create = firstValueFrom(service.create(draft));
    await Promise.resolve();
    const request = http.expectOne(origin + '/api/v1/tenantAdmins/create');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('token');
    expect(request.request.withCredentials).toBe(true);
    request.flush(adminFixture, { status: 201, statusText: 'Created' });
    await create;
    const editDraft = {
      firstName: draft.firstName,
      lastName: draft.lastName,
      userName: draft.userName,
      email: draft.email,
      tenantIds: draft.tenantIds,
      defaultTenantId: draft.defaultTenantId,
      isDisabled: true,
    };
    const edit = firstValueFrom(service.update(adminFixture.id, editDraft));
    await Promise.resolve();
    const update = http.expectOne(origin + '/api/v1/tenantAdmins/update/' + adminFixture.id);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(editDraft);
    update.flush({ ...adminFixture, isDisabled: true });
    await edit;
    const archived = firstValueFrom(service.archive(adminFixture.id));
    await Promise.resolve();
    const remove = http.expectOne(origin + '/api/v1/tenantAdmins/delete/' + adminFixture.id);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null, { status: 204, statusText: 'No Content' });
    await archived;
  });
  it('keeps known public titles separate from raw/unknown details and treats malformed success as uncertain', async () => {
    const duplicate = firstValueFrom(service.create(draft));
    const rejected = expect(duplicate).rejects.toMatchObject({
      outcome: 'rejected',
      codes: ['TenantAdmin.DuplicateEmail'],
    });
    await Promise.resolve();
    http
      .expectOne(origin + '/api/v1/tenantAdmins/create')
      .flush(
        { title: 'TenantAdmin.DuplicateEmail', detail: 'PRIVATE' },
        { status: 409, statusText: 'Conflict' },
      );
    await rejected;
    const broken = firstValueFrom(service.create(draft));
    const uncertain = expect(broken).rejects.toBeInstanceOf(CommandFailure);
    await Promise.resolve();
    http
      .expectOne(origin + '/api/v1/tenantAdmins/create')
      .flush({}, { status: 201, statusText: 'Created' });
    await uncertain;
  });
});
