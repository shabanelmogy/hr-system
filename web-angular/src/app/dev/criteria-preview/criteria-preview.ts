import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  createCollectionCriteriaCodec,
  createRouteCollectionCriteria,
  type CollectionCriteria,
  type CriteriaFilter,
  type CriteriaNavigationResult,
} from '../../shared/data/public-api';
import {
  ActionButton,
  MyDataGrid,
  CardList,
  CollectionCardTemplate,
  OptionSelect,
  PageHeader,
  StatusBadge,
  FeedbackState,
  type CollectionColumn,
  type CollectionPageRequest,
  type CollectionSort,
  type CollectionSearch,
  type CollectionSearchChange,
  type CollectionSource,
} from '../../shared/ui/public-api';
import { CriteriaPreviewGate } from '../criteria-preview-gate';
interface Sample {
  readonly id: number;
  readonly name: string;
  readonly active: boolean | null;
}
// A neutral simulated server, never a production list adapter or business dataset.
const fixtures: readonly Sample[] = Array.from({ length: 37 }, (_, id) => ({
  id,
  name: `A · ${String(id).padStart(2, '0')}`,
  active: id === 36 ? null : id % 3 !== 0,
}));
const codec = createCollectionCriteriaCodec({
  pageSizes: [5, 10, 25, 50],
  defaultPageSize: 10,
  sortFields: ['id', 'name'],
  defaultSort: { field: 'id', direction: 'asc' },
  search: { url: 'approved-public', fields: ['name'], operators: ['contains'], maxLength: 128 },
  filters: [
    {
      field: 'active',
      url: 'approved-public',
      operators: ['equals'],
      kind: 'boolean',
      nullable: true,
    },
    {
      field: 'id',
      url: 'approved-public',
      operators: ['equals'],
      kind: 'integer',
      nullable: false,
      min: 0,
      max: 36,
    },
  ],
});
@Component({
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    ActionButton,
    MyDataGrid,
    CardList,
    CollectionCardTemplate,
    OptionSelect,
    PageHeader,
    StatusBadge,
    FeedbackState,
    UiTextPipe,
  ],
  templateUrl: './criteria-preview.html',
  styleUrl: './criteria-preview.scss',
})
export class CriteriaPreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly gate = inject(CriteriaPreviewGate);
  readonly palettes = themePaletteOrder;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly criteria = createRouteCollectionCriteria(codec);
  readonly view = signal<'grid' | 'cards'>('grid');
  readonly scope = signal('a');
  readonly allowed = signal(true);
  readonly requests = signal(0);
  readonly result = signal<CriteriaNavigationResult | 'idle'>('idle');
  readonly draftSearch = signal('');
  readonly draftActive = signal('all');
  readonly draftId = signal('');
  readonly source = signal<CollectionSource<Sample>>({
    query: {
      scopeKey: 'a',
      criteriaKey: codec.criteriaKey(codec.defaults),
      pageIndex: 0,
      pageSize: 10,
    },
    kind: 'loading',
  });
  readonly serialized = computed(() => codec.encode(this.criteria.applied())!);
  readonly snapshot = computed(() => JSON.stringify(this.source().result?.rows ?? []));
  readonly editorOpen = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('?')[0]?.includes('/editor/') ?? false),
    ),
    { initialValue: this.route.snapshot.firstChild !== null },
  );
  readonly id = (row: Sample) => row.id;
  readonly name = (row: Sample) => row.name;
  readonly columns = computed<readonly CollectionColumn<Sample>[]>(() => [
    {
      key: 'id',
      header: this.runtime.translate('general.id'),
      value: (r) => r.id,
      sortField: 'id',
      width: 85,
    },
    {
      key: 'name',
      header: this.runtime.translate('general.nameEn'),
      value: (r) => r.name,
      sortField: 'name',
      width: 220,
    },
    {
      key: 'active',
      header: this.runtime.translate('common.active'),
      value: (r) =>
        r.active === null
          ? this.runtime.translate('pagination.unknownTotal')
          : this.runtime.translate(r.active ? 'common.active' : 'common.inactive'),
    },
  ]);
  readonly search = computed<CollectionSearch>(() => ({
    value: this.draftSearch(),
    placeholder: this.runtime.translate('search.searchText'),
  }));
  readonly activeOptions = computed(() => [
    { value: 'all', label: this.runtime.translate('common.all') },
    { value: 'true', label: this.runtime.translate('common.active') },
    { value: 'false', label: this.runtime.translate('common.inactive') },
    { value: 'null', label: this.runtime.translate('pagination.unknownTotal') },
  ]);
  readonly idOptions = computed(() => [
    { value: '', label: this.runtime.translate('common.all') },
    ...fixtures.map((row) => ({ value: String(row.id), label: String(row.id) })),
  ]);
  private generation = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    void this.runtime.loadNamespace('core');
    const filterKey = computed(() => codec.criteriaKey(this.criteria.applied()));
    effect(() => {
      filterKey();
      untracked(() => {
        const state = this.criteria.applied(),
          active = state.filters.find((f) => f.field === 'active'),
          id = state.filters.find((f) => f.field === 'id');
        this.draftSearch.set(state.search?.value ?? '');
        this.draftActive.set(active ? String(active.value) : 'all');
        this.draftId.set(id ? String(id.value) : '');
      });
    });
    effect(() => {
      const state = this.criteria.applied(),
        scope = this.scope(),
        allowed = this.allowed();
      untracked(() => this.load(state, scope, allowed));
    });
    inject(DestroyRef).onDestroy(() => {
      this.generation++;
      clearTimeout(this.timer);
    });
  }
  draft(change: CollectionSearchChange) {
    if ('value' in change) this.draftSearch.set(change.value);
  }
  async apply() {
    const filters: CriteriaFilter[] = [];
    const active = this.draftActive();
    if (active !== 'all')
      filters.push({
        field: 'active',
        operator: 'equals',
        value: active === 'null' ? null : active === 'true',
      });
    const id = this.draftId();
    if (id !== '') filters.push({ field: 'id', operator: 'equals', value: Number(id) });
    this.result.set(
      await this.criteria.apply({
        search:
          this.draftSearch() === ''
            ? null
            : { field: 'name', operator: 'contains', value: this.draftSearch() },
        filters,
      }),
    );
  }
  async reset() {
    this.draftSearch.set('');
    this.draftActive.set('all');
    this.draftId.set('');
    this.result.set(await this.criteria.reset());
  }
  async page(value: CollectionPageRequest) {
    this.result.set(await this.criteria.apply(value));
  }
  async sort(value: CollectionSort | null) {
    this.result.set(await this.criteria.apply({ sort: value }));
  }
  refresh() {
    this.load(this.criteria.applied(), this.scope(), this.allowed());
  }
  open(id: number) {
    void this.router.navigate(['/dev/criteria/editor', id], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }
  private load(state: CollectionCriteria, scope: string, allowed: boolean) {
    const generation = ++this.generation;
    clearTimeout(this.timer);
    const query = {
      scopeKey: scope,
      criteriaKey: codec.criteriaKey(state),
      pageIndex: state.pageIndex,
      pageSize: state.pageSize,
    };
    this.source.set({ query, kind: allowed ? 'loading' : 'forbidden' });
    if (!allowed) return;
    this.requests.update((n) => n + 1);
    this.timer = setTimeout(() => {
      if (generation !== this.generation) return;
      const rows = fixtures.filter(
        (row) =>
          state.filters.every((f) => row[f.field as 'id' | 'active'] === f.value) &&
          (!state.search ||
            (state.search.operator === 'contains'
              ? row.name.includes(state.search.value)
              : row.name === state.search.value)),
      );
      const sort = state.sort;
      if (sort)
        rows.sort(
          (a, b) =>
            (sort.field === 'id' ? a.id - b.id : a.name < b.name ? -1 : a.name > b.name ? 1 : 0) *
            (sort.direction === 'asc' ? 1 : -1),
        );
      const start = state.pageIndex * state.pageSize;
      this.source.set({
        query,
        kind: 'ready',
        result: {
          query,
          rows: rows.slice(start, start + state.pageSize),
          total: rows.length,
          hasNextPage: start + state.pageSize < rows.length,
        },
      });
    }, 120);
  }
}
