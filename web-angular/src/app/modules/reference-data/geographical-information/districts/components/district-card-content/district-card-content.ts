import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { AppIcon, ProgressMeter, StatusBadge } from '../../../../../../shared/ui/public-api';
import type { DistrictListItem } from '../../types/district';
import {
  districtDate,
  districtName,
  districtNumber,
  districtQualityAppearance,
} from '../../utils/district-presentation';
@Component({
  selector: 'erp-district-card-content',
  imports: [AppIcon, ProgressMeter, StatusBadge, UiTextPipe],
  templateUrl: './district-card-content.html',
  styleUrl: './district-card-content.scss',
})
export class DistrictCardContent {
  readonly state = input.required<DistrictListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly stateName = computed(() => districtName(this.state().state, this.locale.language()));
  readonly districts = computed(() =>
    districtNumber(this.state().addressesCount, this.locale.language()),
  );
  readonly quality = computed(() => districtQualityAppearance(this.state()));
  readonly qualityLevel = computed(() => this.locale.translate('general.' + this.quality().level));
  readonly createdOn = computed(() => districtDate(this.state().createdOn, this.locale.language()));
}
