import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { classifyCommandFailure, CommandFailure } from '../../../shared/data/public-api';
import { parseTenantAdmin, parseTenantAdmins, tenantAdminId } from '../types/tenant-admin';
import { adminFields, type AdminMutation } from '../validation/tenant-admin-mutation';

const publicCodes = new Set([
  'TenantAdmin.NotFound',
  'TenantAdmin.DuplicateEmail',
  'TenantAdmin.DuplicateUserName',
  'TenantAdmin.InvalidTenants',
  'TenantAdmin.AdminSeatLimitReached',
  'DuplicateEmail',
  'DuplicateUserName',
  'InvalidEmail',
  'InvalidUserName',
  'PasswordTooShort',
  'PasswordRequiresDigit',
  'PasswordRequiresLower',
  'PasswordRequiresUpper',
  'PasswordRequiresNonAlphanumeric',
  'PasswordRequiresUniqueChars',
  'PasswordMismatch',
]);
@Injectable({ providedIn: 'root' })
export class TenantAdminService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required');
  }
  all() {
    return this.http
      .get<unknown>(this.origin + '/api/v1/tenantAdmins/getAll', { withCredentials: true })
      .pipe(timeout(10000), map(parseTenantAdmins));
  }
  detail(input: string) {
    return defer(() => {
      const id = tenantAdminId(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/tenantAdmins/get/' + encodeURIComponent(id), {
          withCredentials: true,
        })
        .pipe(
          timeout(10000),
          map((body) => {
            const record = parseTenantAdmin(body);
            if (record.id !== id) throw Error('Invalid administrator detail identity');
            return record;
          }),
        );
    });
  }
  create(payload: AdminMutation) {
    return this.write('create', null, payload).pipe(map(requireRecord));
  }
  update(id: string, payload: AdminMutation) {
    return this.write('update', tenantAdminId(id), payload).pipe(map(requireRecord));
  }
  archive(id: string) {
    return this.write('delete', tenantAdminId(id), null).pipe(map(() => undefined));
  }
  private write(
    action: 'create' | 'update' | 'delete',
    id: string | null,
    payload: AdminMutation | null,
  ) {
    return defer(() => {
      let dispatched = false;
      return from(this.security.csrf()).pipe(
        switchMap((token) => {
          dispatched = true;
          return this.http.request<unknown>(
            action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE',
            this.origin +
              '/api/v1/tenantAdmins/' +
              action +
              (id ? '/' + encodeURIComponent(id) : ''),
            {
              body: payload,
              withCredentials: true,
              observe: 'response',
              headers: { 'X-ERP-XSRF': token },
            },
          );
        }),
        timeout(10000),
        map((response) => {
          if (response.status !== (action === 'create' ? 201 : action === 'update' ? 200 : 204))
            throw Error('Invalid administrator command status');
          if (action === 'delete') return null;
          const record = parseTenantAdmin(response.body);
          if ((id !== null && record.id !== id) || record.lifecycleStatus !== 'active')
            throw Error('Invalid administrator command identity/lifecycle');
          return record;
        }),
        catchError((error: unknown) => {
          const failure = classifyCommandFailure(error, dispatched, adminFields);
          const body: unknown = error instanceof HttpErrorResponse ? error.error : null;
          const codes = failure.codes.filter((code) => publicCodes.has(code));
          if (
            failure.outcome === 'rejected' &&
            typeof body === 'object' &&
            body !== null &&
            'title' in body &&
            typeof body.title === 'string' &&
            publicCodes.has(body.title)
          )
            codes.push(body.title);
          return throwError(
            () =>
              new CommandFailure(failure.outcome, failure.status, failure.fieldErrors, [
                ...new Set(codes),
              ]),
          );
        }),
      );
    });
  }
}
function requireRecord(record: ReturnType<typeof parseTenantAdmin> | null) {
  if (!record) throw new CommandFailure('uncertain', null);
  return record;
}
