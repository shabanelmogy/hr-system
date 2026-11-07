import { Component, computed, inject } from '@angular/core';
import { formatByteSize } from '../../../../../shared/data/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  CollectionCell,
  CollectionColumnPipe,
  MyDataGrid,
  StatusBadge,
  type CollectionColumn,
  type CollectionSource,
  type GridRowAction,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import type { GlobalTemplateVersion } from '../../types/global-template';
import { formatGlobalTemplateDateTime } from '../../utils/global-template-presentation';

@Component({
  imports: [
    ActionButton,
    AppIcon,
    CollectionCell,
    CollectionColumnPipe,
    MyDataGrid,
    StatusBadge,
    UiTextPipe,
  ],
  selector: 'erp-global-template-versions',
  templateUrl: './global-template-versions.html',
})
export class GlobalTemplateVersions {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly columns = computed<readonly CollectionColumn<GlobalTemplateVersion>[]>(() => [
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
              date: formatGlobalTemplateDateTime(row.createdOn, this.locale.language()),
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
      value: (row) => formatGlobalTemplateDateTime(row.createdOn, this.locale.language()),
      minWidth: 185,
    },
  ]);
  readonly source = computed<CollectionSource<GlobalTemplateVersion>>(() => {
    const detail = this.state.detail();
    const rows = detail?.versions ?? [];
    const query = {
      scopeKey: detail?.id ?? 'no-global-template',
      criteriaKey: detail?.rowVersion ?? '',
      pageIndex: 0,
      pageSize: Math.max(1, rows.length),
    };
    return {
      kind: 'ready',
      query,
      result: { query, rows, total: rows.length, hasNextPage: false },
    };
  });
  readonly rowId = (row: GlobalTemplateVersion) => row.id;
  readonly actions = (row: GlobalTemplateVersion): readonly GridRowAction[] => [
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
              this.state.pending() || this.state.access.dirty() || !this.state.publishable(row),
          },
        ]
      : []),
    ...(this.state.canVersion('Upload') && this.state.canVersion('Publish')
      ? [
          {
            id: 'verify-database',
            label: this.text('globalTemplates.verifyDatabase'),
            icon: 'refresh' as const,
            disabled: this.state.pending() || this.state.access.dirty(),
          },
        ]
      : []),
  ];
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
  action(event: { row: GlobalTemplateVersion; action: string }): void {
    if (event.action === 'download') this.state.download(event.row);
    if (event.action === 'revalidate') this.state.revalidate(event.row);
    if (event.action === 'publish') this.state.publish(event.row);
    if (event.action === 'verify-database') this.state.verifyDatabase(event.row);
  }
}
