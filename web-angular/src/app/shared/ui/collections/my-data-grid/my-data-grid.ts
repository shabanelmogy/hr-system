import { attachGridViewport } from './grid-viewport';
import {
  Component,
  DestroyRef,
  type ElementRef,
  Injector,
  afterNextRender,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { TableModule } from 'primeng/table';
import type { ColumnFilterPassThrough, TableFilterButtonPropsOptions } from 'primeng/types/table';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { RowActions } from '../row-actions/row-actions';
import type { CollectionRecordRequest } from '../collection-record-feedback';
import { collectionKeyTarget } from '../collection-keyboard';
import {
  ContextMenuPanel,
  type ContextMenuAction,
} from '../../overlays/context-menu-panel/context-menu-panel';
import { filterByCellValue } from '../grid-cell-filter';
import { LocalizationRuntime, UiTextPipe } from '../../../../platform/localization/public-api';
import { GridLocale } from '../../../../../theme/grid-public-api';
import { GridFilterInput } from '../grid-filter-input/grid-filter-input';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';
import {
  fromPrimeGridFilters,
  toPrimeGridFilters,
  setPrimeGridFilterDraft,
} from '../grid-filter-adapter';
import {
  filterDefinitionValid,
  gridFilterModes,
  parseGridFilters,
  type GridFilters,
  type GridColumnFilter,
} from '../grid-filter.types';
import {
  parseGridSort,
  type GridDisplayOptions,
  type GridSortItem,
  type GridSelectionMode,
  type GridRowGroup,
  type GridRowAction,
} from '../grid-options.types';
import { CollectionFrame } from '../collection-frame/collection-frame';
import { CollectionFeedback } from '../collection-feedback/collection-feedback';
import {
  CollectionCell,
  CollectionEmptyTemplate,
  CollectionRowDetails,
  CollectionColumnHeader,
  CollectionColumnFooter,
} from '../collection-templates';
import { resolveGridHeaders, type GridHeaderDefinition } from '../grid-header-groups';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { createGridCsv, gridCsvFilename, type GridCsvOptions } from '../grid-export';
import type { GridPresentation } from '../grid-presentation';
import { createGridPresentation } from './grid-column-presentation';
import { gridColumnWidths, gridColumnMinimum, gridFrozenOffset } from '../grid-column-widths';
import { createCollectionController } from '../collection-controller';
import { attachCollectionFocus, collectionRowInteraction } from '../collection-focus';
import {
  collectionPageSizes,
  collectionQueryKey,
  type CollectionColumn,
  type CollectionId,
  type CollectionPageRequest,
  type CollectionSearch,
  type CollectionSearchChange,
  type CollectionSort,
  type CollectionSource,
  type CollectionToolbarLayout,
} from '../collection.types';

/** Remote data only: the caller owns criteria, requests and committed paging. */
@Component({
  selector: 'erp-data-table',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    TableModule,
    Checkbox,
    RadioButton,
    RowActions,
    ContextMenuPanel,
    CollectionFrame,
    CollectionFeedback,
    UiTextPipe,
    GridFilterInput,
    FeedbackState,
    ActionButton,
    AppIcon,
  ],
  templateUrl: './my-data-grid.html',
  styleUrls: [
    './my-data-grid.scss',
    './grid-native-compatibility.scss',
    '../collection-slots.scss',
    '../collection-row-flash.scss',
  ],
})
export class MyDataGrid<T> {
  private static sequence = 0;
  readonly selectionName = 'erp-grid-selection-' + ++MyDataGrid.sequence;
  private readonly injector = inject(Injector);
  readonly gridFilterModes = gridFilterModes;
  readonly filterDraft = setPrimeGridFilterDraft;
  readonly filterButtonProps: TableFilterButtonPropsOptions = {
    popover: {
      apply: { style: { padding: '6px 12px', minHeight: '32px' } },
      clear: { style: { padding: '6px 12px', minHeight: '32px' } },
      addRule: { style: { padding: '8px 12px', minHeight: '36px' } },
    },
  };
  readonly filterAttributes: ColumnFilterPassThrough = {
    filterButtonBar: { style: { gap: '12px', paddingTop: '8px' } },
  };
  readonly locale = inject(LocalizationRuntime);
  private readonly destroyRef = inject(DestroyRef);
  private pendingSort: {
    readonly value: CollectionSort;
    readonly source: CollectionSource<T>;
  } | null = null;
  private sortScheduled = false;
  readonly source = input.required<CollectionSource<T>>();
  readonly label = input.required<string>();
  readonly columns = input.required<readonly CollectionColumn<T>[]>();
  readonly rowId = input.required<(row: T) => CollectionId>();
  readonly rowLabel = input<(row: T) => string>((row) => String(this.rowId()(row)));
  readonly selectable = input<(row: T) => boolean>(() => true);
  readonly selectionEnabled = input(false);
  readonly sort = input<CollectionSort>();
  readonly search = input<CollectionSearch>();
  readonly pageSizes = input<readonly number[]>(collectionPageSizes);
  readonly selectionMode = input<GridSelectionMode>('multiple');
  readonly grouping = input<GridRowGroup | null>(null);
  readonly frozenIds = input<readonly CollectionId[]>([]);
  readonly frozenRows = computed(() =>
    this.rows().filter((row) => this.frozenIds().includes(this.rowId()(row))),
  );
  readonly scrollingRows = computed(() =>
    this.rows().filter((row) => !this.frozenIds().includes(this.rowId()(row))),
  );
  readonly contextActions = input<((row: T) => readonly GridRowAction[]) | null>(null);
  readonly rowAction = output<{ readonly row: T; readonly action: string }>();
  readonly actionDisplay = input<'menu' | 'inline'>('menu');
  readonly stickyActions = input(false);
  readonly actionColumnWidth = computed(() =>
    this.actionDisplay() === 'inline'
      ? Math.max(
          128,
          ...this.rows().map((row) => (this.contextActions()?.(row).length ?? 0) * 36 + 16),
        )
      : 50,
  );
  readonly cellContextFilter = input(true);
  private readonly context = signal<{
    readonly row: T;
    readonly key: string;
    readonly source: CollectionSource<T>;
    readonly column: CollectionColumn<T> | null;
    readonly value: unknown;
  } | null>(null);
  private readonly rowMenu = viewChild<ContextMenuPanel>('rowMenu');
  readonly contextItems = computed<readonly ContextMenuAction[]>(() => {
    const context = this.context();
    if (!context || !this.currentContext(context)) return [];
    const rows = (this.contextActions()?.(context.row) ?? []).map((action) => ({
      id: 'row:' + action.id,
      label: action.label,
      ...(action.icon === undefined ? {} : { icon: action.icon }),
      ...(action.disabled === undefined ? {} : { disabled: action.disabled }),
    }));
    const filter = this.cellFilter(context);
    return [
      ...(filter
        ? [
            {
              id: 'filter-by-value',
              label: this.locale.translate('collections.filterByCellValue'),
              icon: 'filter' as const,
            },
          ]
        : []),
      ...(filter && rows.length ? [{ id: 'separator', label: '', separator: true }] : []),
      ...rows,
    ];
  });
  readonly groupColumn = computed(() =>
    this.grouping()
      ? (this.columns().find((column) => column.key === this.grouping()?.field) ?? null)
      : null,
  );
  readonly groupingValid = computed(() => {
    const group = this.grouping();
    if (!group) return true;
    const column = this.groupColumn();
    if (
      !column ||
      this.details() ||
      this.frozenRows().length > 0 ||
      (group.expandable && group.mode === 'rowspan')
    )
      return false;
    if (this.controller.view().kind !== 'ready') return true;
    if (group.scope === 'all' && this.controller.view().total !== this.rows().length) return false;
    const seen = new Set<string>();
    let previous: string | null = null;
    for (const row of this.rows()) {
      const value = column.value(row);
      if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        typeof row !== 'object' ||
        row === null ||
        Reflect.get(row, group.field) !== value
      )
        return false;
      const key = JSON.stringify([typeof value, value]);
      if (key !== previous) {
        if (seen.has(key)) return false;
        seen.add(key);
        previous = key;
      }
    }
    return true;
  });
  readonly display = input<GridDisplayOptions>({});
  readonly toolbarVisible = input(true);
  readonly appearance = input<'standard' | 'reference'>('standard');
  readonly toolbarLayout = input<CollectionToolbarLayout>('responsive');
  readonly recordNavigation = input(false);
  readonly recordRequest = input<CollectionRecordRequest | null>(null);
  readonly headerGroups = input<readonly GridHeaderDefinition[]>([]);
  readonly headerRows = computed(() => {
    try {
      return resolveGridHeaders(this.headerGroups(), this.columns(), this.displayColumns());
    } catch {
      return null;
    }
  });
  readonly headersValid = computed(
    () =>
      this.headerRows() !== null &&
      (!this.headerGroups().length ||
        (!this.display().reorderableColumns &&
          !this.display().columnManagement &&
          !Object.keys(this.pins()).length)),
  );
  readonly advancedFilters = input(false);
  readonly filters = input<GridFilters>([]);
  readonly filtersChange = output<GridFilters>();
  readonly filterInvalid = signal(false);
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly sorts = input<readonly GridSortItem[]>([]);
  readonly sortsChange = output<readonly GridSortItem[]>();
  readonly columnOrderChange = output<readonly string[]>();
  readonly columnWidthsChange = output<Readonly<Record<string, number>>>();
  readonly csv = input<GridCsvOptions | null>(null);
  readonly csvExported = output<{ readonly rows: number; readonly filename: string }>();
  readonly details = contentChild(CollectionRowDetails<T>);
  readonly expanded = signal<Readonly<Record<string, boolean>>>({});
  readonly detailToggle = output<{ readonly row: T; readonly expanded: boolean }>();
  readonly dataKey = input('id');
  private readonly presentationState = createGridPresentation({
    columns: this.columns,
    display: this.display,
    scope: () => this.source().query.scopeKey,
    orderChange: (keys) => this.columnOrderChange.emit(keys),
  });
  readonly order = this.presentationState.order;
  readonly widths = this.presentationState.widths;
  readonly pins = this.presentationState.pins;
  readonly filterDefinitions = computed<readonly GridColumnFilter[]>(() =>
    this.advancedFilters()
      ? this.columns().flatMap((column) => (column.filter ? [column.filter] : []))
      : [],
  );
  readonly filterContractValid = computed(() => {
    const definitions = this.filterDefinitions();
    try {
      parseGridFilters(this.filters(), definitions);
      return definitions.every(filterDefinitionValid);
    } catch {
      return false;
    }
  });
  readonly nativeFilters = computed(() =>
    this.filterContractValid() ? toPrimeGridFilters(this.filters(), this.filterDefinitions()) : {},
  );
  readonly nativeSorts = computed(() => {
    try {
      return parseGridSort(
        this.sorts(),
        this.columns().flatMap((column) => (column.sortField ? [column.sortField] : [])),
      ).map((item) => ({ field: item.field, order: item.direction === 'asc' ? 1 : -1 }));
    } catch {
      return [];
    }
  });
  readonly pageChange = output<CollectionPageRequest>();
  readonly activeChange = output<CollectionId | null>();
  readonly selectionChange = output<readonly CollectionId[]>();
  readonly sortChange = output<CollectionSort>();
  readonly searchChange = output<CollectionSearchChange>();
  readonly retry = output<void>();
  readonly rowActivated = output<T>();
  readonly controller = createCollectionController(
    this.source,
    this.rowId,
    this.selectable,
    {
      page: (request) => this.pageChange.emit(request),
      active: (id) => this.activeChange.emit(id),
      selected: (ids) => this.selectionChange.emit(ids),
    },
    this.selectionMode,
    this.recordRequest,
  );
  readonly trackRow = (_index: number, row: T) => this.controller.rowKey(row);
  readonly density = this.presentationState.density;
  readonly visibleKeys = this.presentationState.visibleKeys;
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly availableWidth = signal(0);
  private readonly cells = contentChildren(CollectionCell<T>);
  readonly empty = contentChild(CollectionEmptyTemplate);
  private readonly columnHeaders = contentChildren(CollectionColumnHeader<T>);
  private readonly columnFooters = contentChildren(CollectionColumnFooter<T>);
  readonly hasFooters = computed(
    () =>
      this.controller.view().kind === 'ready' &&
      this.displayColumns().some((column) => this.columnFooter(column) !== undefined),
  );
  readonly optionColumns = this.presentationState.optionColumns;
  readonly displayColumns = this.presentationState.displayColumns;
  readonly rows = computed(() => [...this.controller.view().rows]);
  readonly rowHeight = computed(() =>
    this.density() === 'compact' ? 36 : this.density() === 'comfortable' ? 68 : 52,
  );
  readonly reservedColumnCount = computed(
    () =>
      Number(this.selectionEnabled()) + Number(!!this.details()) + Number(!!this.contextActions()),
  );
  readonly reservedWidth = computed(
    () =>
      (this.selectionEnabled() ? 50 : 0) +
      (this.details() ? 50 : 0) +
      (this.contextActions() ? this.actionColumnWidth() : 0),
  );
  private readonly headerMinimums = signal<Readonly<Record<string, number>>>({});
  readonly resolvedWidths = computed(() =>
    gridColumnWidths(
      this.displayColumns(),
      this.availableWidth() - this.reservedWidth(),
      this.widths(),
      this.headerMinimums(),
      this.compactViewport(),
    ),
  );
  readonly tableWidth = computed(
    () =>
      this.displayColumns().reduce(
        (sum, column) => sum + this.width(column),
        this.reservedWidth(),
      ) + 'px',
  );
  private readonly compactViewport = computed(
    () => this.availableWidth() > 0 && this.availableWidth() < 600,
  );
  compact(column: CollectionColumn<T>): boolean {
    return (
      this.compactViewport() &&
      Number.isFinite(column.compactWidth) &&
      (column.compactWidth ?? 0) >= 48
    );
  }
  readonly tableAttributes = computed(() => ({
    table: {
      role: 'grid',
      'aria-label': this.label(),
      'aria-rowcount': this.controller.view().total ?? -1,
    },
    tableContainer: { class: 'erp-native-scrollbar' },
  }));
  readonly tokens = computed(() => ({
    root: { borderColor: 'var(--border)' },
    headerCell: {
      background: 'var(--surface)',
      color: this.appearance() === 'reference' ? 'var(--foreground)' : 'var(--muted-foreground)',
      borderColor: 'var(--border)',
      padding: this.appearance() === 'reference' ? '0px 10px' : '8px 16px',
    },
    bodyCell: {
      borderColor: 'var(--border)',
      padding: this.appearance() === 'reference' ? '0px 10px' : '4px 16px',
    },
    row: { background: 'var(--surface)', color: 'var(--foreground)' },
    sortIcon: { color: 'var(--muted-foreground)', hoverColor: 'var(--primary)' },
  }));
  constructor() {
    attachGridViewport({
      viewport: () => this.viewport()?.nativeElement,
      availableWidth: this.availableWidth,
      headerMinimums: this.headerMinimums,
      refresh: () => {
        this.displayColumns();
        this.locale.language();
        this.appearance();
      },
    });
    inject(GridLocale);
    effect(() => {
      const key = JSON.stringify([
        this.source().query.scopeKey,
        this.columns().map((column) => [column.key, column.hideable]),
      ]);
      untracked(() => {
        if (key !== this.displayContext) {
          this.displayContext = key;
          this.resetDisplay();
        }
      });
    });
    effect(() => {
      this.source();
      this.columns();
      this.filters();
      this.cellContextFilter();
      this.grouping();
      untracked(() => {
        this.expanded.set({});
        this.context.set(null);
        this.rowMenu()?.hide(false);
      });
    });
    effect(() => {
      const pins = this.display().frozenColumns ?? {};
      this.pins.set({ ...pins });
    });

    attachCollectionFocus(this.controller);
  }
  private displayContext = '';
  resetDisplay() {
    this.filterInvalid.set(false);
    return this.presentationState.resetDisplay();
  }
  presentation(): GridPresentation {
    return this.presentationState.presentation();
  }
  restorePresentation(value: unknown): boolean {
    return this.presentationState.restorePresentation(value);
  }
  exportCsv(): void {
    const options = this.csv();
    if (!options || this.controller.view().kind !== 'ready') return;
    const rows = options.selectedOnly
      ? this.controller
          .view()
          .rows.filter((row) => this.controller.selectedIds().includes(this.rowId()(row)))
      : this.controller.view().rows;
    const csv = createGridCsv(this.displayColumns(), rows, options),
      filename = gridCsvFilename(options.filename),
      url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    this.csvExported.emit({ rows: rows.length, filename });
  }
  toggleDetails(row: T): void {
    if (
      !this.details() ||
      this.controller.view().kind !== 'ready' ||
      !this.controller.view().rows.includes(row)
    )
      return;
    const id = this.rowId()(row);
    if (typeof row !== 'object' || row === null || Reflect.get(row, this.dataKey()) !== id) return;
    const key = String(id),
      expanded = !this.expanded()[key];
    this.expanded.update((value) => ({ ...value, [key]: expanded }));
    this.detailToggle.emit({ row, expanded });
  }
  groupLabel(row: T) {
    return String(this.groupColumn()?.value(row) ?? '');
  }
  toggleGroup(row: T): void {
    if (
      !this.grouping()?.expandable ||
      !this.groupingValid() ||
      this.controller.view().kind !== 'ready'
    )
      return;
    const key = this.groupLabel(row);
    this.expanded.update((value) => ({ ...value, [key]: !value[key] }));
  }
  private currentContext(context: NonNullable<ReturnType<typeof this.context>>): boolean {
    return (
      context.source === this.source() &&
      this.controller.view().kind === 'ready' &&
      context.key === collectionQueryKey(this.source().query) &&
      this.rows().includes(context.row)
    );
  }
  private cellValue(column: CollectionColumn<T>, row: T): unknown {
    try {
      return column.filterValue ? column.filterValue(row) : column.value(row);
    } catch {
      return undefined;
    }
  }
  private cellFilter(context: NonNullable<ReturnType<typeof this.context>>): GridFilters | null {
    const column = context.column;
    if (
      !this.cellContextFilter() ||
      !this.advancedFilters() ||
      !this.filterContractValid() ||
      !column?.filter ||
      !this.displayColumns().includes(column) ||
      !Object.is(context.value, this.cellValue(column, context.row))
    )
      return null;
    return filterByCellValue(
      this.filters(),
      this.filterDefinitions(),
      column.filter.field,
      context.value,
    );
  }
  openContext(row: T, event: MouseEvent): void {
    if (
      (!this.contextActions() && (!this.advancedFilters() || !this.cellContextFilter())) ||
      this.controller.view().kind !== 'ready' ||
      !this.rows().includes(row)
    )
      return;
    const cell =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('td[data-cell-column]')
        : null;
    const column = cell
      ? (this.displayColumns().find((column) => column.key === cell.dataset['cellColumn']) ?? null)
      : null;
    const context = {
      row,
      key: collectionQueryKey(this.source().query),
      source: this.source(),
      column,
      value: column ? this.cellValue(column, row) : undefined,
    };
    this.context.set(context);
    if (!this.contextItems().length) return;
    event.preventDefault();
    event.stopPropagation();
    const returnTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const rect = returnTarget?.getBoundingClientRect() ?? null;
    const position =
      event.clientX === 0 && event.clientY === 0 && rect
        ? new MouseEvent('contextmenu', {
            clientX: rect.x + rect.width / 2,
            clientY: rect.y + rect.height / 2,
          })
        : event;
    afterNextRender(
      () => {
        if (!this.destroyRef.destroyed && this.context() === context && this.contextItems().length)
          this.rowMenu()?.show(position, returnTarget);
      },
      { injector: this.injector },
    );
  }
  runContextCommand(id: string): void {
    const context = this.context();
    if (!context || !this.currentContext(context)) return;
    if (id === 'filter-by-value') {
      const filters = this.cellFilter(context);
      if (!filters) return;
      this.filterInvalid.set(false);
      if (JSON.stringify(filters) !== JSON.stringify(this.filters()))
        this.filtersChange.emit(filters);
      this.context.set(null);
    } else if (id.startsWith('row:')) this.runContextAction(context.row, id.slice(4), context.key);
  }
  dismissContext(): void {
    this.context.set(null);
  }
  private runContextAction(row: T, action: string, key: string): void {
    if (
      this.controller.view().kind !== 'ready' ||
      key !== collectionQueryKey(this.source().query) ||
      !this.rows().includes(row) ||
      !this.contextActions()?.(row).some((item) => item.id === action && !item.disabled)
    )
      return;
    this.rowAction.emit({ row, action });
    this.context.set(null);
  }
  activateRowAction(row: T, action: string) {
    this.runContextAction(row, action, collectionQueryKey(this.source().query));
  }
  width(column: CollectionColumn<T>) {
    return this.resolvedWidths()[column.key] ?? gridColumnMinimum(column);
  }
  columnStyleWidth(column: CollectionColumn<T>) {
    return this.width(column);
  }
  minimum(column: CollectionColumn<T>) {
    return gridColumnMinimum(column, this.headerMinimums()[column.key], this.compactViewport());
  }
  pinned(column: CollectionColumn<T>) {
    return this.pins()[column.key] ?? null;
  }
  frozenOffset(column: CollectionColumn<T>): string {
    return (
      gridFrozenOffset(
        this.displayColumns(),
        this.resolvedWidths(),
        this.pins(),
        column.key,
        this.contextActions() && this.stickyActions() ? this.actionColumnWidth() : 0,
      ) + 'px'
    );
  }
  moveColumn(change: { readonly key: string; readonly direction: -1 | 1 }) {
    return this.presentationState.moveColumn(change);
  }
  pinColumn(change: { readonly key: string; readonly side: 'start' | 'end' | null }) {
    return this.presentationState.pinColumn(change);
  }
  pinSide(column: CollectionColumn<T>): 'left' | 'right' {
    return (this.pinned(column) === 'start') === (this.locale.direction() === 'ltr')
      ? 'left'
      : 'right';
  }
  filterModes(definition: GridColumnFilter) {
    return (definition.modes ?? gridFilterModes[definition.type]).map((value) => ({
      value,
      label: this.locale.translate('collections.' + value),
    }));
  }
  changeFilters(event: unknown) {
    if (
      !this.advancedFilters() ||
      this.controller.view().kind !== 'ready' ||
      !this.filterContractValid()
    )
      return;
    try {
      if (typeof event !== 'object' || event === null || !('filters' in event))
        throw Error('Invalid filter event');
      const filters = fromPrimeGridFilters(event.filters, this.filterDefinitions());
      this.filterInvalid.set(false);
      if (JSON.stringify(filters) !== JSON.stringify(this.filters()))
        this.filtersChange.emit(filters);
    } catch {
      this.filterInvalid.set(true);
    }
  }
  resized(event: unknown) {
    if (
      !this.display().resizableColumns ||
      typeof event !== 'object' ||
      event === null ||
      !('element' in event) ||
      !(event.element instanceof HTMLElement)
    )
      return;
    const key = event.element.dataset['columnKey'],
      column = this.columns().find((item) => item.key === key);
    if (!column) return;
    const widths = { ...this.widths() };
    for (const element of event.element
      .closest('tr')
      ?.querySelectorAll<HTMLElement>('[data-column-key]') ?? []) {
      const key = element.dataset['columnKey'],
        column = this.columns().find((item) => item.key === key);
      if (!column) continue;
      const width = Math.round(element.getBoundingClientRect().width);
      if (width < gridColumnMinimum(column, this.headerMinimums()[column.key]) || width > 4096)
        return;
      widths[column.key] = width;
    }
    this.widths.set(widths);
    this.columnWidthsChange.emit(widths);
  }
  reordered(event: unknown) {
    return this.presentationState.reordered(event);
  }
  cell(column: CollectionColumn<T>) {
    return this.cells().find((cell) => cell.erpCollectionCell().key === column.key)?.template;
  }
  columnHeader(column: CollectionColumn<T>) {
    return this.columnHeaders().find(
      (header) => header.erpCollectionColumnHeader().key === column.key,
    )?.template;
  }
  columnFooter(column: CollectionColumn<T>) {
    return this.columnFooters().find(
      (footer) => footer.erpCollectionColumnFooter().key === column.key,
    )?.template;
  }
  groupHeaderWidth(columns: readonly CollectionColumn<T>[]) {
    return columns.reduce((sum, column) => sum + this.width(column), 0);
  }
  value(column: CollectionColumn<T>, row: T) {
    return String(column.value(row) ?? '—');
  }
  changeSort(event: unknown) {
    if (this.sortMode() === 'multiple') {
      if (
        typeof event !== 'object' ||
        event === null ||
        !('multisortmeta' in event) ||
        !Array.isArray(event.multisortmeta) ||
        this.controller.view().kind !== 'ready'
      )
        return;
      try {
        const sorts = parseGridSort(
          event.multisortmeta.map((item: unknown) => {
            if (
              typeof item !== 'object' ||
              item === null ||
              !('field' in item) ||
              !('order' in item) ||
              (item.order !== 1 && item.order !== -1)
            )
              throw Error('Invalid sort');
            return { field: item.field, direction: item.order === 1 ? 'asc' : 'desc' };
          }),
          this.columns().flatMap((column) => (column.sortField ? [column.sortField] : [])),
        );
        if (JSON.stringify(sorts) !== JSON.stringify(this.sorts())) this.sortsChange.emit(sorts);
      } catch {
        /* Unsupported vendor sort never becomes owner criteria. */
      }
      return;
    }
    if (
      typeof event !== 'object' ||
      event === null ||
      !('field' in event) ||
      !('order' in event) ||
      typeof event.field !== 'string' ||
      !this.columns().some((column) => column.sortField === event.field) ||
      (event.order !== 1 && event.order !== -1)
    )
      return;
    // PrimeNG applies field and order in separate effects, including on mount.
    // Commit only their final pair after the current input synchronization completes.
    this.pendingSort = {
      value: { field: event.field, direction: event.order === 1 ? 'asc' : 'desc' },
      source: this.source(),
    };
    if (this.sortScheduled) return;
    this.sortScheduled = true;
    queueMicrotask(() => {
      this.sortScheduled = false;
      const pending = this.pendingSort;
      this.pendingSort = null;
      if (
        this.destroyRef.destroyed ||
        !pending ||
        pending.source !== this.source() ||
        this.controller.view().kind !== 'ready' ||
        (this.sort()?.field === pending.value.field &&
          this.sort()?.direction === pending.value.direction)
      )
        return;
      this.sortChange.emit(pending.value);
    });
  }
  clickRow(row: T, event: Event) {
    if (!collectionRowInteraction(event)) {
      this.controller.activate(this.rowId()(row), true);
      if (
        this.selectionEnabled() &&
        this.selectionMode() === 'range' &&
        event instanceof MouseEvent &&
        event.shiftKey
      )
        this.controller.selectRange(this.rowId()(row));
    }
  }
  openRow(row: T, event: Event) {
    if (!collectionRowInteraction(event)) this.rowActivated.emit(row);
  }
  keyRow(row: T, event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      collectionRowInteraction(event) ||
      this.controller.view().kind !== 'ready' ||
      !this.controller.view().rows.includes(row)
    )
      return;
    if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      this.rowActivated.emit(row);
      return;
    }
    if (event.key === ' ' && this.selectionEnabled()) {
      event.preventDefault();
      const id = this.rowId()(row);
      if (this.selectionMode() === 'range' && event.shiftKey) this.controller.selectRange(id);
      else this.controller.toggle(id, !this.controller.selectedIds().includes(id));
      return;
    }
    if (
      this.selectionEnabled() &&
      this.selectionMode() === 'range' &&
      event.shiftKey &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp')
    ) {
      event.preventDefault();
      const target = this.rows()[this.rows().indexOf(row) + (event.key === 'ArrowDown' ? 1 : -1)];
      if (target) {
        if (!this.controller.selectedIds().length) this.controller.selectRange(this.rowId()(row));
        this.controller.selectRange(this.rowId()(target));
        this.controller.activate(this.rowId()(target), true);
      }
      return;
    }
    const view = this.controller.view(),
      target = collectionKeyTarget(event, {
        ...view.query,
        rowIndex: view.rows.indexOf(row),
        rowCount: view.rows.length,
        total: view.total,
        hasNextPage: view.hasNextPage,
        rtl: this.locale.direction() === 'rtl',
      });
    if (target !== null) {
      event.preventDefault();
      if (typeof target === 'number') this.controller.navigateIndex(target);
      else this.controller.navigate(target);
    }
  }
}
