import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as z from 'zod/mini';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import { classifyCommandFailure, CommandFailure } from '../../../../shared/data/public-api';
import type { TenantMutation } from '../validation/tenant-mutation';
import {
  parseTenantDetail,
  tenantDetailSchema,
  parseTenantId,
  parseTenantPage,
  tenantQueryParameters,
  type TenantPage,
  type TenantQuery,
  type TenantRecord,
} from '../types/tenant';

@Injectable({ providedIn: 'root' })
export class TenantManagementService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);

  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required.');
  }

  page(input: TenantQuery) {
    return defer(() => {
      const { query, params } = tenantQueryParameters(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/tenants/getPage', { withCredentials: true, params })
        .pipe(
          timeout(10000),
          map((value): TenantPage => parseTenantPage(value, query)),
        );
    });
  }
  all() {
    return this.http
      .get<unknown>(this.origin + '/api/v1/tenants/getAll', { withCredentials: true })
      .pipe(
        timeout(10000),
        map((body): readonly TenantRecord[] => {
          const records = z.array(tenantDetailSchema).parse(body);
          if (
            new Set(records.map((record) => record.id)).size !== records.length ||
            records.some((record) => record.lifecycleStatus !== 'active')
          )
            throw Error('Invalid Tenant lookup response');
          return records;
        }),
      );
  }

  detail(input: string) {
    return defer(() => {
      const id = parseTenantId(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/tenants/get/' + encodeURIComponent(id), {
          withCredentials: true,
        })
        .pipe(
          timeout(10000),
          map((value): TenantRecord => {
            const tenant = parseTenantDetail(value);
            if (tenant.id !== id) throw Error('Invalid Tenant detail identity');
            return tenant;
          }),
        );
    });
  }

  create(draft: TenantMutation) {
    return this.write(null, draft, null);
  }

  update(id: string, draft: TenantMutation, rowVersion: string) {
    return this.write(parseTenantId(id), draft, requiredRowVersion(rowVersion));
  }

  private write(id: string | null, draft: TenantMutation, rowVersion: string | null) {
    return defer(() => {
      let dispatched = false;
      return from(this.security.csrf()).pipe(
        switchMap((token) => {
          dispatched = true;
          const body = id === null ? draft : { ...draft, rowVersion };
          return id === null
            ? this.http.post<unknown>(this.origin + '/api/v1/tenants/create', body, {
                withCredentials: true,
                headers: { 'X-ERP-XSRF': token },
                observe: 'response',
              })
            : this.http.put<unknown>(
                this.origin + '/api/v1/tenants/update/' + encodeURIComponent(id),
                body,
                {
                  withCredentials: true,
                  headers: { 'X-ERP-XSRF': token },
                  observe: 'response',
                },
              );
        }),
        timeout(10000),
        map((response): TenantRecord => {
          if ((id === null && response.status !== 201) || (id !== null && response.status !== 200))
            throw Error('Invalid Tenant command status');
          const tenant = parseTenantDetail(response.body);
          if (tenant.id !== id && id !== null) throw Error('Invalid Tenant command identity');
          if (tenant.lifecycleStatus !== 'active') throw Error('Invalid Tenant command lifecycle');
          return tenant;
        }),
        catchError((error: unknown) => throwError(() => tenantCommandFailure(error, dispatched))),
      );
    });
  }
}

const tenantCommandFields = [
  'identifier',
  'name',
  'isActive',
  'subscriptionStatus',
  'subscriptionStartedOn',
  'subscriptionEndsOn',
  'planName',
  'maxAdmins',
  'maxUsers',
  'billingEmail',
  'contactName',
  'contactPhone',
  'notes',
  'entitlements',
] as const;

const tenantPublicErrorCodes = new Set([
  'Tenant.NotFound',
  'Tenant.DuplicateIdentifier',
  'Tenant.InvalidEntitlement',
  'Tenant.ArchivedTenantRequiresRestore',
  'Tenant.SeatLimitBelowUsage',
  'Tenant.InvalidRequest',
  'Tenant.InvalidSubscriptionStatus',
  'Tenant.ConcurrencyTokenRequired',
  'Tenant.ConcurrencyConflict',
]);

/** This API reports known domain codes in ProblemDetails.title, unlike geography field errors. */
function tenantCommandFailure(error: unknown, dispatched: boolean): CommandFailure {
  const failure = classifyCommandFailure(error, dispatched, tenantCommandFields);
  const codes = failure.codes.filter((code) => tenantPublicErrorCodes.has(code));
  const body: unknown = error instanceof HttpErrorResponse ? error.error : null;
  if (
    failure.outcome === 'rejected' &&
    typeof body === 'object' &&
    body !== null &&
    'title' in body &&
    typeof body.title === 'string' &&
    tenantPublicErrorCodes.has(body.title)
  )
    codes.push(body.title);
  return new CommandFailure(failure.outcome, failure.status, failure.fieldErrors, [
    ...new Set(codes),
  ]);
}

function requiredRowVersion(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 1000)
    throw Error('A fresh Tenant rowVersion is required.');
  return value;
}
