import { Component, computed, inject, viewChild } from '@angular/core';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  ActionMenuButton,
  AppIcon,
  CollectionCell,
  CollectionColumnPipe,
  FeedbackState,
  MyDataGrid,
  OptionSelect,
  PageHeader,
  StatusBadge,
  type CollectionColumn,
  type GridRowAction,
  type ActionMenuItem,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import { globalTemplateColumnFilters } from '../../types/global-template-filters';
import type { GlobalTemplateRow } from '../../types/global-template';
import { formatGlobalTemplateDateTime } from '../../utils/global-template-presentation';
import { GlobalTemplateDesigner } from '../global-template-designer/global-template-designer';

type TemplateToolbarAction = 'upload' | 'register' | 'design' | 'schema';

@Component({
  imports: [
    ActionButton,
    ActionMenuButton,
    AppIcon,
    CollectionCell,
    CollectionColumnPipe,
    FeedbackState,
    GlobalTemplateDesigner,
    MyDataGrid,
    OptionSelect,
    PageHeader,
    StatusBadge,
    UiTextPipe,
  ],
  selector: 'erp-global-template-list',
  templateUrl: './global-template-list.html',
})
export class GlobalTemplateList {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly exportSource = computed(() =>
    this.state.exportSource(this.columns(), this.locale.language()),
  );
  private readonly designer = viewChild(GlobalTemplateDesigner);
  readonly toolbarActions = computed<readonly ActionMenuItem<TemplateToolbarAction>[]>(() => {
    const create = this.state.filterEntity()
      ? this.state.can('Create')
      : this.state.canAny('Create');
    return [
      ...(create
        ? [
            {
              id: 'upload' as const,
              label: this.text('globalTemplates.design.uploadExisting'),
              icon: 'upload' as const,
            },
            {
              id: 'register' as const,
              label: this.text('globalTemplates.registerExisting'),
              icon: 'add' as const,
            },
            {
              id: 'design' as const,
              label: this.text('globalTemplates.design.title'),
              icon: 'edit' as const,
            },
          ]
        : []),
      ...(this.state.canAny('Download')
        ? [
            {
              id: 'schema' as const,
              label: this.text('globalTemplates.downloadSchema'),
              icon: 'download' as const,
              disabled: !this.state.filterEntity() || !this.state.can('Download'),
            },
          ]
        : []),
    ];
  });
  toolbarAction(id: TemplateToolbarAction): void {
    if (
      this.state.pending() ||
      !this.toolbarActions().some((action) => action.id === id && !action.disabled)
    )
      return;
    if (id === 'upload') this.state.openEditor(null);
    if (id === 'register') this.state.loadCandidates();
    if (id === 'design') this.designer()?.open();
    if (id === 'schema') this.state.schema();
  }
  readonly entityOptions = computed(() =>
    this.state.contracts().map((contract) => ({
      value: contract.entityKey,
      label: this.text('globalTemplates.entities.' + contract.entityKey),
    })),
  );
  readonly filterEntityOptions = computed(() => [
    { value: '', label: this.text('globalTemplates.allEntities') },
    ...this.entityOptions(),
  ]);
  readonly statusOptions = computed(() => [
    { value: '', label: this.text('crystalReports.allStatuses') },
    { value: 'published', label: this.text('crystalReports.published') },
    { value: 'draft', label: this.text('globalTemplates.draft') },
    { value: 'archived', label: this.text('crystalReports.archived') },
  ]);
  readonly columns = computed<readonly CollectionColumn<GlobalTemplateRow>[]>(() => [
    {
      key: 'title',
      filter: globalTemplateColumnFilters.title,
      header: this.text('crystalReports.displayName'),
      value: (row) => row.displayName,
      minWidth: 190,
    },
    {
      key: 'entity',
      filter: { ...globalTemplateColumnFilters.entity, choices: this.entityOptions() },
      header: this.text('crystalReports.entity'),
      value: (row) => this.text('globalTemplates.entities.' + row.entityKey),
      minWidth: 150,
    },
    {
      key: 'name',
      filter: globalTemplateColumnFilters.name,
      header: this.text('crystalReports.reportKey'),
      value: (row) => row.reportKey,
      minWidth: 180,
    },
    {
      key: 'version',
      filter: globalTemplateColumnFilters.version,
      header: this.text('crystalReports.version'),
      value: (row) => (row.currentVersionNumber === null ? '—' : 'v' + row.currentVersionNumber),
      width: 100,
    },
    {
      key: 'updated',
      filter: globalTemplateColumnFilters.updated,
      header: this.text('crystalReports.updatedOn'),
      value: (row) => formatGlobalTemplateDateTime(row.updatedOn, this.locale.language()),
      minWidth: 185,
    },
    {
      key: 'status',
      filter: {
        ...globalTemplateColumnFilters.status,
        choices: this.statusOptions().filter((option) => option.value !== ''),
      },
      header: this.text('globalTemplates.status'),
      value: (row) =>
        this.text(
          row.isArchived
            ? 'crystalReports.archived'
            : row.isPublished
              ? 'crystalReports.published'
              : 'globalTemplates.draft',
        ),
    },
  ]);
  readonly rowId = (row: GlobalTemplateRow) => row.id;
  readonly rowActions = (row: GlobalTemplateRow): readonly GridRowAction[] => [
    { id: 'detail', label: this.locale.translate('actions.view'), icon: 'report' },
    ...(this.state.can('Download') && row.isPublished && !row.isArchived
      ? [
          {
            id: 'download',
            label: this.text('globalTemplates.download'),
            icon: 'arrowDown' as const,
            disabled: this.state.pending(),
          },
        ]
      : []),
    ...(this.state.can('Archive') && !row.isArchived
      ? [
          {
            id: 'archive',
            label: this.text('crystalReports.archive'),
            icon: 'archive' as const,
            disabled: this.state.pending(),
          },
        ]
      : []),
  ];
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
  rowAction(event: { row: GlobalTemplateRow; action: string }): void {
    if (event.action === 'download') this.state.downloadPublished(event.row);
    if (event.action === 'detail') this.state.openDetail(event.row);
    if (event.action === 'archive') this.state.requestArchive(event.row);
  }
}
