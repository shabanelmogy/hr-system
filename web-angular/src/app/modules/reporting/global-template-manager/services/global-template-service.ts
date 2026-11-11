import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { defer, from, map, switchMap, timeout, type Observable } from 'rxjs';
import { z } from 'zod';
import { ERP_API_ORIGIN } from '../../../../config/api-origin';
import type { GridFilters } from '../../../../shared/data/public-api';
import { parseGlobalTemplateFilters } from '../types/global-template-filters';
import { BrowserMutationSecurity } from '../../../../platform/auth/session.public-api';
import {
  parseGlobalTemplateCandidates,
  globalTemplateAccessSchema,
  globalTemplateRolePageSchema,
  globalTemplateDetailSchema,
  globalTemplateEntitySchema,
  globalTemplateDesignSourceSchema,
  globalTemplateDatabaseViewPageSchema,
  globalTemplateInspectionSchema,
  globalTemplatePageSchema,
  globalTemplateUploadTargetSchema,
  type GlobalTemplateEntity,
  type GlobalTemplateGrant,
  type GlobalTemplateDraftRequest,
} from '../types/global-template';

@Injectable({ providedIn: 'root' })
export class GlobalTemplateService {
  private readonly http = inject(HttpClient);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly base = inject(ERP_API_ORIGIN) + '/api/v1/global-crystal-reports/manage';
  entities() {
    return this.http.get<unknown>(this.base + '/entities', { withCredentials: true }).pipe(
      timeout(10000),
      map((body) => z.array(globalTemplateEntitySchema).parse(body)),
    );
  }
  designSources() {
    return this.http.get<unknown>(this.base + '/design-sources', { withCredentials: true }).pipe(
      timeout(15000),
      map((body) => z.array(globalTemplateDesignSourceSchema).max(1000).parse(body)),
    );
  }
  createDraft(request: GlobalTemplateDraftRequest) {
    return this.mutate('/drafts', request).pipe(
      map((body) => globalTemplateDetailSchema.parse(body)),
    );
  }
  databaseViews(sourceKey: GlobalTemplateEntity, search: string, page: number) {
    return this.http
      .get<unknown>(this.base + '/database-views', {
        withCredentials: true,
        params: { sourceKey, search, page, pageSize: 20 },
      })
      .pipe(
        timeout(20000),
        map((body) => globalTemplateDatabaseViewPageSchema.parse(body)),
      );
  }
  designerPackage(sourceKey: GlobalTemplateEntity) {
    return this.http
      .get(this.base + '/designer-package', {
        withCredentials: true,
        params: { sourceKey },
        responseType: 'blob',
      })
      .pipe(timeout(15000));
  }
  list(
    entityKey: GlobalTemplateEntity | '',
    search: string,
    pageIndex: number,
    pageSize: number,
    status = '',
    filters: GridFilters = [],
  ) {
    const rules = parseGlobalTemplateFilters(filters);
    if (rules.length) {
      return this.mutate('/query', {
        entityKey,
        search,
        page: pageIndex + 1,
        pageSize,
        status,
        filters: rules,
      }).pipe(map((body) => globalTemplatePageSchema.parse(body)));
    }
    return this.http
      .get<unknown>(this.base, {
        withCredentials: true,
        params: { entityKey, search, page: pageIndex + 1, pageSize, status },
      })
      .pipe(
        timeout(15000),
        map((body) => globalTemplatePageSchema.parse(body)),
      );
  }
  detail(id: string) {
    return this.http
      .get<unknown>(this.base + '/' + encodeURIComponent(id), { withCredentials: true })
      .pipe(
        timeout(15000),
        map((body) => globalTemplateDetailSchema.parse(body)),
      );
  }
  candidates(entityKey: GlobalTemplateEntity, search = '', pageIndex = 0, pageSize = 10) {
    return this.http
      .get<unknown>(this.base + '/deployment-candidates', {
        withCredentials: true,
        params: { entityKey, search, page: pageIndex + 1, pageSize },
      })
      .pipe(
        timeout(40000),
        map((body) => parseGlobalTemplateCandidates(body, search, pageIndex, pageSize)),
      );
  }
  upload(
    entityKey: GlobalTemplateEntity,
    file: File,
    description: string,
    reportId: string | null,
  ) {
    const form = this.form(entityKey, file);
    form.append('description', description);
    return this.mutate(reportId ? '/' + encodeURIComponent(reportId) + '/versions' : '', form).pipe(
      map((body) => globalTemplateDetailSchema.parse(body)),
    );
  }
  uploadTarget(entityKey: GlobalTemplateEntity, fileName: string) {
    return this.http
      .get<unknown>(this.base + '/upload-target', {
        withCredentials: true,
        params: { entityKey, fileName },
      })
      .pipe(
        timeout(15000),
        map((body) => globalTemplateUploadTargetSchema.parse(body)),
      );
  }
  replace(id: string, entityKey: GlobalTemplateEntity, file: File, rowVersion: string) {
    const form = this.form(entityKey, file);
    form.append('rowVersion', rowVersion);
    return this.mutate('/' + encodeURIComponent(id) + '/replace', form).pipe(
      map((body) => globalTemplateDetailSchema.parse(body)),
    );
  }
  inspect(entityKey: GlobalTemplateEntity, file: File) {
    return this.mutate('/inspect', this.form(entityKey, file)).pipe(
      map((body) => globalTemplateInspectionSchema.parse(body)),
    );
  }
  publish(id: string, versionId: string, rowVersion: string) {
    return this.mutate(
      `/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/publish`,
      { rowVersion },
    ).pipe(map((body) => globalTemplateDetailSchema.parse(body)));
  }
  revalidate(id: string, versionId: string) {
    return this.mutate(
      `/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/revalidate`,
      {},
    ).pipe(map((body) => globalTemplateDetailSchema.parse(body)));
  }
  verifyDatabase(id: string, versionId: string, rowVersion: string) {
    return this.mutate(
      `/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/verify-database`,
      { rowVersion },
      'POST',
      180000,
    ).pipe(map((body) => globalTemplateDetailSchema.parse(body)));
  }
  import(entityKey: GlobalTemplateEntity, sourceId: string, expectedSha256: string) {
    return this.mutate('/import', { entityKey, sourceId, expectedSha256 }).pipe(
      map((body) => globalTemplateDetailSchema.parse(body)),
    );
  }
  download(id: string, versionId: string) {
    return this.http
      .get(
        `${this.base}/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/source`,
        { withCredentials: true, responseType: 'blob' },
      )
      .pipe(timeout(40000));
  }
  schema(entityKey: GlobalTemplateEntity) {
    return this.http
      .get(this.base + '/schema', {
        withCredentials: true,
        params: { entityKey },
        responseType: 'blob',
      })
      .pipe(timeout(15000));
  }
  access(id: string) {
    return this.http
      .get<unknown>(`${this.base}/${encodeURIComponent(id)}/access`, { withCredentials: true })
      .pipe(
        timeout(15000),
        map((body) => globalTemplateAccessSchema.parse(body)),
      );
  }
  roles(entityKey: GlobalTemplateEntity, search: string, pageIndex: number, pageSize: number) {
    return this.http
      .get<unknown>(this.base + '/roles', {
        withCredentials: true,
        params: { entityKey, search, page: pageIndex + 1, pageSize },
      })
      .pipe(
        timeout(15000),
        map((body) => globalTemplateRolePageSchema.parse(body)),
      );
  }
  saveAccess(id: string, rowVersion: string, grants: readonly GlobalTemplateGrant[]) {
    return this.mutate(
      `/${encodeURIComponent(id)}/access`,
      { rowVersion, grants: grants.map(({ roleId, rights }) => ({ roleId, rights })) },
      'PUT',
    );
  }
  archive(id: string, rowVersion: string) {
    return this.mutate('/' + encodeURIComponent(id), { rowVersion }, 'DELETE');
  }
  private mutate(
    path: string,
    body: unknown,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST',
    timeoutMs = 45000,
  ): Observable<unknown> {
    return defer(() => from(this.security.csrf(true))).pipe(
      switchMap((token) =>
        this.http.request<unknown>(method, this.base + path, {
          body,
          withCredentials: true,
          headers: { 'X-ERP-XSRF': token },
        }),
      ),
      timeout(timeoutMs),
    );
  }
  private form(entityKey: GlobalTemplateEntity, file: File): FormData {
    const form = new FormData();
    form.append('entityKey', entityKey);
    form.append('file', file, file.name);
    return form;
  }
}

