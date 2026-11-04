import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { formatByteSize } from '../../../../../shared/data/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  CollectionCell,
  CollectionColumnPipe,
  ConfirmationDialog,
  ContentTabs,
  DialogPanel,
  FeedbackState,
  FileField,
  FormCloseGuard,
  FormContainer,
  MyDataGrid,
  OptionSelect,
  PageHeader,
  RecordSummary,
  StatusBadge,
  SurfaceCard,
  TextField,
  type CollectionColumn,
  type CollectionSource,
  type GridRowAction,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import { GlobalTemplateAccessState } from '../../state/global-template-access-state';
import { GlobalTemplatePermissions } from '../../components/global-template-permissions/global-template-permissions';
import { GlobalTemplateDesigner } from '../../components/global-template-designer/global-template-designer';
import type {
  GlobalTemplateCandidate,
  GlobalTemplateRow,
  GlobalTemplateVersion,
} from '../../types/global-template';

@Component({
  imports: [
    ReactiveFormsModule,
    ActionButton,
    AppIcon,
    CollectionCell,
    CollectionColumnPipe,
    ConfirmationDialog,
    ContentTabs,
    GlobalTemplatePermissions,
    GlobalTemplateDesigner,
    DialogPanel,
    FeedbackState,
    FileField,
    FormCloseGuard,
    FormContainer,
    MyDataGrid,
    OptionSelect,
    PageHeader,
    RecordSummary,
    StatusBadge,
    SurfaceCard,
    TextField,
    UiTextPipe,
  ],
  providers: [GlobalTemplateState, GlobalTemplateAccessState],
  selector: 'erp-global-template-manager',
  styleUrl: './global-template-manager.scss',
  templateUrl: './global-template-manager.html',
})
export class GlobalTemplateManager {
  private readonly entryForm = viewChild<FormContainer>('entryForm');
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly closeGuard = viewChild.required<FormCloseGuard>('closeGuard');
  readonly detailCloseGuard = viewChild.required<FormCloseGuard>('detailCloseGuard');
  readonly detailTab = signal('overview');
  readonly detailTabs = computed(() =>
    ['overview', 'versions', 'permissions'].map((id) => ({
      id,
      label: this.text('crystalReports.' + id),
    })),
  );
  readonly entityOptions = computed(() =>
    this.state.contracts().map((contract) => ({
      value: contract.entityKey,
      label: this.locale.translate('globalTemplates.entities.' + contract.entityKey, 'reporting'),
    })),
  );
  readonly filterEntityOptions = computed(() => [
    { value: '', label: this.text('globalTemplates.allEntities') },
    ...this.entityOptions(),
  ]);
  readonly createEntityOptions = computed(() =>
    this.entityOptions().filter((option) =>
      this.state
        .contracts()
        .some(
          (contract) =>
            contract.entityKey === option.value && this.state.canAt(contract.entityKey, 'Create'),
        ),
    ),
  );
  readonly messages = computed(() => ({
    required: this.locale.translate('crystalReports.validation.fileRequired', 'reporting'),
    invalidFile: this.locale.translate('crystalReports.fileHint', 'reporting'),
    maxlength: this.locale.translate('crystalReports.validation.descriptionLength', 'reporting'),
  }));
  readonly statusOptions = computed(() => [
    { value: '', label: this.text('crystalReports.allStatuses') },
    { value: 'published', label: this.text('crystalReports.published') },
    { value: 'draft', label: this.text('crystalReports.draft') },
    { value: 'archived', label: this.text('crystalReports.archived') },
  ]);
  readonly columns = computed<readonly CollectionColumn<GlobalTemplateRow>[]>(() => [
    {
      key: 'title',
      header: this.text('crystalReports.displayName'),
      value: (row) => row.displayName,
      minWidth: 190,
    },
    {
      key: 'entity',
      header: this.text('crystalReports.entity'),
      value: (row) => this.text('globalTemplates.entities.' + row.entityKey),
      minWidth: 150,
    },
    {
      key: 'name',
      header: this.text('crystalReports.reportKey'),
      value: (row) => row.reportKey,
      minWidth: 180,
    },
    {
      key: 'version',
      header: this.text('crystalReports.version'),
      value: (row) => (row.currentVersionNumber === null ? '—' : 'v' + row.currentVersionNumber),
      width: 100,
    },
    {
      key: 'updated',
      header: this.text('crystalReports.updatedOn'),
      value: (row) => this.dateTime(row.updatedOn),
      minWidth: 185,
    },
    {
      key: 'status',
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
  readonly versionsColumns = computed<readonly CollectionColumn<GlobalTemplateVersion>[]>(() => [
    {
      key: 'number',
      header: this.text('crystalReports.version'),
      value: (row) => row.versionNumber,
    },
    {
      key: 'title',
      header: this.text('crystalReports.displayName'),
      value: (row) =>
        row.isPublished
          ? row.summaryTitle || row.originalFileName
          : this.locale.translate('globalTemplates.versionedName', 'reporting', {
              name: row.summaryTitle || row.originalFileName,
              version: row.versionNumber,
              date: this.dateTime(row.createdOn),
            }),
      minWidth: 260,
    },
    {
      key: 'subject',
      header: this.text('globalTemplates.subject'),
      value: (row) => row.summarySubject,
      minWidth: 170,
    },
    {
      key: 'file',
      header: this.text('crystalReports.reportFile'),
      value: (row) => row.originalFileName,
      minWidth: 190,
    },
    {
      key: 'size',
      header: this.text('globalTemplates.fileSize'),
      value: (row) => formatByteSize(row.size, this.locale.language()),
      width: 120,
    },
    { key: 'sourceHash', header: 'SHA-256', value: (row) => row.sha256, minWidth: 260 },
    {
      key: 'schema',
      header: this.text('globalTemplates.schemaVersion'),
      value: (row) => row.validationContractSchemaVersion,
      width: 130,
    },
    {
      key: 'validation',
      header: this.text('globalTemplates.status'),
      value: (row) => this.text('globalTemplates.validation.' + this.state.validationStatus(row)),
    },
    {
      key: 'published',
      header: this.text('crystalReports.published'),
      value: (row) => (row.isPublished ? this.text('crystalReports.published') : ''),
    },
    {
      key: 'reason',
      header: this.text('globalTemplates.reason'),
      value: (row) => row.validationReason,
    },
    {
      key: 'hash',
      header: this.text('globalTemplates.fingerprint'),
      value: (row) => row.validationContractFingerprint,
      minWidth: 260,
    },
    {
      key: 'created',
      header: this.text('globalTemplates.createdOn'),
      value: (row) => this.dateTime(row.createdOn),
      minWidth: 185,
    },
  ]);
  readonly versionSource = computed<CollectionSource<GlobalTemplateVersion>>(() => {
    const detail = this.state.detail();
    const versions = detail?.versions ?? [];
    const query = {
      scopeKey: detail?.id ?? 'no-global-template',
      criteriaKey: detail?.rowVersion ?? '',
      pageIndex: 0,
      pageSize: Math.max(1, versions.length),
    };
    return {
      kind: 'ready',
      query,
      result: { query, rows: versions, total: versions.length, hasNextPage: false },
    };
  });
  readonly rowId = (row: GlobalTemplateRow) => row.id;
  readonly candidateId = (row: GlobalTemplateCandidate) => row.sourceId;
  readonly candidateColumns = computed<readonly CollectionColumn<GlobalTemplateCandidate>[]>(() => [
    {
      key: 'name',
      header: this.text('crystalReports.displayName'),
      value: (row) => row.displayName,
      minWidth: 200,
      flex: 2,
    },
    {
      key: 'size',
      header: this.text('globalTemplates.fileSize'),
      value: (row) => formatByteSize(row.size, this.locale.language()),
      width: 100,
    },
    {
      key: 'registered',
      header: this.text('globalTemplates.registrationStatus'),
      width: 175,
      value: (row) =>
        this.text(
          row.isImported === null
            ? 'globalTemplates.registrationUnknown'
            : row.isImported
              ? 'globalTemplates.registered'
              : 'globalTemplates.notRegistered',
        ),
    },
    {
      key: 'reason',
      header: this.text('globalTemplates.reason'),
      value: (row) => row.validationReason,
      minWidth: 200,
    },
    {
      key: 'register',
      header: this.text('globalTemplates.registerReport'),
      value: (row) => (row.isImported ? this.text('globalTemplates.registered') : ''),
      width: 208,
      compactWidth: 72,
      hideable: false,
      align: 'center',
    },
  ]);
  readonly versionId = (version: GlobalTemplateVersion) => version.id;
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
  readonly versionActions = (version: GlobalTemplateVersion): readonly GridRowAction[] => [
    ...(this.state.canVersion('Download')
      ? [
          {
            id: 'download',
            label: this.text('globalTemplates.download'),
            icon: 'arrowDown' as const,
            disabled: this.state.pending(),
          },
        ]
      : []),
    ...(this.state.canVersion('Upload')
      ? [
          {
            id: 'revalidate',
            label: this.text('globalTemplates.revalidate'),
            icon: 'refresh' as const,
            disabled: this.state.pending() || this.state.access.dirty(),
          },
        ]
      : []),
    ...(this.state.canVersion('Publish')
      ? [
          {
            id: 'publish',
            label: this.text('crystalReports.publish'),
            icon: 'check' as const,
            disabled:
              this.state.pending() || this.state.access.dirty() || !this.state.publishable(version),
          },
        ]
      : []),
  ];
  constructor() {
    void this.locale.loadNamespace('reporting');
    effect(() => {
      const feedback = this.state.feedback();
      if (feedback && Object.keys(feedback.fields).length) this.entryForm()?.revealErrors();
    });
  }
  inspect(): void {
    if (this.state.form.invalid) {
      this.entryForm()?.revealErrors();
      return;
    }
    this.state.inspect();
  }
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
  dateTime(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : new Intl.DateTimeFormat(this.locale.language(), {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }
  rowAction(event: { row: GlobalTemplateRow; action: string }): void {
    if (event.action === 'download') this.state.downloadPublished(event.row);
    if (event.action === 'detail') this.state.openDetail(event.row);
    if (event.action === 'archive') this.state.requestArchive(event.row);
  }
  versionAction(event: { row: GlobalTemplateVersion; action: string }): void {
    if (event.action === 'download') this.state.download(event.row);
    if (event.action === 'revalidate') this.state.revalidate(event.row);
    if (event.action === 'publish') this.state.publish(event.row);
  }
}
