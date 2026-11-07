import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { CommandFailure } from '../../../shared/data/public-api';
import { AccountProfileService } from './account-profile-service';

describe('Own account direct API transport', () => {
  const origin = 'https://api.example.test';
  const info = {
    id: 'actor-a',
    email: 'a@example.test',
    userName: 'admin',
    firstName: 'First',
    lastName: 'Last',
  };
  let service: AccountProfileService;
  let http: HttpTestingController;
  const csrf = vi.fn(() => Promise.resolve('account-test-token'));

  beforeEach(() => {
    csrf.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ERP_API_ORIGIN, useValue: origin },
        { provide: BrowserMutationSecurity, useValue: { csrf } },
      ],
    });
    service = TestBed.inject(AccountProfileService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('normalizes the actual nested command validation paths to shared fields', async () => {
    const write = firstValueFrom(service.update(info));
    const rejected = expect(write).rejects.toMatchObject({
      fieldErrors: { userName: 'Already used' },
    });
    await Promise.resolve();
    http
      .expectOne(origin + '/AccountInfo/UpdateInfo')
      .flush(
        { errors: { 'Request.UserName': ['Already used'] } },
        { status: 400, statusText: 'Bad Request' },
      );
    await rejected;
  });

  it('reads the actual own-user route with credentials and validates its immutable actor', async () => {
    const read = firstValueFrom(service.info('actor-a'));
    const request = http.expectOne(origin + '/AccountInfo/GetInfo');
    expect(request.request.withCredentials).toBe(true);
    request.flush(info);
    expect(await read).toEqual(info);

    const changed = firstValueFrom(service.info('actor-a'));
    const rejected = expect(changed).rejects.toThrow();
    http.expectOne(origin + '/AccountInfo/GetInfo').flush({ ...info, id: 'actor-b' });
    await rejected;
  });

  it('accepts no-photo nulls and rejects an unsafe image type', async () => {
    const empty = firstValueFrom(service.photo());
    http.expectOne(origin + '/AccountInfo/GetUserPhoto').flush({
      profilePicture: null,
      contentType: null,
    });
    expect(await empty).toBeNull();

    const unsafe = firstValueFrom(service.photo());
    const rejected = expect(unsafe).rejects.toThrow();
    http.expectOne(origin + '/AccountInfo/GetUserPhoto').flush({
      profilePicture: 'PHN2Zz4=',
      contentType: 'image/svg+xml',
    });
    await rejected;
  });

  it('updates only the own-profile fields through CSRF and requires confirmed 204', async () => {
    const write = firstValueFrom(service.update(info));
    await Promise.resolve();
    const request = http.expectOne(origin + '/AccountInfo/UpdateInfo');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('account-test-token');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      id: info.id,
      userName: info.userName,
      firstName: info.firstName,
      lastName: info.lastName,
    });
    request.flush(null, { status: 204, statusText: 'No Content' });
    await write;

    const unexpected = firstValueFrom(service.update(info));
    const rejected = expect(unexpected).rejects.toBeInstanceOf(CommandFailure);
    await Promise.resolve();
    http.expectOne(origin + '/AccountInfo/UpdateInfo').flush({ success: true });
    await rejected;
  });

  it('uses multipart photo upload and explicit Remove without a JSON wrapper', async () => {
    const file = new File(['image fixture'], 'avatar.png', { type: 'image/png' });
    const upload = firstValueFrom(service.updatePhoto(file));
    await Promise.resolve();
    const request = http.expectOne(origin + '/AccountInfo/UpdateUserPicture');
    const body: unknown = request.request.body;
    if (!(body instanceof FormData)) throw new Error('Expected native multipart body');
    const uploaded = body.get('ProfilePicture');
    expect(uploaded).toBeInstanceOf(File);
    expect((uploaded as File).name).toBe(file.name);
    expect((uploaded as File).type).toBe(file.type);
    expect(body.has('Remove')).toBe(false);
    expect(request.request.headers.has('Content-Type')).toBe(false);
    request.flush(null, { status: 204, statusText: 'No Content' });
    await upload;

    const remove = firstValueFrom(service.updatePhoto(null));
    await Promise.resolve();
    const removal = http.expectOne(origin + '/AccountInfo/UpdateUserPicture');
    const removalBody: unknown = removal.request.body;
    if (!(removalBody instanceof FormData)) throw new Error('Expected native removal body');
    expect(removalBody.get('Remove')).toBe('true');
    expect(removalBody.has('ProfilePicture')).toBe(false);
    removal.flush(null, { status: 204, statusText: 'No Content' });
    await remove;
  });

  it('retains the actual Identity ProblemDetails code for field mapping', async () => {
    const write = firstValueFrom(
      service.changePassword({ currentPassword: 'Wrong123!', newPassword: 'Changed123!' }),
    );
    const rejected = expect(write).rejects.toMatchObject({ codes: ['PasswordMismatch'] });
    await Promise.resolve();
    http.expectOne(origin + '/AccountInfo/ChangePassword').flush(
      {
        title: 'PasswordMismatch',
        detail: 'Incorrect password.',
        type: 'urn:erp:error:PasswordMismatch',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await rejected;
  });

  it('preserves password characters and maps authoritative current-password errors', async () => {
    const passwords = { currentPassword: ' current! ', newPassword: ' NewPass123! ' };
    const write = firstValueFrom(service.changePassword(passwords));
    const rejected = expect(write).rejects.toMatchObject({
      status: 400,
      fieldErrors: { currentPassword: 'Incorrect password' },
    });
    await Promise.resolve();
    const request = http.expectOne(origin + '/AccountInfo/ChangePassword');
    expect(request.request.body).toEqual(passwords);
    request.flush(
      { errors: { CurrentPassword: ['Incorrect password'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    await rejected;
  });
});
