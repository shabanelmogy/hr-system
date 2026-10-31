import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, defer, from, map, mergeMap, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import {
  InvalidPdfError,
  readBlobText,
  validatePdfDocument,
} from '../../../../shared/data/public-api';
import {
  GlobalReportFailure,
  parseGlobalReports,
  renderBody,
  type GlobalReport,
  type ReportFilters,
} from '../types/global-report';
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export async function reportFailure(error: unknown): Promise<GlobalReportFailure> {
  if (error instanceof InvalidPdfError) return new GlobalReportFailure('invalidPdf');
  if (!(error instanceof HttpErrorResponse)) return new GlobalReportFailure('error');
  if (error.status === 401 || error.status === 403) return new GlobalReportFailure('forbidden');
  if (error.status === 409) return new GlobalReportFailure('stale');
  const fields: Record<string, string> = {};
  if (error.status === 400) {
    try {
      let body: unknown = error.error;
      if (body instanceof Blob)
        body = body.size <= 65536 ? JSON.parse(await readBlobText(body)) : null;
      if (record(body) && record(body['errors']))
        for (const [key, value] of Object.entries(body['errors'])) {
          const field = /^(?:filters\.)?namear$/i.test(key)
            ? 'nameAr'
            : /^(?:filters\.)?nameen$/i.test(key)
              ? 'nameEn'
              : null;
          const message =
            typeof value === 'string'
              ? value
              : Array.isArray(value) && typeof value[0] === 'string'
                ? value[0]
                : null;
          if (field && message && message.length <= 500) fields[field] = message;
        }
    } catch {
      /* Untrusted binary errors stay generic; never render exception/HTML. */
    }
    return new GlobalReportFailure('validation', fields);
  }
  return new GlobalReportFailure('error');
}
@Injectable({ providedIn: 'root' })
export class GlobalReportService {
  private readonly http = inject(HttpClient);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly origin = inject(ERP_API_ORIGIN);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw new Error('An exact HTTPS API origin is required.');
  }
  catalog() {
    return this.http
      .get<unknown>(this.origin + '/api/v1/global-crystal-reports', {
        withCredentials: true,
        params: { entityKey: 'countries' },
      })
      .pipe(timeout(10000), map(parseGlobalReports));
  }
  render(report: GlobalReport, filters: ReportFilters, language: 'en' | 'ar') {
    return defer(() => {
      const body = renderBody(report, filters, language);
      return from(this.security.csrf(true)).pipe(
        switchMap((token) =>
          this.http
            .post(
              this.origin +
                '/api/v1/global-crystal-reports/' +
                encodeURIComponent(report.id) +
                '/render',
              body,
              { withCredentials: true, headers: { 'X-ERP-XSRF': token }, responseType: 'blob' },
            )
            .pipe(timeout(120000)),
        ),
      );
    }).pipe(
      mergeMap((blob) => from(validatePdfDocument(blob))),
      catchError((error: unknown) =>
        from(reportFailure(error)).pipe(mergeMap((failure) => throwError(() => failure))),
      ),
    );
  }
}
