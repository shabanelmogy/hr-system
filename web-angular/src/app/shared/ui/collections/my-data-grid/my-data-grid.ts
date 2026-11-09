import { GridExpansionState } from './grid-expansion-state';
import { indexGridTemplates } from './grid-template-index';
import { GridContextState } from './grid-context-state';
import { GridQueryState } from './grid-query-state';
import { attachGridViewport } from './grid-viewport';
import {
  Component,
  type ElementRef,
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
import { Table, TableModule } from 'primeng/table';
import type { ColumnFilterPassThrough, TableFilterButtonPropsOptions } from 'primeng/types/table';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { RowActions } from '../row-actions/row-actions';
import type { CollectionRecordRequest } from '../collection-record-feedback';
import { collectionKeyTarget } from '../collection-keyboard';
import { ContextMenuPanel } from '../../overlays/context-menu-panel/context-menu-panel';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import { GridLocale } from '../../../../../theme/grid-public-api';
import { GridFilterInput } from '../grid-filter-input/grid-filter-input';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';
import { setPrimeGridFilterDraft } from '../grid-filter-adapter';
import { gridFilterModes, type GridFilters, type GridColumnFilter } from '../grid-filter.types';
import {
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
import { GridGeometry } from './grid-geometry';
import { downloadBlob } from '../../../data/public-api';
import { createCollectionController } from '../collection-controller';
import { attachCollectionFocus, collectionRowInteraction } from '../collection-focus';
import {
  collectionPageSizes,
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
  readonly locale = inject(UI_LOCALIZATION);
  readonly source = input.required<CollectionSource<T>>();
  readonly label = input.required<string>();
  readonly columns = input.required<readonly CollectionColumn<T>[]>();
  readonly rowId = input.required<(row: T) => CollectionId>();
  readonly rowLabel = input<(row: T) => string>((row) => String(this.rowId()(row)));
  readonly selectable = input<(row: T) => boolean>(() => true);
  readonly selectionEnabled = input(false);
  readonly sort = input<CollectionSort | null>();
  private readonly table = viewChild(Table);
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
  readonly actionDisplay = input<'menu' | 'inline' | 'responsive'>('responsive');
  readonly resolvedActionDisplay = computed(() =>
    this.actionDisplay() === 'responsive'
      ? this.availableWidth() < 600
        ? 'menu'
        : 'inline'
      : this.actionDisplay(),
  );
  readonly stickyActions = input(false);
  readonly actionColumnWidth = computed(() =>
    this.resolvedActionDisplay() === 'inline'
      ? Math.max(
          128,
          ...this.rows().map((row) => {
            const count = this.contextActions()?.(row).length ?? 0;
            return count * 44 + Math.max(0, count - 1) * 4 + 16;
          }),
        )
      : 60,
  );
  readonly cellContextFilter = input(true);
  private readonly rowMenu = viewChild<ContextMenuPanel>('rowMenu');
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
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly sorts = input<readonly GridSortItem[]>([]);
  readonly sortsChange = output<readonly GridSortItem[]>();
  readonly columnOrderChange = output<readonly string[]>();
  readonly columnWidthsChange = output<Readonly<Record<string, number>>>();
  readonly csv = input<GridCsvOptions | null>(null);
  readonly csvExported = output<{ readonly rows: number; readonly filename: string }>();
  readonly details = contentChild(CollectionRowDetails<T>);
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
  private readonly queryState = new GridQueryState<T>({
    columns: this.columns,
    advancedFilters: this.advancedFilters,
    filters: this.filters,
    sorts: this.sorts,
    sort: this.sort,
    sortMode: this.sortMode,
    source: this.source,
    ready: () => this.controller.view().kind === 'ready',
    locale: this.locale,
    filtersChange: (value) => this.filtersChange.emit(value),
    sortsChange: (value) => this.sortsChange.emit(value),
    sortChange: (value) => this.sortChange.emit(value),
    clearSortPresentation: () => {
      const table = this.table();
      if (!table) return;
      // PrimeNG reset mutates filter values. Keep the current filter snapshot intact.
      const filters = table.filters;
      table.filters = {};
      table.reset();
      table.filters = filters;
    },
  });
  readonly filterDefinitions = this.queryState.filterDefinitions;
  readonly filterContractValid = this.queryState.filterContractValid;
  readonly nativeFilters = this.queryState.nativeFilters;
  readonly nativeSorts = this.queryState.nativeSorts;
  readonly filterInvalid = this.queryState.filterInvalid;
  readonly pageChange = output<CollectionPageRequest>();
  readonly activeChange = output<CollectionId | null>();
  readonly selectionChange = output<readonly CollectionId[]>();
  readonly sortChange = output<CollectionSort | null>();
  readonly searchChange = output<CollectionSearchChange>();
  readonly retry = output<void>();
  readonly rowActivated = output<T>();
  readonly rowActivation = input<'double-click' | 'click'>('double-click');
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
  private readonly cellTemplates = indexGridTemplates(
    this.cells,
    (cell) => cell.erpCollectionCell().key,
  );
  private readonly headerTemplates = indexGridTemplates(
    this.columnHeaders,
    (header) => header.erpCollectionColumnHeader().key,
  );
  private readonly footerTemplates = indexGridTemplates(
    this.columnFooters,
    (footer) => footer.erpCollectionColumnFooter().key,
  );
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
      (this.selectionEnabled() ? 52 : 0) +
      (this.details() ? 52 : 0) +
      (this.contextActions() ? this.actionColumnWidth() : 0),
  );
  private readonly geometry = new GridGeometry<T>({
    columns: this.columns,
    displayColumns: this.displayColumns,
    availableWidth: this.availableWidth,
    reservedWidth: this.reservedWidth,
    widths: this.widths,
    pins: this.pins,
    display: this.display,
    contextActions: this.contextActions,
    stickyActions: this.stickyActions,
    actionColumnWidth: this.actionColumnWidth,
    columnWidthsChange: (widths) => this.columnWidthsChange.emit(widths),
  });
  private readonly headerMinimums = this.geometry.headerMinimums;
  readonly resolvedWidths = this.geometry.resolvedWidths;
  readonly tableWidth = this.geometry.tableWidth;
  compact(column: CollectionColumn<T>) {
    return this.geometry.compact(column);
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
      background: 'color-mix(in srgb, var(--muted) 60%, var(--surface))',
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
  private readonly expansionState = new GridExpansionState<T>({
    grouping: this.grouping,
    columns: this.columns,
    details: this.details,
    frozenRows: this.frozenRows,
    rows: this.rows,
    ready: () => this.controller.view().kind === 'ready',
    total: () => this.controller.view().total,
    rowId: this.rowId,
    dataKey: this.dataKey,
    detailToggle: (event) => this.detailToggle.emit(event),
  });
  readonly expanded = this.expansionState.expanded;
  readonly groupColumn = this.expansionState.groupColumn;
  readonly groupingValid = this.expansionState.groupingValid;
  private readonly contextState = new GridContextState<T>({
    source: this.source,
    rows: this.rows,
    ready: () => this.controller.view().kind === 'ready',
    contextActions: this.contextActions,
    cellContextFilter: this.cellContextFilter,
    advancedFilters: this.advancedFilters,
    filterContractValid: this.filterContractValid,
    filters: this.filters,
    filterDefinitions: this.filterDefinitions,
    displayColumns: this.displayColumns,
    rowMenu: this.rowMenu,
    locale: this.locale,
    filtersChange: (value) => this.filtersChange.emit(value),
    rowAction: (value) => this.rowAction.emit(value),
    clearFilterError: () => this.filterInvalid.set(false),
  });
  readonly contextItems = this.contextState.contextItems;
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
        this.contextState.reset();
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
      filename = gridCsvFilename(options.filename);
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
    this.csvExported.emit({ rows: rows.length, filename });
  }
  toggleDetails(row: T) {
    this.expansionState.toggleDetails(row);
  }
  groupLabel(row: T) {
    return this.expansionState.groupLabel(row);
  }
  toggleGroup(row: T) {
    this.expansionState.toggleGroup(row);
  }
  openContext(row: T, event: MouseEvent) {
    this.contextState.openContext(row, event);
  }
  rowActionsDisabled(row: T): boolean {
    return !(this.contextActions()?.(row).some((action) => !action.disabled) ?? false);
  }
  runContextCommand(id: string) {
    this.contextState.runContextCommand(id);
  }
  dismissContext() {
    this.contextState.dismissContext();
  }
  activateRowAction(row: T, action: string) {
    this.contextState.activateRowAction(row, action);
  }
  width(column: CollectionColumn<T>) {
    return this.geometry.width(column);
  }
  columnStyleWidth(column: CollectionColumn<T>) {
    return this.geometry.columnStyleWidth(column);
  }
  minimum(column: CollectionColumn<T>) {
    return this.geometry.minimum(column);
  }
  pinned(column: CollectionColumn<T>) {
    return this.geometry.pinned(column);
  }
  frozenOffset(column: CollectionColumn<T>) {
    return this.geometry.frozenOffset(column);
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
    return this.queryState.filterModes(definition);
  }
  changeFilters(event: unknown) {
    this.queryState.changeFilters(event);
  }
  resized(event: unknown) {
    this.geometry.resized(event);
  }
  reordered(event: unknown) {
    return this.presentationState.reordered(event);
  }
  cell(column: CollectionColumn<T>) {
    return this.cellTemplates().get(column.key);
  }
  columnHeader(column: CollectionColumn<T>) {
    return this.headerTemplates().get(column.key);
  }
  columnFooter(column: CollectionColumn<T>) {
    return this.footerTemplates().get(column.key);
  }
  groupHeaderWidth(columns: readonly CollectionColumn<T>[]) {
    return columns.reduce((sum, column) => sum + this.width(column), 0);
  }
  value(column: CollectionColumn<T>, row: T) {
    return String(column.value(row) ?? '—');
  }
  selectionInputId(row: T): string {
    return this.selectionName + '-row-' + encodeURIComponent(this.controller.rowKey(row));
  }
  changeSort(event: unknown) {
    this.queryState.changeSort(event);
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
      if (this.rowActivation() === 'click') this.activateRow(row, event);
    }
  }
  openRow(row: T, event: Event) {
    if (this.rowActivation() === 'double-click') this.activateRow(row, event);
  }
  private activateRow(row: T, event: Event): void {
    if (
      !collectionRowInteraction(event) &&
      this.controller.view().kind === 'ready' &&
      this.controller.view().rows.includes(row)
    )
      this.rowActivated.emit(row);
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
