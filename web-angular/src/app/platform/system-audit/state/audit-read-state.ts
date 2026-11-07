import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  collectExportCursor,
  exportRead,
  projectTabularRows,
  type TabularColumn,
  type TabularExportSource,
} from '../../../shared/data/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, take, throwIfEmpty, type Subscription } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import type {
  CollectionPageRequest,
  CollectionSearchChange,
  CollectionSource,
} from '../../../shared/ui/public-api';
import { SystemAuditService } from '../services/system-audit-service';
import {
  auditCriteria,
  changeAuditModule,
  emptyAuditFilters,
  type AuditFilters,
} from '../types/audit-criteria';
import { auditKey, type AuditCriteria, type AuditItem, type AuditPage } from '../types/audit-trail';
import { systemAuditAllowed } from '../system-audit-access';
import { parseAuditColumnFilters, auditColumnFilterJson } from '../types/audit-column-filters';

interface AuditScope {
  readonly actor: Session;
  readonly criteria: AuditCriteria;
}
interface AuditSnapshot {
  readonly scope: AuditScope;
  readonly pages: readonly AuditPage[];
  readonly index: number;
  readonly phase: 'loading' | 'ready' | 'error';
}
interface AuditRequest {
  readonly scope: AuditScope;
  readonly index: number;
  readonly cursor: string | null;
}

