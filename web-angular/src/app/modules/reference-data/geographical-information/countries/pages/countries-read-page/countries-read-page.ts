import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  CardList,
  CollectionCardTemplate,
  CollectionCardHeader,
  CollectionCardFooter,
  CollectionCell,
  CollectionEmptyTemplate,
  CollectionRecordFeedback,
  FeedbackNotifications,
  FeedbackState,
  MyDataGrid,
  CollectionColumnPipe,
  OptionSelect,
  PageHeader,
  RowActions,
  StatusBadge,
  SortDirectionButton,
  type CollectionSearch,
  type PageViewOption,
} from '../../../../../../shared/ui/public-api';
import { CountryReadState } from '../../state/country-read-state';
import {
  countryName,
  countryNumber,
  countryDate,
  countryPhone,
} from '../../utils/country-presentation';
import {
  countrySearchFields,
  countrySearchOperators,
  countrySortFields,
  type CountryListItem,
} from '../../types/country';
import { CountryCardHeader } from '../../components/country-card-header/country-card-header';
import { CountryCardContent } from '../../components/country-card-content/country-card-content';
import { CountryDetailDialog } from '../../components/country-detail-dialog/country-detail-dialog';
import { CountryLifecycleConfirmation } from '../../components/country-lifecycle-confirmation/country-lifecycle-confirmation';
import { CountryEditor } from '../../components/country-editor/country-editor';
import { CountryEditorState, type CountrySaved } from '../../state/country-editor-state';
import { countryColumns, countryRowActions } from '../../utils/country-list-presentation';
import { CountryLifecycleState } from '../../state/country-lifecycle-state';
import { CollectionChartView } from '../../../../../../shared/ui/charts/public-api';
import { countryChartData } from '../../utils/country-chart-data';
import { AuthSession } from '../../../../../../platform/auth/session.public-api';
import { GlobalReportView, globalReportAllowed } from '../../../../../reporting/public-api';
import { CountryImportView } from '../../components/country-import-view/country-import-view';
import { UnsavedChanges } from '../../../../../../shared/data/public-api';

