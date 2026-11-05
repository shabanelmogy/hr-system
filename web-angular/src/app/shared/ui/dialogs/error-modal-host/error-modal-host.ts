import { Component, inject, viewChild } from '@angular/core';
import { UI_LOCALIZATION, UiTextPipe } from '../../../localization/public-api';
import { ActionButton } from '../../buttons/public-api';
import { FeedbackNotifications } from '../../feedback/feedback-notifications';
import { DialogPanel } from '../dialog-panel/dialog-panel';
@Component({
  selector: 'erp-error-modal-host',
  imports: [ActionButton, DialogPanel, UiTextPipe],
  templateUrl: './error-modal-host.html',
  styleUrl: './error-modal-host.scss',
})
export class ErrorModalHost {
  readonly notices = inject(FeedbackNotifications);
  readonly locale = inject(UI_LOCALIZATION);
  private readonly closeAction = viewChild<ActionButton>('dismissAction');
  focusClose(): void {
    this.closeAction()?.focus();
  }
}