/** Cursor chains belong to one actor and one applied criteria snapshot. */
@Injectable()
export class AuditReadState {
  private readonly appliedColumnFilters = signal('[]');
  readonly columnFilters = computed(() =>
    parseAuditColumnFilters(JSON.parse(this.appliedColumnFilters())),
  );
  changeColumnFilters(value: unknown): void {
    if (!this.canRead()) return;
    try {
      const json = auditColumnFilterJson(JSON.stringify(parseAuditColumnFilters(value)));
      if (json !== undefined && json !== this.appliedColumnFilters())
        this.appliedColumnFilters.set(json);
    } catch {
      return;
    }
  }
  exportSource(
    columns: readonly TabularColumn<AuditItem & { readonly key: string }>[],
    culture: 'en' | 'ar',
  ): TabularExportSource | null {
    const scope = this.scope();
    if (!scope || !columns.length) return null;
    const criteriaKey = JSON.stringify(scope.criteria);
    return {
      actor: scope.actor,
      criteriaKey,
      fileName: 'system-audit',
      culture,
      load: async (signal) =>
        projectTabularRows(
          columns,
          await collectExportCursor({
            signal,
            rowId: (row) => row.key,
            read: async (cursor) => {
              if (
                this.auth.readIdentity() !== scope.actor ||
                !this.canRead() ||
                JSON.stringify(this.scope()?.criteria) !== criteriaKey
              )
                throw new DOMException('Audit export changed', 'AbortError');
              const result = await exportRead(this.service.page(scope.criteria, cursor), signal);
              return {
                rows: result.items.map((row) => ({ ...row, key: auditKey(row) })),
                nextCursor: result.nextCursor,
              };
            },
          }),
        ),
    };
  }
  private readonly auth = inject(AuthSession);
  private readonly service = inject(SystemAuditService);
  private readonly destroy = inject(DestroyRef);
  private readonly denied = signal<Session | null>(null);
  private readonly filterState = signal<AuditFilters>(emptyAuditFilters);
  private readonly appliedSearch = signal('');
  private readonly search = signal('');
  private readonly searchEvents = new Subject<string>();
  private readonly snapshot = signal<AuditSnapshot | null>(null);
  private readonly request = signal<AuditRequest | null>(null);
  private readonly failed = signal<AuditRequest | null>(null);
  private operation: Subscription | null = null;
  private readonly actors = new WeakMap<Session, number>();
  private actorSerial = 0;
  readonly filters = this.filterState.asReadonly();
  readonly searchDraft = this.search.asReadonly();
  private readonly criteria = computed(() =>
    auditCriteria(this.filterState(), this.appliedSearch()),
  );
  readonly invalid = computed(() => {
    const result = this.criteria();
    return result.valid ? null : result.issue;
  });
  readonly canRead = computed(() => {
    const actor = this.auth.readIdentity();
    return systemAuditAllowed(actor) && actor !== this.denied();
  });
  private readonly scope = computed<AuditScope | null>(() => {
    const actor = this.auth.readIdentity(),
      criteria = this.criteria();
    return actor && this.canRead() && criteria.valid
      ? {
          actor,
          criteria: {
            ...criteria.criteria,
            ...(this.appliedColumnFilters() === '[]'
              ? {}
              : { columnFilters: this.appliedColumnFilters() }),
          },
        }
      : null;
  });
  readonly pending = computed(() => {
    const scope = this.scope();
    return !!scope && (this.snapshot()?.scope !== scope || this.request()?.scope === scope);
  });
  readonly pageError = computed(() => !!this.scope() && this.failed()?.scope === this.scope());
  readonly source = computed<CollectionSource<AuditItem>>(() => {
    const actor = this.auth.readIdentity();
    if (actor && !this.actors.has(actor)) this.actors.set(actor, ++this.actorSerial);
    const scope = this.scope(),
      snapshot = this.snapshot();
    const current = scope && snapshot?.scope === scope ? snapshot : null;
    const page = current?.pages[current.index];
    const query = {
      scopeKey: 'system-audit:' + (actor ? this.actors.get(actor) : 'anonymous'),
      criteriaKey: JSON.stringify([this.criteria(), this.appliedColumnFilters()]),
      pageIndex: current?.index ?? 0,
      pageSize: 50,
    };
    if (actor && !this.canRead()) return { query, kind: 'forbidden' };
    if (this.invalid()) return { query, kind: 'error' };
    if (page)
      return {
        query,
        kind: 'ready',
        result: { query, rows: page.items, total: null, hasNextPage: page.nextCursor !== null },
      };
    return { query, kind: current?.phase === 'error' ? 'error' : 'loading' };
  });
  constructor() {
    this.searchEvents
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((value) => this.appliedSearch.set(value));
    effect(() => {
      const scope = this.scope();
      untracked(() => {
        this.operation?.unsubscribe();
        this.request.set(null);
        this.failed.set(null);
        this.snapshot.set(null);
        if (scope) this.load({ scope, index: 0, cursor: null }, true);
      });
    });
    this.destroy.onDestroy(() => {
      this.operation?.unsubscribe();
      this.searchEvents.complete();
    });
  }
  private current(request: AuditRequest): boolean {
    return !this.destroy.destroyed && this.scope() === request.scope && this.request() === request;
  }
  private load(request: AuditRequest, reset = false): void {
    if (this.destroy.destroyed || this.scope() !== request.scope || this.request()) return;
    this.operation?.unsubscribe();
    this.failed.set(null);
    if (reset || this.snapshot()?.scope !== request.scope)
      this.snapshot.set({ scope: request.scope, pages: [], index: 0, phase: 'loading' });
    this.request.set(request);
    this.operation = this.service
      .page(request.scope.criteria, request.cursor)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: (page) => {
          if (!this.current(request)) return;
          const previous = this.snapshot();
          const pages =
            previous?.scope === request.scope ? previous.pages.slice(0, request.index) : [];
          this.snapshot.set({
            scope: request.scope,
            pages: [...pages, page],
            index: request.index,
            phase: 'ready',
          });
          this.request.set(null);
        },
        error: (error: unknown) => {
          if (!this.current(request)) return;
          if (error instanceof HttpErrorResponse && [401, 403].includes(error.status))
            this.denied.set(request.scope.actor);
          else {
            const previous = this.snapshot();
            if (previous?.scope === request.scope)
              this.snapshot.set({ ...previous, phase: 'error' });
            this.failed.set(request);
          }
          this.request.set(null);
        },
      });
  }
  changePage(page: CollectionPageRequest): void {
    const scope = this.scope(),
      snapshot = this.snapshot();
    if (
      !scope ||
      snapshot?.scope !== scope ||
      this.pending() ||
      page.pageSize !== 50 ||
      !Number.isInteger(page.pageIndex) ||
      page.pageIndex < 0
    )
      return;
    if (snapshot.pages[page.pageIndex]) {
      this.failed.set(null);
      this.snapshot.set({ ...snapshot, index: page.pageIndex, phase: 'ready' });
      return;
    }
    const cursor = snapshot.pages.at(-1)?.nextCursor;
    if (page.pageIndex === snapshot.pages.length && cursor)
      this.load({ scope, index: page.pageIndex, cursor });
  }
  patchFilters(patch: Partial<AuditFilters>): void {
    if (!this.canRead()) return;
    const current = this.filterState();
    const next =
      patch.moduleCode !== undefined && patch.moduleCode !== current.moduleCode
        ? { ...changeAuditModule(current, patch.moduleCode), ...patch, entityName: '' }
        : { ...current, ...patch };
    if (JSON.stringify(next) !== JSON.stringify(current)) this.filterState.set(next);
  }
  changeSearch(change: CollectionSearchChange): void {
    if (!this.canRead() || !('value' in change) || change.value.length > 200) return;
    this.search.set(change.value);
    this.searchEvents.next(change.value);
  }
  retry(): void {
    const failed = this.failed();
    if (failed && failed.scope === this.scope() && !this.pending()) this.load(failed);
  }
  deny(actor: Session): void {
    if (actor !== this.auth.readIdentity()) return;
    this.denied.set(actor);
    this.operation?.unsubscribe();
    this.request.set(null);
    this.failed.set(null);
    this.snapshot.set(null);
  }
  refresh(): void {
    const scope = this.scope();
    if (scope && !this.pending()) this.load({ scope, index: 0, cursor: null }, true);
  }
}
