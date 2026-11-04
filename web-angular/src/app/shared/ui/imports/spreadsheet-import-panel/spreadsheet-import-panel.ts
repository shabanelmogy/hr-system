import { Component, input, output } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import type { FileSelectEvent } from 'primeng/types/fileupload';
import { UiTextPipe } from '../../../../platform/localization/public-api';
import { SurfaceCard } from '../../layout/surface-card/surface-card';
import { ActionButton } from '../../buttons/public-api';
import { FeedbackState } from '../../feedback/feedback-state/feedback-state';

/** File bytes remain local. Only the feature's validated JSON command may reach its API. */
@Component({
  selector: 'erp-spreadsheet-import-panel',
  imports: [FileUpload, UiTextPipe, SurfaceCard, ActionButton, FeedbackState],
  templateUrl: './spreadsheet-import-panel.html',
  styleUrl: './spreadsheet-import-panel.scss',
})
export class SpreadsheetImportPanel {
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
