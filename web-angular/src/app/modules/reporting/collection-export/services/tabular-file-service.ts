import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
import { AuthSession, BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import {
  abortExport,
  exportRead,
  validateTabularRecords,
  type TabularFile,
  type TabularFileRequest,
  type TabularFileWriter,
} from '../../../../shared/data/public-api';

@Injectable({ providedIn: 'root' })
export class TabularFileService implements TabularFileWriter {
  readonly actor = inject(AuthSession).readIdentity;
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly denied = signal<object | null>(null);
  private readonly global = computed(
    () => this.actor()?.roles.some((role) => role.trim().toLowerCase() === 'super_admin') ?? false,
  );
  readonly allowed = computed(() => {
    const actor = this.actor();
    return (
      !!actor &&
      actor !== this.denied() &&
      actor.permissions.includes(this.global() ? 'GlobalDataExports:Export' : 'Analytics:Export')
    );
  });
  constructor() {
    const origin = new URL(this.origin);
    if (origin.protocol !== 'https:' || origin.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required');
  }
  async write(request: TabularFileRequest, signal: AbortSignal): Promise<TabularFile> {
    const current = () => {
      abortExport(signal);
      if (!this.allowed() || this.actor() !== request.actor)
        throw Error('Export authority changed');
    };
    current();
    if (
      !['xlsx', 'csv'].includes(request.format) ||
      !['en', 'ar'].includes(request.culture) ||
      !/^[\p{Letter}\p{Number} _-]{1,90}$/u.test(request.fileName)
    )
      throw Error('Invalid export metadata');
    validateTabularRecords(request.rows);
    const global = this.global();
    const csrf = await this.security.csrf();
    current();
    const endpoint = global
      ? '/api/v1/global-data-exports/' + request.format
      : '/api/v1/export/' + (request.format === 'xlsx' ? 'exportExcel' : 'exportCsv');
    const name = request.fileName + '.' + request.format;
    try {
      const response = await exportRead(
        this.http
          .post(
            this.origin +
              endpoint +
              '/' +
              encodeURIComponent(request.fileName) +
              '/' +
              request.culture,
            request.rows,
            {
              withCredentials: true,
              headers: { 'X-ERP-XSRF': csrf },
              observe: 'response',
              responseType: 'blob',
            },
          )
          .pipe(timeout(60000)),
        signal,
      );
      current();
      const blob = response.body;
      const expected =
        request.format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv';
      if (
        response.status !== 200 ||
        !blob ||
        !blob.size ||
        blob.size > 64 * 1024 * 1024 ||
        response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== expected
      )
        throw Error('Invalid export response');
      if (request.format === 'xlsx') {
        const magic = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
        if (magic[0] !== 80 || magic[1] !== 75 || magic[2] !== 3 || magic[3] !== 4)
          throw Error('Invalid Excel file');
      }
      current();
      return { blob, fileName: name };
    } catch (error: unknown) {
      if (
        this.actor() === request.actor &&
        error instanceof HttpErrorResponse &&
        error.status === 403
      )
        this.denied.set(request.actor);
      throw error;
    }
  }
}
