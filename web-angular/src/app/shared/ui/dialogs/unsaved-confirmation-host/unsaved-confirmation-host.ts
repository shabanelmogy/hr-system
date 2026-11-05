import { Component, inject } from '@angular/core';
import { UnsavedChanges } from '../../../data/unsaved-public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'erp-unsaved-confirmation-host',
  imports: [ConfirmationDialog, UiTextPipe],
  templateUrl: './unsaved-confirmation-host.html',
})
export class UnsavedConfirmationHost {
  readonly drafts = inject(UnsavedChanges);
}
