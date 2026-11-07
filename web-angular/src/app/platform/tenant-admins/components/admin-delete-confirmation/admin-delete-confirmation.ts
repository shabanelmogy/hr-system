import { Component, inject } from '@angular/core';
import {
  ConfirmationDialog,
  DialogPanel,
  FeedbackState,
  ActionButton,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AdminDeleteState } from '../../state/admin-delete-state';
@Component({
  selector: 'erp-admin-delete-confirmation',
  imports: [ConfirmationDialog, DialogPanel, FeedbackState, ActionButton, UiTextPipe],
  templateUrl: './admin-delete-confirmation.html',
})
export class AdminDeleteConfirmation {
  readonly state = inject(AdminDeleteState);
  readonly locale = inject(LocalizationRuntime);
  text(key: string): string {
    return this.locale.translate('tenantAdmins.' + key, 'platform-tenants');
  }
  feedback(): string {
    const key = this.state.feedback();
    return key
      ? this.locale.translate(key, key.startsWith('tenantAdmins.') ? 'platform-tenants' : 'core')
      : '';
  }
}
