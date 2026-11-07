import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { StatusBadge } from '../../../../../../shared/ui/public-api';
import type { StateListItem } from '../../types/state';
import { stateName, stateNumber, stateQualityAppearance } from '../../utils/state-presentation';

@Component({
  imports: [StatusBadge, UiTextPipe],
  selector: 'erp-state-card-header',
  templateUrl: './state-card-header.html',
  styleUrl: './state-card-header.scss',
})
export class StateCardHeader {
  readonly state = input.required<StateListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly title = computed(() => stateName(this.state(), this.locale.language()));
  readonly subtitle = computed(() =>
    stateName(this.state(), this.locale.language() === 'ar' ? 'en' : 'ar'),
  );
  readonly quality = computed(() => stateQualityAppearance(this.state()));
  readonly qualityLabel = computed(
    () => stateNumber(this.quality().quality, this.locale.language()) + '%',
  );
}
