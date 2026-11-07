import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, from, map, switchMap, timeout } from 'rxjs';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import {
  auditParameters,
  parseAuditDetails,
  parseAuditFilters,
  parseAuditIdentity,
  parseAuditPage,
  type AuditCriteria,
  type AuditIdentity,
} from '../types/audit-trail';

@Injectable({ providedIn: 'root' })
export class SystemAuditService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly endpoint = this.origin + '/api/v1/system-audit-trail';
  private readonly security = inject(BrowserMutationSecurity);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required');
  }
  page(criteria: AuditCriteria = {}, cursor: string | null = null) {
    return defer(() => {
      const params = auditParameters(criteria, cursor);
      if (!criteria.columnFilters) return this.read(this.endpoint, params);
      return from(this.security.csrf()).pipe(
        switchMap((token) =>
          this.http.post<unknown>(
            this.endpoint + '/query',
            { ...criteria, ...(cursor === null ? {} : { cursor }), pageSize: 50 },
            {
              withCredentials: true,
              headers: { 'X-ERP-XSRF': token },
              observe: 'response',
            },
          ),
        ),
        timeout(10000),
        map((response) => {
          if (response.status !== 200) throw Error('Invalid system audit query response');
          return response.body;
        }),
      );
    }).pipe(map(parseAuditPage));
  }
  filters() {
    return this.read(this.endpoint + '/filters').pipe(map(parseAuditFilters));
  }
  detail(input: AuditIdentity) {
    return defer(() => {
      const identity = parseAuditIdentity(input);
      return this.read(
        this.endpoint + '/' + encodeURIComponent(identity.moduleCode) + '/' + identity.id,
      ).pipe(map((body) => parseAuditDetails(body, identity)));
    });
  }
  private read(url: string, params: Record<string, string> = {}) {
    return this.http.get<unknown>(url, { withCredentials: true, observe: 'response', params }).pipe(
      timeout(10000),
      map((response) => {
        if (response.status !== 200) throw Error('Invalid system audit response status');
        return response.body;
      }),
    );
  }
}
