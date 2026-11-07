import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
import { catchError, map, of, throwError, timeout } from 'rxjs';
import { parseHealthReport } from '../types/operational-report';

@Injectable({ providedIn: 'root' })
export class AdvancedToolService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  readonly swaggerUrl = `${this.origin}/swagger/index.html`;
  readonly hangfireUrl = `${this.origin}/hangfire`;
  health() {
    return this.http.get<unknown>(`${this.origin}/health`, { withCredentials: true }).pipe(
      timeout(10_000),
      map(parseHealthReport),
      catchError((error: unknown) => {
        // ASP.NET returns the diagnostic JSON with503 when a dependency is unhealthy.
        if (error instanceof HttpErrorResponse && error.status === 503) {
          try {
            return of(parseHealthReport(error.error));
          } catch {
            return throwError(() => error);
          }
        }
        return throwError(() => error);
      }),
    );
  }
  hangfire() {
    return this.http
      .get(this.hangfireUrl, { withCredentials: true, responseType: 'text', observe: 'response' })
      .pipe(
        timeout(10_000),
        map((response) => {
          if (
            !response.headers.get('Content-Type')?.includes('text/html') ||
            !/Hangfire/i.test(response.body ?? '')
          ) {
            throw new Error('Hangfire did not return a dashboard document.');
          }
        }),
      );
  }
}
