import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  defer,
  from,
  map,
  switchMap,
  throwError,
  timeout,
  type Observable,
} from 'rxjs';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { BrowserMutationSecurity } from '../../auth/session.public-api';
import { classifyCommandFailure } from '../../../shared/data/public-api';
import {
  errorLogParameters,
  parseErrorLogCriteria,
  parseErrorLogDetail,
  parseErrorLogId,
  parseErrorLogPage,
  parseErrorLogSettings,
  parseXlsxErrorLogExport,
  type ErrorLogCriteria,
  type ErrorLogDetail,
  type ErrorLogExport,
  type ErrorLogPage,
  type ErrorLogSettings,
} from '../types/error-log';

@Injectable({ providedIn: 'root' })
export class SystemErrorLogService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly endpoint = this.origin + '/api/v1/system-error-logs';
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw new Error('An exact HTTPS API origin is required');
  }
  list(criteria: ErrorLogCriteria): Observable<ErrorLogPage> {
    return defer(() => {
      const parsed = parseErrorLogCriteria(criteria);
      const read = parsed.columnFilters
        ? from(this.security.csrf()).pipe(
            switchMap((token) =>
              this.http.post<unknown>(this.endpoint + '/query', parsed, {
                withCredentials: true,
                headers: { 'X-ERP-XSRF': token },
                observe: 'response',
              }),
            ),
            timeout(10000),
            map((response) => {
              if (response.status !== 200) throw Error('Invalid system error log query response');
              return response.body;
            }),
          )
        : this.read(this.endpoint, errorLogParameters(parsed));
      return read.pipe(
        map((body) => {
          const page = parseErrorLogPage(body);
          if (page.page !== parsed.page || page.pageSize !== parsed.pageSize)
            throw new Error('Mismatched system error log page');
          return page;
        }),
      );
    });
  }
  detail(id: string): Observable<ErrorLogDetail> {
    return defer(() => {
      const parsedId = parseErrorLogId(id);
      return this.read(this.endpoint + '/' + encodeURIComponent(parsedId)).pipe(
        map((body) => parseErrorLogDetail(body, parsedId)),
      );
    });
  }
  settings(): Observable<ErrorLogSettings> {
    return this.read(this.endpoint + '/settings').pipe(map(parseErrorLogSettings));
  }
  saveSettings(retentionDays: number, expectedRevision: number): Observable<ErrorLogSettings> {
    return defer(() => {
      const retention = parseRetentionDays(retentionDays);
      const revision = parseRevision(expectedRevision);
      let dispatched = false;
      return from(this.security.csrf()).pipe(
        switchMap((token) => {
          dispatched = true;
          return this.http.put<unknown>(
            this.endpoint + '/settings',
            { retentionDays: retention, expectedRevision: revision },
            { withCredentials: true, observe: 'response', headers: { 'X-ERP-XSRF': token } },
          );
        }),
        timeout(10000),
        map((response) => {
          if (response.status !== 200)
            throw new Error('Invalid system error log settings response status');
          return parseErrorLogSettings(response.body);
        }),
        catchError((error: unknown) =>
          throwError(() =>
            classifyCommandFailure(error, dispatched, ['retentionDays', 'Request.RetentionDays']),
          ),
        ),
      );
    });
  }
  exportXlsx(criteria: ErrorLogCriteria): Observable<ErrorLogExport> {
    return defer(() => {
      const parsed = parseErrorLogCriteria(criteria);
      const response = parsed.columnFilters
        ? from(this.security.csrf()).pipe(
            switchMap((token) =>
              this.http.post(this.endpoint + '/export/query', parsed, {
                withCredentials: true,
                headers: { 'X-ERP-XSRF': token },
                observe: 'response',
                responseType: 'blob',
              }),
            ),
          )
        : this.http.get(this.endpoint + '/export', {
            withCredentials: true,
            observe: 'response',
            params: errorLogParameters(parsed),
            responseType: 'blob' as const,
          });
      return response.pipe(
        timeout(10000),
        map((response) => {
          if (response.status !== 200)
            throw new Error('Invalid system error log export response status');
          return parseXlsxErrorLogExport(
            response.body,
            response.headers.get('content-disposition'),
            response.headers.get('content-type'),
          );
        }),
      );
    });
  }
  private read(url: string, params: Record<string, string> = {}): Observable<unknown> {
    return this.http.get<unknown>(url, { withCredentials: true, observe: 'response', params }).pipe(
      timeout(10000),
      map((response) => {
        if (response.status !== 200) throw new Error('Invalid system error log response status');
        return response.body;
      }),
    );
  }
}
function parseRetentionDays(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > 3650)
    throw new Error('Invalid retention days');
  return value;
}
function parseRevision(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid expected revision');
  return value;
}
