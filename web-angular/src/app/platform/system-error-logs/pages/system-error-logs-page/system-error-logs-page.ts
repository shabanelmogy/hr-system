import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { SYSTEM_ERROR_LOG_REPORT } from '../../system-error-log-report-slot';
import { ErrorLogCriteria } from '../../components/error-log-criteria/error-log-criteria';
import { AuthSession } from '../../../auth/session.public-api';
import {
  createViewPreference,
  UnsavedChanges,
  TABULAR_FILE_WRITER,
} from '../../../../shared/data/public-api';
import {
  ActionButton,
  type PageViewOption,
  CollectionRecordFeedback,
  FeedbackState,
  PageHeader,
} from '../../../../shared/ui/public-api';
import { ErrorLogReadState } from '../../state/error-log-read-state';
import { ErrorLogDetailState } from '../../state/error-log-detail-state';
import { ErrorLogExportState } from '../../state/error-log-export-state';
import { ErrorLogPresentation } from '../../presentation/error-log-presentation';
import { ErrorLogCollection } from '../../components/error-log-collection/error-log-collection';
import { ErrorLogDetails } from '../../components/error-log-details/error-log-details';
import { errorLogSettingsAllowed } from '../../system-error-log-access';

@Component({
  providers: [
    ErrorLogPresentation,
    ErrorLogReadState,
    ErrorLogDetailState,
    ErrorLogExportState,
    CollectionRecordFeedback,
  ],
  imports: [
    NgComponentOutlet,
    ErrorLogCriteria,
    ActionButton,
    PageHeader,
    FeedbackState,
    ErrorLogCollection,
    ErrorLogDetails,
  ],
  styleUrl: './system-error-logs-page.scss',
  selector: 'erp-system-error-logs-page',
  templateUrl: './system-error-logs-page.html',
})
export class SystemErrorLogsPage {
  readonly reads = inject(ErrorLogReadState);
  private readonly collection = viewChild(ErrorLogCollection);
  private readonly fileWriter = inject(TABULAR_FILE_WRITER, { optional: true });
  readonly generalExport = computed(() => this.fileWriter?.allowed() ?? false);
  readonly exportSource = computed(() =>
    this.reads.exportSource(
      [
        ...(this.collection()?.columns() ?? []),
        {
          key: 'correlationId',
          header: this.captions.text('correlation'),
          value: (row) => row.correlationId,
        },
      ],
      this.captions.locale.language(),
    ),
  );
  readonly exports = inject(ErrorLogExportState);
  readonly captions = inject(ErrorLogPresentation);
  private readonly auth = inject(AuthSession);
  private readonly router = inject(Router);
  readonly filtersVisible = signal(false);
  private readonly drafts = inject(UnsavedChanges);
  readonly reportAdapter = inject(SYSTEM_ERROR_LOG_REPORT);
  readonly reportAllowed = computed(
    () => this.reportAdapter?.allowed(this.auth.readIdentity()) ?? false,
  );
  readonly reportCriteria = computed(() => {
    const { page, pageSize, ...criteria } = this.reads.criteria() ?? { page: 1, pageSize: 25 };
    void page;
    void pageSize;
    return { nameAr: '', nameEn: '', systemErrorLogs: criteria };
  });
  readonly reportInputs = computed(() => ({
    entity: 'system-error-logs',
    embedded: true,
    externalCriteria: this.reportCriteria(),
  }));
  readonly preference = createViewPreference<'grid' | 'cards' | 'report'>({
    storageKey: 'erp-angular:views:error-logs-system-view',
    defaultValue: 'grid',
    allowedValues: () =>
      this.reads.canRead()
        ? ['grid', 'cards', ...(this.reportAllowed() ? ['report' as const] : [])]
        : [],
    canSynchronize: () => !this.drafts.busy() && !this.drafts.dirty(),
  });
  readonly view = this.preference.value;
  readonly canOpenSettings = computed(() => errorLogSettingsAllowed(this.auth.readIdentity()));
  readonly views = computed<readonly PageViewOption<'grid' | 'cards' | 'report'>[]>(() => [
    { id: 'grid', label: this.captions.core('views.grid'), icon: 'grid' as const },
    { id: 'cards', label: this.captions.core('views.cards'), icon: 'cards' as const },
    ...(this.reportAllowed()
      ? [
          {
            id: 'report' as const,
            label: this.captions.core('views.report'),
            icon: 'report' as const,
          },
        ]
      : []),
  ]);
  selectView(value: string): void {
    this.preference.choose(value);
  }
  openSettings(): void {
    if (this.canOpenSettings()) void this.router.navigateByUrl('/super-admin/error-log-settings');
  }
}
