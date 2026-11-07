import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { AppIcon, ProgressMeter, StatusBadge } from '../../../../../../shared/ui/public-api';
import type { StateListItem } from '../../types/state';
import {
  stateDate,
  stateName,
  stateNumber,
  stateQualityAppearance,
} from '../../utils/state-presentation';
@Component({
  selector: 'erp-state-card-content',
  imports: [AppIcon, ProgressMeter, StatusBadge, UiTextPipe],
  templateUrl: './state-card-content.html',
  styleUrl: './state-card-content.scss',
})
export class StateCardContent {
  readonly state = input.required<StateListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly countryName = computed(() => stateName(this.state().country, this.locale.language()));
  readonly districts = computed(() =>
    stateNumber(this.state().districtsCount, this.locale.language()),
  );
  readonly quality = computed(() => stateQualityAppearance(this.state()));
  readonly qualityLevel = computed(() => this.locale.translate('general.' + this.quality().level));
  readonly createdOn = computed(() => stateDate(this.state().createdOn, this.locale.language()));
}
