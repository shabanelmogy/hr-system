import { Component, inject } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import { ConfirmationDialog } from '../../../../../../shared/ui/public-api';
import type { StateListItem } from '../../types/state';
import { StateLifecycleState } from '../../state/state-lifecycle-state';
@Component({
  selector: 'erp-state-lifecycle-confirmation',
  imports: [ConfirmationDialog, UiTextPipe],
  templateUrl: './state-lifecycle-confirmation.html',
})
export class StateLifecycleConfirmation {
  readonly lifecycle = inject(StateLifecycleState);
  readonly locale = inject(LocalizationRuntime);
  rowLabel(row: StateListItem) {
    return this.locale.language().toLowerCase().startsWith('ar') ? row.nameAr : row.nameEn;
  }
  text(key: string) {
    return this.locale.translate(key);
  }
}
