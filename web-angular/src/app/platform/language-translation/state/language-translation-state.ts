import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, tap } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import type {
  CollectionPageRequest,
  CollectionSearchChange,
  CollectionSource,
} from '../../../shared/ui/public-api';
import { LanguageTranslationService } from '../services/language-translation-service';
import { translationAllowed } from '../language-translation-access';
import {
  resolveTranslationSource,
  type LanguageTranslationRow,
  type TranslationQuery,
  type TranslationSettings,
} from '../types/language-translation';
const initialQuery: TranslationQuery = {
  source: '',
  baseLanguage: 'en',
  targetLanguage: 'ar',
  status: 'all',
  search: '',
  page: 1,
  pageSize: 25,
};
@Injectable()
export class LanguageTranslationState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(LanguageTranslationService);
  private readonly denied = signal<Session | null>(null);
  private readonly criteria = signal<TranslationQuery>(initialQuery);
  private readonly searchEvents = new Subject<string>();
  readonly searchDraft = signal('');
  readonly query = this.criteria.asReadonly();
  readonly canRead = computed(
    () =>
      translationAllowed(this.auth.readIdentity()) && this.auth.readIdentity() !== this.denied(),
  );
  private readonly actor = computed(() => (this.canRead() ? this.auth.readIdentity() : null));
  private readonly settingsRead = createScopedRead(this.actor, translationAllowed, (actor) =>
    this.service.settings().pipe(tap({ error: (error: unknown) => this.readFailed(actor, error) })),
  );
  readonly settingsView = this.settingsRead.state;
  readonly settings = computed<TranslationSettings | null>(() => {
    const state = this.settingsView();
    return state.kind === 'ready' ? state.data : null;
  });
  readonly sourceId = computed(() => {
    const settings = this.settings();
    return settings ? resolveTranslationSource(this.query().source, settings) : '';
  });
  private readonly scope = computed(() => {
    const actor = this.actor(),
      source = this.sourceId();
    return actor && source ? { actor, query: { ...this.query(), source } } : null;
  });
  private readonly textRead = createScopedRead(
    this.scope,
    (scope) => translationAllowed(scope.actor) && scope.actor !== this.denied(),
    (scope) =>
      this.service
        .list(scope.query)
        .pipe(tap({ error: (error: unknown) => this.readFailed(scope.actor, error) })),
  );
  readonly textsView = this.textRead.state;
  readonly pending = computed(() => this.settingsRead.pending() || this.textRead.pending());
  readonly source = computed<CollectionSource<LanguageTranslationRow>>(() => {
    const query = {
      scopeKey: 'system-translations:' + (this.actor()?.userId ?? 'anonymous'),
      criteriaKey: JSON.stringify({ ...this.query(), source: this.sourceId() }),
      pageIndex: this.query().page - 1,
      pageSize: this.query().pageSize,
    };
    if (!this.canRead()) return { query, kind: 'forbidden' };
    const settings = this.settingsView(),
      texts = this.textsView();
    if (settings.kind === 'error' || settings.kind === 'forbidden')
      return { query, kind: settings.kind };
    if (settings.kind === 'ready' && !settings.data.sources.length)
      return { query, kind: 'ready', result: { query, rows: [], total: 0, hasNextPage: false } };
    if (texts.kind !== 'ready') return { query, kind: texts.kind };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        rows: texts.data.items,
        total: texts.data.totalCount,
        hasNextPage: this.query().page * this.query().pageSize < texts.data.totalCount,
      },
    };
  });
  readonly id = (row: LanguageTranslationRow) => row.key;
  readonly pageSizes: readonly number[] = [10, 25, 50, 100];
  constructor() {
    this.searchEvents
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((search) => this.patch({ search }));
    effect(() => {
      this.auth.readIdentity();
      untracked(() => {
        this.criteria.set(initialQuery);
        this.searchDraft.set('');
        this.searchEvents.next('');
      });
    });
    inject(DestroyRef).onDestroy(() => this.searchEvents.complete());
  }
  patch(
    patch: Partial<
      Pick<TranslationQuery, 'source' | 'baseLanguage' | 'targetLanguage' | 'status' | 'search'>
    >,
  ): void {
    if (this.canRead()) this.criteria.update((current) => ({ ...current, ...patch, page: 1 }));
  }
  changeSearch(change: CollectionSearchChange): void {
    if (!this.canRead() || !('value' in change) || change.value.length > 200) return;
    this.searchDraft.set(change.value);
    this.searchEvents.next(change.value);
  }
  changePage(page: CollectionPageRequest): void {
    if (
      !this.canRead() ||
      !this.pageSizes.includes(page.pageSize) ||
      !Number.isSafeInteger(page.pageIndex) ||
      page.pageIndex < 0
    )
      return;
    this.criteria.update((current) => ({
      ...current,
      page: page.pageSize === current.pageSize ? page.pageIndex + 1 : 1,
      pageSize: page.pageSize,
    }));
  }
  refresh(): void {
    this.settingsRead.refresh();
    this.textRead.refresh();
  }
  deny(actor: Session): void {
    if (this.auth.readIdentity() === actor) this.denied.set(actor);
  }
  private readFailed(actor: Session, error: unknown): void {
    if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) this.deny(actor);
  }
}
