import { Component, inject } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import { ConfirmationDialog } from '../../../../../../shared/ui/public-api';
import type { DistrictListItem } from '../../types/district';
import { DistrictLifecycleState } from '../../state/district-lifecycle-state';
@Component({
  selector: 'erp-district-lifecycle-confirmation',
  imports: [ConfirmationDialog, UiTextPipe],
  templateUrl: './district-lifecycle-confirmation.html',
})
export class DistrictLifecycleConfirmation {
  readonly lifecycle = inject(DistrictLifecycleState);
  readonly locale = inject(LocalizationRuntime);
  rowLabel(row: DistrictListItem) {
    return this.locale.language().toLowerCase().startsWith('ar') ? row.nameAr : row.nameEn;
  }
  text(key: string) {
    return this.locale.translate(key);
  }
}
