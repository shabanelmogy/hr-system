import { Component, computed, inject } from '@angular/core';
import { UiTextPipe } from '../../../../../../shared/localization/public-api';
import { DialogPanel, FeedbackState } from '../../../../../../shared/ui/public-api';
import { CountryReadState } from '../../state/country-read-state';
import { CountryReadDetails } from '../country-read-details/country-read-details';

@Component({
  imports: [DialogPanel, FeedbackState, CountryReadDetails, UiTextPipe],
  selector: 'erp-country-detail-dialog',
  templateUrl: './country-detail-dialog.html',
})
export class CountryDetailDialog {
  readonly state = inject(CountryReadState);
  readonly country = computed(() => {
    const detail = this.state.detail();
    return detail.kind === 'ready' ? detail.data : null;
  });
}
