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
import { LocalizationService, type TextReset, type TextWrite } from '../../localization/public-api';
import { classifyCommandFailure } from '../../../shared/data/public-api';
import {
  translationPageSchema,
  translationSettingsSchema,
  type TranslationQuery,
} from '../types/language-translation';

@Injectable({ providedIn: 'root' })
export class LanguageTranslationService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  private readonly runtime = inject(LocalizationService);
  private readonly endpoint = this.origin + '/api/v1/system-ui-localizations';
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw new Error('An exact HTTPS API origin is required');
  }
  settings() {
    return this.http.get<unknown>(this.endpoint + '/settings', { withCredentials: true }).pipe(
      timeout(10000),
      map((value) => translationSettingsSchema.parse(value)),
    );
  }
  list(query: TranslationQuery) {
    return defer(() => {
      if (
        !query.source ||
        !['en', 'ar'].includes(query.baseLanguage) ||
        !['en', 'ar'].includes(query.targetLanguage) ||
        !['all', 'missing', 'customized'].includes(query.status) ||
        query.search.length > 200 ||
        !Number.isSafeInteger(query.page) ||
        query.page < 1 ||
        ![10, 25, 50, 100].includes(query.pageSize)
      )
        throw Error('Invalid translation query');
      return this.http
        .get<unknown>(this.endpoint + '/texts', { withCredentials: true, params: { ...query } })
        .pipe(
          timeout(10000),
          map((body) => {
            const page = translationPageSchema.parse(body);
            if (
              page.page !== query.page ||
              page.pageSize !== query.pageSize ||
              page.items.length > page.pageSize ||
              page.items.length > page.totalCount ||
              new Set(page.items.map((row) => row.key)).size !== page.items.length
            )
              throw Error('Invalid translation page');
            return page;
          }),
        );
    });
  }
  update(request: TextWrite) {
    return this.write((token) => this.runtime.setText('system', request, token));
  }
  reset(request: TextReset) {
    return this.write((token) => this.runtime.resetText('system', request, token));
  }
  private write(operation: (token: string) => Observable<void>) {
    return defer(() => {
      let dispatched = false;
      return from(this.security.csrf()).pipe(
        switchMap((token) => {
          dispatched = true;
          return operation(token);
        }),
        map(() => undefined),
        timeout(10000),
        catchError((error: unknown) =>
          throwError(() =>
            classifyCommandFailure(error, dispatched, [
              'value',
              'Value',
              'Request.Value',
              'request.value',
            ]),
          ),
        ),
      );
    });
  }
}