@Component({
  selector: 'erp-countries-read-page',
  providers: [
    CountryReadState,
    CountryEditorState,
    CountryLifecycleState,
    CollectionRecordFeedback,
  ],
  imports: [
    CollectionColumnPipe,
    NgTemplateOutlet,
    ActionButton,
    AppIcon,
    CardList,
    CollectionCardTemplate,
    CollectionCardHeader,
    CollectionCardFooter,
    CollectionCell,
    CollectionEmptyTemplate,
    FeedbackState,
    MyDataGrid,
    OptionSelect,
    PageHeader,
    RowActions,
    StatusBadge,
    SortDirectionButton,
    CountryCardHeader,
    CountryCardContent,
    CountryDetailDialog,
    CountryLifecycleConfirmation,
    CountryEditor,
    CollectionChartView,
    GlobalReportView,
    CountryImportView,
    UiTextPipe,
  ],
  templateUrl: './countries-read-page.html',
  styleUrl: './countries-read-page.scss',
})
export class CountriesReadPage {
  readonly state = inject(CountryReadState);
  readonly editor = inject(CountryEditorState);
  readonly lifecycle = inject(CountryLifecycleState);
  readonly records = inject(CollectionRecordFeedback);
  private readonly notifications = inject(FeedbackNotifications);
  readonly actions = (row: CountryListItem) =>
    countryRowActions(
      {
        edit: this.editor.canEdit(row.id),
        archive: this.lifecycle.can(row, 'archive'),
        restore: this.lifecycle.can(row, 'restore'),
      },
      (key) => this.text(key),
    );
  act(event: { row: CountryListItem; action: string }): void {
    const current = this.state.view();
    if (current.kind !== 'ready' || !current.data.items.some((row) => row.id === event.row.id))
      return;
    if (event.action === 'view') this.state.open(event.row.id);
    else if (event.action === 'edit') this.editor.edit(event.row.id);
    else if (event.action === 'archive' || event.action === 'restore')
      this.lifecycle.request(event.row, event.action);
  }
  saved(event: CountrySaved): void {
    if (event.mode === 'edit') this.records.edited(this.state.source(), event.country.id);
    this.notifications.success(
      event.mode === 'create' ? 'countries.created' : 'countries.updated',
      'reference-countries',
    );
    this.state.refresh();
  }
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  readonly canReport = computed(
    () => this.state.canRead() && globalReportAllowed(this.auth.readIdentity()),
  );
  private readonly reportView = viewChild<GlobalReportView>('countryReport');
  private readonly drafts = inject(UnsavedChanges);
  readonly view = signal<'grid' | 'cards' | 'chart' | 'report' | 'import'>('grid');
  readonly toolbarVisible = signal(true);
  readonly views = computed<readonly PageViewOption[]>(() =>
    this.state.canRead()
      ? [
          { id: 'grid', label: this.text('views.grid'), icon: 'grid' },
          { id: 'cards', label: this.text('views.cards'), icon: 'cards' },
          { id: 'chart', label: this.text('views.chart'), icon: 'chart' },
          ...(this.canReport()
            ? [{ id: 'report', label: this.text('views.report'), icon: 'report' as const }]
            : []),
          ...(this.editor.canCreate()
            ? [{ id: 'import', label: this.text('views.import'), icon: 'dataset' as const }]
            : []),
        ]
      : [],
  );
  readonly analytics = computed(() => {
    const source = this.state.source();
    return this.view() === 'chart' && source.kind === 'ready' && source.result
      ? countryChartData(
          source.result.rows,
          source.result.total ?? 0,
          this.locale.language(),
          (key) => (key.startsWith('countries.') ? this.countryText(key) : this.text(key)),
        )
      : { metrics: [], plots: [] };
  });
  async chooseView(value: string): Promise<void> {
    if (
      !this.state.canRead() ||
      this.editor.active() ||
      this.lifecycle.pending() ||
      (value === 'report' && !this.canReport())
    )
      return;
    if (value === 'import' && !this.editor.canCreate()) return;
    if (
      (value === 'grid' ||
        value === 'cards' ||
        value === 'chart' ||
        value === 'report' ||
        value === 'import') &&
      value !== this.view()
    ) {
      const actor = this.auth.readIdentity(),
        stamp = this.drafts.stamp();
      if (
        this.view() === 'import' &&
        (!(await this.drafts.request('countries:view:' + value)) ||
          !this.drafts.matches(stamp) ||
          actor !== this.auth.readIdentity())
      )
        return;
      this.lifecycle.clearSelection();
      this.lifecycle.cancel();
      if (value === 'chart' && this.state.query().pageNumber !== 1)
        this.state.changePage({ pageIndex: 0, pageSize: this.state.query().pageSize });
      this.view.set(value);
    }
  }
  readonly id = (row: CountryListItem) => row.id;
  readonly rowLabel = (row: CountryListItem) => countryName(row, this.locale.language());
  readonly sort = computed(() => ({
    field: this.state.query().sortBy,
    direction: this.state.query().sortDirection,
  }));
  readonly columns = computed(() =>
    countryColumns({
      text: (key) => this.text(key),
      countryText: (key) => this.countryText(key),
      date: (value) => this.date(value),
      status: (row) => this.status(row),
    }),
  );
  readonly search = computed<CollectionSearch>(() => ({
    value: this.state.searchDraft(),
    maxLength: 200,
    placeholder: this.text('search.searchText'),
    field: {
      label: this.text('search.searchField'),
      value: this.state.query().searchField,
      options: countrySearchFields.map((value) => ({
        value,
        label: value === 'all' ? this.text('common.all') : this.fieldLabel(value),
      })),
    },
    operator: {
      label: this.text('search.searchType'),
      value: this.state.query().searchOperator,
      options: countrySearchOperators.map((value) => ({
        value,
        label:
          value === 'doesNotContain' || value === 'doesNotEqual'
            ? this.countryText('countries.search.operators.' + value)
            : this.text('search.' + value),
      })),
    },
  }));
  readonly statuses = computed(() =>
    ['active', 'archived', 'all'].map((value) => ({
      value,
      label: this.countryText('countries.status.' + value),
    })),
  );
  readonly sorts = computed(() =>
    countrySortFields.map((value) => ({ value, label: this.fieldLabel(value) })),
  );
  readonly subtitle = computed(
    () => this.countryText('countries.total') + ': ' + this.number(this.state.total()),
  );

  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('reference-countries');
    effect(() => {
      if (
        (this.view() === 'report' && !this.canReport()) ||
        (this.view() === 'import' && !this.editor.canCreate())
      )
        this.view.set('grid');
    });
  }
  refreshCurrent(): void {
    if (this.view() === 'report') this.reportView()?.reload();
    else this.state.refresh();
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  countryText(key: string): string {
    return this.locale.translate(key, 'reference-countries');
  }
  fieldLabel(field: string): string {
    return ['nameAr', 'nameEn', 'createdOn'].includes(field)
      ? this.text('general.' + field)
      : this.countryText('countries.' + field);
  }
  status(row: CountryListItem): string {
    return this.countryText(
      row.isDeleted ? 'countries.status.archived' : 'countries.status.active',
    );
  }
  number(value: number): string {
    return countryNumber(value, this.locale.language());
  }
  date(value: string | null): string {
    return countryDate(value, this.locale.language());
  }
  phone(value: string | null): string {
    return countryPhone(value);
  }
  chooseSort(field: string): void {
    this.state.changeSort({ field, direction: this.state.query().sortDirection });
  }
  reverseSort(): void {
    this.state.changeSort({
      field: this.state.query().sortBy,
      direction: this.state.query().sortDirection === 'asc' ? 'desc' : 'asc',
    });
  }
}
