import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { csrfSchema, loginResultSchema, sessionSchema, type Credentials } from '../types/auth-contracts';

@Injectable({ providedIn: 'root' })
export class BrowserAuthService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private token: string | null = null;
  private tokenRequest: Promise<string> | null = null;

  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin) throw new Error('An exact HTTPS API origin is required.');
  }

  async csrf(): Promise<string> {
    if (this.token) return this.token;
    this.tokenRequest ??= firstValueFrom(this.http.get<unknown>(this.origin + '/api/v1/browser-auth/csrf', { withCredentials: true })
      .pipe(timeout(10_000))).then(value => this.token = csrfSchema.parse(value).requestToken).finally(() => { this.tokenRequest = null; });
    return this.tokenRequest;
  }

  resetCsrf(): void { this.token = null; }
  async session() {
    const value = await firstValueFrom(this.http.get<unknown>(this.origin + '/api/v1/browser-auth/session', { withCredentials: true }).pipe(timeout(10_000)));
    return sessionSchema.parse(value).user;
  }
  async login(credentials: Credentials) { return loginResultSchema.parse(await this.post('login', credentials)); }
  async selectTenant(token: string, tenantId: string) { return loginResultSchema.parse(await this.post('select-tenant', { tenantSelectionToken: token, tenantId })); }
  async selectCompany(token: string, companyId: number) { return sessionSchema.parse(await this.post('select-company', { companySelectionToken: token, companyId })); }
  async refresh() { return sessionSchema.parse(await this.post('refresh', {})).user; }
  async switchCompany(companyId:number) { return sessionSchema.parse(await this.post('switch-company', {companyId})).user; }
  async logout(): Promise<void> { await this.post('logout', {}); this.resetCsrf(); }
  async requestPasswordReset(email: string): Promise<void> {
    await firstValueFrom(this.http.post(this.origin + '/api/v1/auth/forgetPassword', { email }).pipe(timeout(10_000)));
  }
  private async post(action: string, body: object): Promise<unknown> {
    const token = await this.csrf();
    return firstValueFrom(this.http.post<unknown>(this.origin + '/api/v1/browser-auth/' + action, body, {
      withCredentials: true, headers: { 'X-ERP-XSRF': token },
    }).pipe(timeout(10_000)));
  }
}
