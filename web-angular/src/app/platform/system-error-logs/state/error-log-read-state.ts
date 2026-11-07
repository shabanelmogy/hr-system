import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  pagedTabularSource,
  exportRead,
  type TabularColumn,
  type TabularExportSource,
} from '../../../shared/data/public-api';
import { systemErrorLogExportAllowed } from '../system-error-log-access';
import {
  parseErrorLogColumnFilters,
  errorLogColumnFilterJson,
} from '../types/error-log-column-filters';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, tap } from 'rxjs';
import type { Session } from '../../auth/session.public-api';
import { AuthSession } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import type {
  CollectionPageRequest,
  CollectionSearchChange,
  CollectionSource,
} from '../../../shared/ui/public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { systemErrorLogsAllowed } from '../system-error-log-access';
import {
  emptyErrorLogFilters,
  resolveErrorLogCriteria,
  type ErrorLogFilters,
} from '../types/error-log-filters';
import type { ErrorLogCriteria, ErrorLogPage, ErrorLogRow } from '../types/error-log';

interface ErrorLogScope {
  readonly actor: Session;
  readonly criteria: ErrorLogCriteria;
}

@Injectable()
export class ErrorLogReadState {
  exportSource(
    columns: readonly TabularColumn<ErrorLogRow>[],
    culture: 'en' | 'ar',
  ): TabularExportSource | null {
    const actor = this.auth.readIdentity(),
      criteria = this.criteria();
    if (
      !actor ||
      !this.canRead() ||
      !systemErrorLogExportAllowed(actor) ||
      !criteria ||
      !columns.length
    )
      return null;
    const criterion = () =>
      JSON.stringify({ ...this.criteria(), page: undefined, pageSize: undefined });
    const criteriaKey = criterion();
    return pagedTabularSource({
      actor,
      criteriaKey,
      culture,
      columns,
      fileName: 'system-error-logs',
      maximumRows: 5000,
      rowId: (row) => row.id,
      isCurrent: () =>
        this.auth.readIdentity() === actor &&
        this.canRead() &&
        systemErrorLogExportAllowed(actor) &&
        criterion() === criteriaKey,
      read: async (page, signal) => {
        const result = await exportRead(
          this.service.list({ ...criteria, page, pageSize: 100 }),
          signal,
        );
        return { rows: result.items, total: result.totalCount };
      },
    });
  }
  private readonly auth = inject(AuthSession);
  private readonly service = inject(SystemErrorLogService);
  private readonly filterState = signal<ErrorLogFilters>(emptyErrorLogFilters);
  private readonly search = signal('');
  private readonly appliedSearch = signal('');
  private readonly page = signal(1);
  private readonly pageSize = signal(25);
  private readonly appliedColumnFilters = signal('[]');
  readonly columnFilters = computed(() =>
    parseErrorLogColumnFilters(JSON.parse(this.appliedColumnFilters())),
  );
  changeColumnFilters(value: unknown): void {
    if (!this.canRead()) return;
    try {
      const json = errorLogColumnFilterJson(JSON.stringify(parseErrorLogColumnFilters(value)));
      if (json !== undefined && json !== this.appliedColumnFilters()) {
        this.appliedColumnFilters.set(json);
        this.page.set(1);
      }
    } catch {
      return;
    }
  }
  private readonly denied = signal<Session | null>(null);
  private readonly searchEvents = new Subject<{
    readonly actor: Session;
    readonly value: string;
    readonly generation: number;
  }>();
  private searchGeneration = 0;
  private readonly actorKeys = new WeakMap<Session, number>();
  private actorSerial = 0;
  readonly filters = this.filterState.asReadonly();
  readonly searchDraft = this.search.asReadonly();
  private readonly resolvedCriteria = computed(() =>
    resolveErrorLogCriteria(this.filterState(), this.appliedSearch(), this.page(), this.pageSize()),
  );
  readonly criteria = computed<ErrorLogCriteria | null>(() => {
    const resolved = this.resolvedCriteria();
    return resolved.valid
      ? {
          ...resolved.criteria,
          ...(this.appliedColumnFilters() === '[]'
            ? {}
            : { columnFilters: this.appliedColumnFilters() }),
        }
      : null;
  });
  readonly invalid = computed<'range' | 'criteria' | null>(() => {
    const resolved = this.resolvedCriteria();
    return resolved.valid ? null : resolved.issue;
  });
  readonly canRead = computed(() => {
    const actor = this.auth.readIdentity();
    return systemErrorLogsAllowed(actor) && actor !== this.denied();
  });
  private readonly scope = computed<ErrorLogScope | null>(() => {
    const actor = this.auth.readIdentity(),
      criteria = this.criteria();
    return actor && this.canRead() && criteria ? { actor, criteria } : null;
  });
  private readonly read = createScopedRead<ErrorLogScope, ErrorLogPage>(
    this.scope,
    (scope) => systemErrorLogsAllowed(scope.actor),
    (scope) =>
      this.service.list(scope.criteria).pipe(
        tap({
          error: (error: unknown) => {
            if (
              this.scope() === scope &&
              error instanceof HttpErrorResponse &&
              [401, 403].includes(error.status)
            )
              this.denied.set(scope.actor);
          },
        }),
      ),
  );
  readonly pending = this.read.pending;
  readonly pageError = computed(() =>
    this.read.state().kind === 'error' ? this.read.error() : null,
  );
  readonly source = computed<CollectionSource<ErrorLogRow>>(() => {
    const actor = this.auth.readIdentity();
    if (actor && !this.actorKeys.has(actor)) this.actorKeys.set(actor, ++this.actorSerial);
    const criteria = this.criteria();
    const query = {
      scopeKey: 'system-error-logs:' + (actor ? this.actorKeys.get(actor) : 'anonymous'),
      criteriaKey: JSON.stringify(criteria),
      pageIndex: this.page() - 1,
      pageSize: this.pageSize(),
    };
    const view = this.read.state();
    if (actor && !this.canRead()) return { query, kind: 'forbidden' };
    if (!criteria) return { query, kind: 'error' };
    return view.kind === 'ready'
      ? {
          query,
          kind: 'ready',
          result: {
            query,
            rows: view.data.items,
            total: view.data.totalCount,
            hasNextPage: view.data.page * view.data.pageSize < view.data.totalCount,
          },
        }
      : { query, kind: view.kind };
  });
  readonly total = computed(() => this.source().result?.total ?? 0);
  constructor() {
    this.searchEvents.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((event) => {
      if (
        event.actor !== this.auth.readIdentity() ||
        event.generation !== this.searchGeneration ||
        !this.canRead()
      )
        return;
      this.appliedSearch.set(event.value.trim());
      this.page.set(1);
    });
  }
  patchFilters(patch: Partial<ErrorLogFilters>): void {
    if (!this.canRead()) return;
    const next = { ...this.filterState(), ...patch };
    if (JSON.stringify(next) !== JSON.stringify(this.filterState())) {
      this.filterState.set(next);
      this.page.set(1);
    }
  }
  changeSearch(change: CollectionSearchChange): void {
    if (!this.canRead() || !('value' in change) || change.value.length > 120) return;
    const actor = this.auth.readIdentity();
    if (!actor) return;
    this.search.set(change.value);
    this.searchEvents.next({ actor, value: change.value, generation: this.searchGeneration });
  }
  changePage(request: CollectionPageRequest): void {
    if (
      !this.canRead() ||
      ![10, 25, 50, 100].includes(request.pageSize) ||
      !Number.isInteger(request.pageIndex) ||
      request.pageIndex < 0 ||
      request.pageIndex + 1 > 100000
    )
      return;
    const changedSize = request.pageSize !== this.pageSize();
    this.pageSize.set(request.pageSize);
    this.page.set(changedSize ? 1 : request.pageIndex + 1);
  }
  refresh(): void {
    this.read.refreshInBackground();
  }
  retry(): void {
    this.read.retry();
  }
  reset(): void {
    if (!this.canRead()) return;
    this.searchGeneration++;
    this.filterState.set(emptyErrorLogFilters);
    this.appliedColumnFilters.set('[]');
    this.search.set('');
    this.appliedSearch.set('');
    this.page.set(1);
    this.pageSize.set(25);
  }
  deny(actor: Session): void {
    if (actor === this.auth.readIdentity()) this.denied.set(actor);
  }
}
