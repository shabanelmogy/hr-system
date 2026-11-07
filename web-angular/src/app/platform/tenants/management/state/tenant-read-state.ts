import {
  pagedTabularSource,
  exportRead,
  type TabularColumn,
  type TabularExportSource,
} from '../../../../shared/data/public-api';
import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, tap } from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { createScopedRead } from '../../../../shared/data/public-api';
import type {
  CollectionPageRequest,
  CollectionSearchChange,
  CollectionSort,
  CollectionSource,
} from '../../../../shared/ui/public-api';
import { TenantManagementService } from '../services/tenant-management-service';
import {
  defaultTenantQuery,
  tenantQuerySchema,
  tenantReadAllowed,
  type TenantQuery,
  type TenantRecord,
} from '../types/tenant';

interface PageSpec {
  readonly actor: Session;
  readonly query: TenantQuery;
}

/** One authoritative server page; drafts, commands and the entitlement catalog have separate owners. */
@Injectable()
export class TenantReadState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantManagementService);
  private readonly criteria = signal<TenantQuery>(defaultTenantQuery);
  private readonly search = signal('');
  private readonly searchEvents = new Subject<string>();
  private readonly denied = signal<Session | null>(null);
  private readonly actorKeys = new WeakMap<Session, number>();
  private actorSequence = 0;
  readonly query = this.criteria.asReadonly();

  exportSource(
    columns: readonly TabularColumn<TenantRecord>[],
    culture: 'en' | 'ar',
  ): TabularExportSource | null {
    const actor = this.auth.readIdentity(),
      query = this.criteria();
    if (!actor || !this.canRead() || !columns.length) return null;
    const criterion = () =>
      JSON.stringify({ ...this.criteria(), pageNumber: undefined, pageSize: undefined });
    const criteriaKey = criterion();
    return pagedTabularSource({
      actor,
      criteriaKey,
      fileName: 'tenants',
      culture,
      columns,
      rowId: (row) => row.id,
      isCurrent: () =>
        this.auth.readIdentity() === actor && this.canRead() && criterion() === criteriaKey,
      read: async (page, signal) => {
        const result = await exportRead(
          this.service.page({ ...query, pageNumber: page, pageSize: 200 }),
          signal,
        );
        return { rows: result.items, total: result.metaData.totalCount };
      },
    });
  }

  readonly searchDraft = this.search.asReadonly();
  readonly canRead = computed(() => {
    const actor = this.auth.readIdentity();
    return tenantReadAllowed(actor) && actor !== this.denied();
  });
  private readonly spec = computed<PageSpec | null>(() => {
    const actor = this.auth.readIdentity();
    return actor && this.canRead() ? { actor, query: this.criteria() } : null;
  });
  private readonly read = createScopedRead(
    this.spec,
    (spec) => tenantReadAllowed(spec.actor),
    (spec) =>
      this.service.page(spec.query).pipe(
        tap({
          error: (error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 403 && this.spec() === spec)
              this.denied.set(spec.actor);
          },
        }),
      ),
  );
  readonly view = computed(() =>
    !this.auth.readIdentity()
      ? { kind: 'loading' as const }
      : this.canRead()
        ? this.read.state()
        : { kind: 'forbidden' as const },
  );
  readonly source = computed<CollectionSource<TenantRecord>>(() => {
    const actor = this.auth.readIdentity();
    if (actor && !this.actorKeys.has(actor)) this.actorKeys.set(actor, ++this.actorSequence);
    const criteria = this.criteria();
    const query = {
      scopeKey: actor ? 'tenants:' + this.actorKeys.get(actor) : 'tenants:anonymous',
      criteriaKey: JSON.stringify(criteria),
      pageIndex: criteria.pageNumber - 1,
      pageSize: criteria.pageSize,
    };
    const view = this.view();
    return view.kind === 'ready'
      ? {
          query,
          kind: 'ready',
          result: {
            query,
            rows: view.data.items,
            total: view.data.metaData.totalCount,
            hasNextPage: view.data.metaData.hasNext,
          },
        }
      : { query, kind: view.kind };
  });
  readonly pending = this.read.pending;
  readonly total = computed(() => this.source().result?.total ?? 0);
  private readonly requestedRefresh = signal<PageSpec | null>(null);

  constructor() {
    this.searchEvents
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((searchValue) => this.patch({ searchValue: searchValue.trim(), pageNumber: 1 }));
    effect(() => {
      const view = this.view();
      if (view.kind !== 'ready') return;
      const last = Math.max(1, view.data.metaData.totalPages);
      if (this.criteria().pageNumber > last) this.patch({ pageNumber: last });
    });
    effect(() => {
      const requested = this.requestedRefresh();
      if (!requested) return;
      if (requested !== this.spec()) {
        this.requestedRefresh.set(null);
        return;
      }
      const view = this.read.state();
      if (!this.read.pending() && (view.kind === 'ready' || view.kind === 'error')) {
        this.requestedRefresh.set(null);
        untracked(() => this.read.refreshInBackground());
      }
    });
  }

  private patch(change: Partial<TenantQuery>): void {
    if (!this.canRead()) return;
    const parsed = tenantQuerySchema.safeParse({ ...this.criteria(), ...change });
    if (parsed.success && JSON.stringify(parsed.data) !== JSON.stringify(this.criteria()))
      this.criteria.set(parsed.data);
  }
  changePage(page: CollectionPageRequest): void {
    this.patch({ pageNumber: page.pageIndex + 1, pageSize: page.pageSize });
  }
  changeSort(sort: CollectionSort): void {
    if (sort.field !== 'name' && sort.field !== 'identifier' && sort.field !== 'createdOn') return;
    this.patch({
      columnName: sort.field,
      sortDirection: sort.direction === 'desc' ? 'DESC' : 'ASC',
      pageNumber: 1,
    });
  }
  changeSearch(change: CollectionSearchChange): void {
    if (!this.canRead() || !('value' in change) || change.value.length > 200) return;
    this.search.set(change.value);
    this.searchEvents.next(change.value);
  }
  reset(): void {
    if (!this.canRead()) return;
    this.searchEvents.next('');
    this.search.set('');
    this.criteria.set(defaultTenantQuery);
  }
  refresh(): void {
    const spec = this.spec();
    if (spec) this.requestedRefresh.set(spec);
  }
}
