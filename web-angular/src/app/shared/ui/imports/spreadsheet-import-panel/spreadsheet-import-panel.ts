import { Component, input, output, viewChild, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import type { FileSelectEvent } from 'primeng/types/fileupload';
import type { ImportRowStatus } from '../../../data/spreadsheet-public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { SurfaceCard } from '../../layout/surface-card/surface-card';
import { ActionButton } from '../../buttons/public-api';
import { AppIcon } from '../../icons/app-icon/app-icon';
import { MetricCard } from '../../cards/metric-card/metric-card';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';
import { StatusBadge } from '../../feedback/status-badge/status-badge';

/** File bytes remain local. Only the feature's validated JSON command may reach its API. */
@Component({
  selector: 'erp-spreadsheet-import-panel',
  imports: [
    ActionButton,
    AppIcon,
    FeedbackState,
    FileUpload,
    MetricCard,
    StatusBadge,
    SurfaceCard,
    UiTextPipe,
    NgTemplateOutlet,
  ],
  templateUrl: './spreadsheet-import-panel.html',
  styleUrl: './spreadsheet-import-panel.scss',
})
export class SpreadsheetImportPanel {
  readonly externalActions = input(false);
  readonly actionsTemplate = viewChild.required('importActions', { read: TemplateRef });
  readonly maxSizeMb = input(5);
  readonly maxRows = input(100);
  readonly canSubmit = input(true);
  readonly headers = input.required<string>();
  readonly fileName = input('');
  readonly rowCount = input(0);
  readonly busy = input(false);
  readonly locked = input(false);
  readonly disabled = input(false);
  readonly failed = input(false);
  readonly message = input('');
  readonly messageDetail = input('');
  readonly counts = input<Readonly<Partial<Record<ImportRowStatus, number>>>>({});
  readonly statusSummary: readonly ImportRowStatus[] = [
    'pending',
    'invalid',
    'uploaded',
    'failed',
    'uncertain',
  ];
  readonly fileSelected = output<File>();
  readonly submitted = output<void>();
  readonly cleared = output<void>();
  readonly reviewed = output<void>();
  readonly downloadTemplate = output<void>();
  select(event: FileSelectEvent): void {
    const file = event.files[0];
    if (!this.disabled() && !this.busy() && !this.locked() && event.files.length === 1 && file)
      this.fileSelected.emit(file);
  }
}
