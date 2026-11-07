import { Component, computed, inject } from '@angular/core';
import { UiTextPipe } from '../../../../../../platform/localization/public-api';
import { DialogPanel, FeedbackState } from '../../../../../../shared/ui/public-api';
import { StateReadState } from '../../state/state-read-state';
import { StateReadDetails } from '../state-read-details/state-read-details';
@Component({
  selector: 'erp-state-detail-dialog',
  imports: [DialogPanel, FeedbackState, StateReadDetails, UiTextPipe],
  templateUrl: './state-detail-dialog.html',
})
export class StateDetailDialog {
  readonly state = inject(StateReadState);
  readonly detail = computed(() => {
    const view = this.state.detail();
    return view.kind === 'ready' ? view.data : null;
  });
}
