import { Component, inject } from '@angular/core';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import { ConfirmationDialog } from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';

@Component({
  imports: [ConfirmationDialog, UiTextPipe],
  selector: 'erp-global-template-confirmations',
  templateUrl: './global-template-confirmations.html',
})
export class GlobalTemplateConfirmations {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
}
