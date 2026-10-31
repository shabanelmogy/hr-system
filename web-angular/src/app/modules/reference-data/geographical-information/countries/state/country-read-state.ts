import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, tap } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { createScopedRead, type ReadState } from '../../../../../shared/data/public-api';
import type { CollectionPageRequest, CollectionSearchChange, CollectionSort, CollectionSource } from '../../../../../shared/ui/public-api';
import { CountryService } from '../services/country-service';
import { countryColumnFilters,countryColumnFilterPatch } from './country-column-filters';
import { countryQuerySchema, countryReadAllowed, defaultCountryQuery, parseCountryId, type CountryPage, type CountryQuery, type CountryListItem, type CountryDetail } from '../types/country';

interface PageSpec { readonly actor: Session; readonly query: CountryQuery; }
interface DetailSpec { readonly actor: Session; readonly id: number; }

@Injectable()
export class CountryReadState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(CountryService);
  private readonly denied = signal<Session | null>(null);
  private readonly criteria = signal<CountryQuery>(defaultCountryQuery);
  private readonly draft = signal('');
  private readonly searchEvents = new Subject<string>();
  private readonly selected = signal<DetailSpec | null>(null);
  private readonly identityKeys = new WeakMap<Session, number>();
  private identitySequence = 0;
  readonly query = this.criteria.asReadonly();
  readonly searchDraft = this.draft.asReadonly();
  readonly columnFilters=computed(()=>countryColumnFilters(this.criteria()));
  private readonly allowed = computed(() => {
    const actor = this.auth.readIdentity();
    return countryReadAllowed(actor) && actor !== this.denied();
  });
  readonly canRead = this.allowed;
  private readonly pageSpec = computed<PageSpec | null>(() => {
    const actor = this.auth.readIdentity();
    return actor && this.allowed() ? { actor, query: this.criteria() } : null;
  });
  private readonly pageRead = createScopedRead(this.pageSpec, spec => countryReadAllowed(spec.actor), spec =>
    this.service.page(spec.query).pipe(tap({ error: (error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 403 && this.pageSpec() === spec) this.denied.set(spec.actor);
    } })),
  );
  readonly view = computed<ReadState<CountryPage>>(() => {
    if (!this.auth.readIdentity()) return { kind: 'loading' };
    return this.allowed() ? this.pageRead.state() : { kind: 'forbidden' };
  });
  private readonly detailSpec = computed(() => {
    const selected = this.selected();
    return selected && this.allowed() && selected.actor === this.auth.readIdentity() ? selected : null;
  });
  private readonly detailRead = createScopedRead(this.detailSpec, spec => countryReadAllowed(spec.actor), spec =>
    this.service.detail(spec.id).pipe(tap({ error: (error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 403 && this.detailSpec() === spec) this.denied.set(spec.actor);
    } })),
  );
  readonly detailOpen = computed(() => this.detailSpec() !== null);
  readonly detail = computed<ReadState<CountryDetail>>(() => this.detailSpec() ? this.detailRead.state() : { kind: 'loading' });
  readonly source = computed<CollectionSource<CountryListItem>>(() => {
    const actor = this.auth.readIdentity(), criteria = this.criteria();
    if (actor && !this.identityKeys.has(actor)) this.identityKeys.set(actor, ++this.identitySequence);
    const { pageNumber, pageSize, ...filters } = criteria;
    const query = { scopeKey: actor ? 'countries:' + this.identityKeys.get(actor) : 'countries:anonymous', criteriaKey: JSON.stringify(filters), pageIndex: pageNumber - 1, pageSize };
    const view = this.view();
    if (view.kind !== 'ready') return { query, kind: view.kind };
    // Do not briefly paint an out-of-range empty page before the owner clamps it.
    if (pageNumber > Math.max(1, view.data.metaData.totalPages)) return { query, kind: 'loading' };
    return { query, kind: 'ready', result: { query, rows: view.data.items, total: view.data.metaData.totalCount, hasNextPage: view.data.metaData.hasNext } };
  });
  readonly total = computed(() => { const view = this.view(); return view.kind === 'ready' ? view.data.metaData.totalCount : 0; });

  constructor() {
    this.searchEvents.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(search => this.patch({ search: search.trim(), pageNumber: 1 }));
    effect(() => {
      const view = this.view(), current = this.criteria();
      if (view.kind === 'ready' && current.pageNumber > Math.max(1, view.data.metaData.totalPages)) this.patch({ pageNumber: Math.max(1, view.data.metaData.totalPages) });
    });
  }
  private patch(change: Readonly<Record<string, unknown>>): boolean {
    if (!this.allowed()) return false;
    const parsed = countryQuerySchema.safeParse({ ...this.criteria(), ...change });
    if (!parsed.success) return false;
    if (JSON.stringify(this.criteria()) === JSON.stringify(parsed.data)) return true;
    this.criteria.set(Object.freeze(parsed.data)); return true;
  }
  changeSearch(change: CollectionSearchChange): void {
    if (!this.allowed()) return;
    if ('value' in change) {
      if (typeof change.value !== 'string' || change.value.length > 200) return;
      this.draft.set(change.value); this.searchEvents.next(change.value); return;
    }
    if ('field' in change) this.patch({ searchField: change.field, pageNumber: 1 });
    if ('operator' in change) this.patch({ searchOperator: change.operator, pageNumber: 1 });
  }
  changeStatus(status: string): void { this.patch({ status, pageNumber: 1 }); }
  changeColumnFilters(value:unknown):void{
    if(!this.allowed())return;const change=countryColumnFilterPatch(value);if(!change)return;
    this.patch({...change,pageNumber:1});
  }
  changeSort(sort: CollectionSort): void { this.patch({ sortBy: sort.field, sortDirection: sort.direction, pageNumber: 1 }); }
  changePage(page: CollectionPageRequest): void {
    if (![5, 10, 25, 50].includes(page.pageSize) || !Number.isSafeInteger(page.pageIndex) || page.pageIndex < 0) return;
    this.patch({ pageNumber: page.pageIndex + 1, pageSize: page.pageSize });
  }
  reset(): void {
    if (!this.allowed()) return;
    this.draft.set(''); this.searchEvents.next(''); this.criteria.set(defaultCountryQuery);
  }
  refresh(): void { if (this.allowed()) this.pageRead.refresh(); }
  open(id: unknown): void {
    const actor = this.auth.readIdentity(), view = this.view();
    if (!actor || !this.allowed() || view.kind !== 'ready') return;
    let valid: number; try { valid = parseCountryId(id); } catch { return; }
    if (!view.data.items.some(row => row.id === valid)) return;
    this.selected.set({ actor, id: valid });
  }
  close(): void { this.selected.set(null); }
  retryDetail(): void { if (this.detailSpec()) this.detailRead.retry(); }
}
