import { Component, computed, inject } from '@angular/core';
import { UiTextPipe } from '../../../../../../platform/localization/public-api';
import { DialogPanel, FeedbackState } from '../../../../../../shared/ui/public-api';
import { DistrictReadState } from '../../state/district-read-state';
import { DistrictReadDetails } from '../district-read-details/district-read-details';
@Component({
  selector: 'erp-district-detail-dialog',
  imports: [DialogPanel, FeedbackState, DistrictReadDetails, UiTextPipe],
  templateUrl: './district-detail-dialog.html',
})
export class DistrictDetailDialog {
  readonly state = inject(DistrictReadState);
  readonly detail = computed(() => {
    const view = this.state.detail();
    return view.kind === 'ready' ? view.data : null;
  });
}
