import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import { AuthSession } from '../../../../../../platform/auth/session.public-api';
import { createViewPreference, UnsavedChanges } from '../../../../../../shared/data/public-api';
import {
  CollectionRecordFeedback,
  FeedbackNotifications,
  FeedbackState,
  PageHeader,
  CollectionEmptyTemplate,
  type PageViewOption,
  type CollectionSearch,
} from '../../../../../../shared/ui/public-api';
import { CollectionChartView } from '../../../../../../shared/ui/charts/public-api';
import { GlobalReportView, globalReportAllowed } from '../../../../../reporting/public-api';
import { StateReadState } from '../../state/state-read-state';
import { StateCountriesState } from '../../state/state-countries-state';
import { StateEditorState, type StateSaved } from '../../state/state-editor-state';
import { StateLifecycleState } from '../../state/state-lifecycle-state';
import { StateCollectionView } from '../../components/state-collection-view/state-collection-view';
import { StateListCriteria } from '../../components/state-list-criteria/state-list-criteria';
import { StateEditor } from '../../components/state-editor/state-editor';
import { StateDetailDialog } from '../../components/state-detail-dialog/state-detail-dialog';
import { StateLifecycleConfirmation } from '../../components/state-lifecycle-confirmation/state-lifecycle-confirmation';
import { StateImportView } from '../../components/state-import-view/state-import-view';
import { stateChartData } from '../../utils/state-chart-data';
import { stateSearchFields, stateSearchOperators, type StateListItem } from '../../types/state';

type StateView = 'grid' | 'cards' | 'chart' | 'report' | 'import';

@Component({
  selector: 'erp-states-page',
  providers: [
    StateReadState,
    StateCountriesState,
    StateEditorState,
    StateLifecycleState,
    CollectionRecordFeedback,
  ],
  imports: [
    PageHeader,
    FeedbackState,
    CollectionEmptyTemplate,
    StateCollectionView,
    StateListCriteria,
    StateEditor,
    StateDetailDialog,
    StateLifecycleConfirmation,
    StateImportView,
    CollectionChartView,
    GlobalReportView,
    UiTextPipe,
  ],
  templateUrl: './states-page.html',
  styleUrl: './states-page.scss',
})
export class StatesPage {
  private readonly exportCollection = viewChild(StateCollectionView);
  readonly exportSource = computed(() =>
    ['grid', 'cards'].includes(this.view())
      ? this.state.exportSource(this.exportCollection()?.columns() ?? [], this.locale.language())
      : null,
  );

  readonly state = inject(StateReadState);
  readonly parents = inject(StateCountriesState);
  readonly editor = inject(StateEditorState);
  readonly lifecycle = inject(StateLifecycleState);
  readonly records = inject(CollectionRecordFeedback);
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  private readonly notices = inject(FeedbackNotifications);
  private readonly drafts = inject(UnsavedChanges);
  private readonly report = viewChild<GlobalReportView>('stateReport');
  private readonly preference = createViewPreference<StateView>({
    storageKey: 'erp-angular:views:states-view-layout',
    defaultValue: 'grid',
    allowedValues: () => this.views().map((view) => view.id),
    canSynchronize: () =>
      this.state.canRead() &&
      !this.editor.active() &&
      !this.lifecycle.pending() &&
      !this.drafts.busy() &&
      !this.drafts.dirty(),
  });
  readonly view = this.preference.value;
  readonly toolbarVisible = signal(true);
  readonly canReport = computed(
    () => this.state.canRead() && globalReportAllowed(this.auth.readIdentity(), 'states'),
  );
  readonly id = (row: StateListItem) => row.id;
  readonly views = computed<readonly PageViewOption<StateView>[]>(() =>
    this.state.canRead()
      ? [
          { id: 'grid', label: this.text('views.grid'), icon: 'grid' },
          { id: 'cards', label: this.text('views.cards'), icon: 'cards' },
          { id: 'chart', label: this.text('views.chart'), icon: 'chart' },
          ...(this.canReport()
            ? [{ id: 'report' as const, label: this.text('views.report'), icon: 'report' as const }]
            : []),
          ...(this.editor.canCreate()
            ? [
                {
                  id: 'import' as const,
                  label: this.text('views.import'),
                  icon: 'dataset' as const,
                },
              ]
            : []),
        ]
      : [],
  );
  readonly analytics = computed(() => {
    const source = this.state.source();
    return this.view() === 'chart' && source.kind === 'ready' && source.result
      ? stateChartData(
          source.result.rows,
          source.result.total ?? 0,
          this.locale.language(),
          (key) => this.stateText(key),
        )
      : { metrics: [], plots: [] };
  });
  readonly chartSearch = computed<CollectionSearch>(() => ({
    value: this.state.searchDraft(),
    maxLength: 200,
    placeholder: this.stateText('states.search.placeholder'),
    field: {
      label: this.text('search.searchField'),
      value: this.state.query().searchField,
      options: stateSearchFields.map((value) => ({
        value,
        label:
          value === 'all'
            ? this.text('common.all')
            : value === 'nameAr' || value === 'nameEn'
              ? this.text('general.' + value)
              : this.stateText('states.' + value),
      })),
    },
    operator: {
      label: this.text('search.searchType'),
      value: this.state.query().searchOperator,
      options: stateSearchOperators.map((value) => ({
        value,
        label: this.stateText('states.search.operators.' + value),
      })),
    },
  }));
  constructor() {
    effect(() => {
      if (this.state.parentRevision() > 0) untracked(() => this.parents.invalidate());
    });
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('reference-states');
    effect(() => {
      const view = this.view();
      untracked(() => {
        this.lifecycle.clearSelection();
        this.lifecycle.cancel();
        if (view === 'chart' && this.state.query().pageNumber !== 1)
          this.state.changePage({ pageIndex: 0, pageSize: this.state.query().pageSize });
      });
    });
  }
  async chooseView(value: string): Promise<void> {
    if (
      !this.state.canRead() ||
      this.editor.active() ||
      this.lifecycle.pending() ||
      (value === 'report' && !this.canReport()) ||
      (value === 'import' && !this.editor.canCreate())
    )
      return;
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
        (!(await this.drafts.request('states:view:' + value)) ||
          !this.drafts.matches(stamp) ||
          actor !== this.auth.readIdentity())
      )
        return;
      this.lifecycle.clearSelection();
      this.lifecycle.cancel();
      if (value === 'chart' && this.state.query().pageNumber !== 1)
        this.state.changePage({ pageIndex: 0, pageSize: this.state.query().pageSize });
      this.preference.choose(value);
    }
  }
  saved(event: StateSaved): void {
    if (event.mode === 'edit') this.records.edited(this.state.source(), event.state.id);
    this.notices.success(
      event.mode === 'create' ? 'states.created' : 'states.updated',
      'reference-states',
    );
    this.state.refresh();
  }
  refreshCurrent(): void {
    if (this.view() === 'report') this.report()?.reload();
    else {
      this.state.refresh();
      this.parents.refresh();
    }
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  stateText(key: string): string {
    return this.locale.translate(key, 'reference-states');
  }
}