export function globalTemplateError(error: unknown): {
  key: string;
  message: string;
  fields: Record<string, string>;
} {
  if (error instanceof z.ZodError)
    return { key: 'globalTemplates.invalidCatalogResponse', message: '', fields: {} };
  if (!(error instanceof HttpErrorResponse))
    return { key: 'common.error', message: '', fields: {} };
  if (error.status === 200)
    return { key: 'globalTemplates.invalidCatalogResponse', message: '', fields: {} };
  if (error.status === 0)
    return { key: 'globalTemplates.connectionError', message: '', fields: {} };
  if (error.status === 401 || error.status === 403)
    return { key: 'authorization.forbidden.title', message: '', fields: {} };
  if (error.status === 409) return { key: 'globalTemplates.conflict', message: '', fields: {} };
  const body: unknown = error.error;
  const schema = z.object({
    errors: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { key: 'common.error', message: '', fields: {} };
  const fields: Record<string, string> = {};
  let message = '';
  for (const [field, value] of Object.entries(parsed.data.errors)) {
    const text = Array.isArray(value) ? value[0] : value;
    if (!text || text.length > 500 || /[<>]/.test(text)) continue;
    const fieldNames: Record<string, string> = {
      file: 'file',
      description: 'description',
      displayname: 'displayName',
      reportkey: 'reportKey',
      viewname: 'viewName',
      sourcekey: 'sourceKey',
      modulekey: 'moduleKey',
    };
    const control = fieldNames[field.toLowerCase()];
    if (control) fields[control] = text;
    if (field === 'CrystalReport.InvalidView') fields['viewName'] = text;
    if (field.startsWith('CrystalReport.')) message ||= text;
    if (
      [
        'CrystalReport.InvalidFile',
        'CrystalReport.SchemaMismatch',
        'CrystalReport.ParameterMismatch',
        'CrystalReport.SourceRejected',
        'CrystalReport.FileTooLarge',
      ].includes(field)
    )
      fields['file'] = text;
  }
  return { key: 'common.error', message, fields };
}
