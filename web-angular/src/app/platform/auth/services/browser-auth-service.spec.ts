import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { sessionFixture } from '../auth.fixture';
import { BrowserAuthService } from './browser-auth-service';

describe('Browser authentication transport', () => {
  let service: BrowserAuthService; let http: HttpTestingController;
  const base = 'https://localhost:7037/api/v1/browser-auth/';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ERP_API_ORIGIN, useValue: 'https://localhost:7037' }] });
    service = TestBed.inject(BrowserAuthService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); });

  it('deduplicates CSRF minting and sends credentials only to the exact API with Cookies', async () => {
    const first = service.csrf(); const second = service.csrf();
    const csrf = http.expectOne(base + 'csrf'); expect(csrf.request.withCredentials).toBe(true);
    csrf.flush({ requestToken: 'fixture-csrf' }); await Promise.all([first, second]);
    const pending = service.login({ userName: 'fixture', password: 'synthetic' }); await Promise.resolve();
    const login = http.expectOne(base + 'login'); expect(login.request.withCredentials).toBe(true);
    expect(login.request.headers.get('X-ERP-XSRF')).toBe('fixture-csrf');
    expect(login.request.body).toEqual({ userName: 'fixture', password: 'synthetic' });
    login.flush({ isAuthenticated: true, user: sessionFixture });
    expect((await pending).isAuthenticated).toBe(true);
  });

  it('renews the in-memory request token after an identity boundary', async () => {
    const initial = service.csrf(); http.expectOne(base + 'csrf').flush({ requestToken: 'anonymous' }); await initial;
    service.resetCsrf(); const bound = service.csrf();
    http.expectOne(base + 'csrf').flush({ requestToken: 'identity-bound' }); expect(await bound).toBe('identity-bound');
  });

  it('switches company once with Cookie credentials and CSRF, accepting only a sanitized session', async () => {
    const csrf = service.csrf();
    http.expectOne(base + 'csrf').flush({ requestToken: 'scoped-csrf' });
    await csrf;
    const pending = service.switchCompany(2); await Promise.resolve();
    const request = http.expectOne(base + 'switch-company');
    expect(request.request.body).toEqual({ companyId: 2 }); expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-ERP-XSRF')).toBe('scoped-csrf');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ isAuthenticated: true, user: { ...sessionFixture, companyId: 2 } });
    expect((await pending).companyId).toBe(2);
  });

  it('rejects a bearer response instead of accepting or persisting its tokens', async () => {
    const pending = service.session(); const assertion = expect(pending).rejects.toThrow();
    http.expectOne(base + 'session').flush({ isAuthenticated: true, user: sessionFixture, accessToken: 'untrusted' }); await assertion;
  });

  it('keeps the anonymous password request on the existing API contract without session credentials', async () => {
    const pending = service.requestPasswordReset('fixture@example.test');
    const request = http.expectOne('https://localhost:7037/api/v1/auth/forgetPassword');
    expect(request.request.withCredentials).toBe(false); expect(request.request.body).toEqual({ email: 'fixture@example.test' });
    request.flush(null); await pending;
  });

  it('rejects an insecure or path-bearing API origin', () => {
    TestBed.resetTestingModule(); TestBed.configureTestingModule({ providers: [provideHttpClient(), { provide: ERP_API_ORIGIN, useValue: 'https://localhost:7037/path' }] });
    expect(() => TestBed.inject(BrowserAuthService)).toThrow('exact HTTPS');
  });
});
