import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
} from '../../../../../../shared/ui/public-api';
import { CollectionChartView } from '../../../../../../shared/ui/charts/public-api';
import { GlobalReportView, globalReportAllowed } from '../../../../../reporting/public-api';
import { DistrictReadState } from '../../state/district-read-state';
import { DistrictStatesState } from '../../state/district-states-state';
import { DistrictEditorState, type DistrictSaved } from '../../state/district-editor-state';
import { DistrictLifecycleState } from '../../state/district-lifecycle-state';
import { DistrictCollectionView } from '../../components/district-collection-view/district-collection-view';
import { DistrictEditor } from '../../components/district-editor/district-editor';
import { DistrictDetailDialog } from '../../components/district-detail-dialog/district-detail-dialog';
import { DistrictLifecycleConfirmation } from '../../components/district-lifecycle-confirmation/district-lifecycle-confirmation';
import { DistrictImportView } from '../../components/district-import-view/district-import-view';
import { districtChartData } from '../../utils/district-chart-data';
import { type DistrictListItem } from '../../types/district';

type DistrictView = 'grid' | 'cards' | 'chart' | 'report' | 'import';

@Component({
  selector: 'erp-districts-page',
  providers: [
    DistrictReadState,
    DistrictStatesState,
    DistrictEditorState,
    DistrictLifecycleState,
    CollectionRecordFeedback,
  ],
  imports: [
    NgTemplateOutlet,
    PageHeader,
    FeedbackState,
    CollectionEmptyTemplate,
    DistrictCollectionView,
    DistrictEditor,
    DistrictDetailDialog,
    DistrictLifecycleConfirmation,
    DistrictImportView,
    CollectionChartView,
    GlobalReportView,
    UiTextPipe,
  ],
  templateUrl: './districts-page.html',
  styleUrl: './districts-page.scss',
})
export class DistrictsPage {
  private readonly exportCollection = viewChild(DistrictCollectionView);
  readonly exportSource = computed(() =>
    ['grid', 'cards'].includes(this.view())
      ? this.state.exportSource(this.exportCollection()?.columns() ?? [], this.locale.language())
      : null,
  );

  readonly state = inject(DistrictReadState);
  readonly parents = inject(DistrictStatesState);
  readonly editor = inject(DistrictEditorState);
  readonly lifecycle = inject(DistrictLifecycleState);
  readonly records = inject(CollectionRecordFeedback);
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  private readonly notices = inject(FeedbackNotifications);
  private readonly drafts = inject(UnsavedChanges);
  private readonly report = viewChild<GlobalReportView>('districtReport');
  private readonly importView = viewChild<DistrictImportView>('districtImport');
  readonly importHeaderActions = computed(() =>
    this.view() === 'import' ? (this.importView()?.headerActions() ?? null) : null,
  );
  readonly reportHeaderActions = computed(() =>
    this.view() === 'report' ? (this.report()?.headerActions() ?? null) : null,
  );
  private readonly preference = createViewPreference<DistrictView>({
    storageKey: 'erp-angular:views:districts-view-layout',
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
  readonly searchVisible = signal(false);
  readonly reportFiltersVisible = signal(true);
  readonly filtersVisible = computed(() =>
    this.view() === 'report' ? this.reportFiltersVisible() : this.searchVisible(),
  );
  readonly canReport = computed(
    () => this.state.canRead() && globalReportAllowed(this.auth.readIdentity(), 'districts'),
  );
  readonly id = (row: DistrictListItem) => row.id;
  readonly views = computed<readonly PageViewOption<DistrictView>[]>(() =>
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
      ? districtChartData(
          source.result.rows,
          source.result.total ?? 0,
          this.locale.language(),
          (key) => this.districtText(key),
        )
      : { metrics: [], plots: [] };
  });

  constructor() {
    effect(() => {
      if (this.state.parentRevision() > 0) untracked(() => this.parents.invalidate());
    });
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('reference-districts');
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
  toggleFilters(): void {
    const visible = this.view() === 'report' ? this.reportFiltersVisible : this.searchVisible;
    visible.update((open) => !open);
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
        (!(await this.drafts.request('districts:view:' + value)) ||
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
  saved(event: DistrictSaved): void {
    if (event.mode === 'edit') this.records.edited(this.state.source(), event.state.id);
    this.notices.success(
      event.mode === 'create' ? 'districts.created' : 'districts.updated',
      'reference-districts',
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
  districtText(key: string): string {
    return this.locale.translate(key, 'reference-districts');
  }
}
