import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { StatusBadge } from '../../../../../../shared/ui/public-api';
import type { DistrictListItem } from '../../types/district';
import {
  districtName,
  districtNumber,
  districtQualityAppearance,
} from '../../utils/district-presentation';

@Component({
  imports: [StatusBadge, UiTextPipe],
  selector: 'erp-district-card-header',
  templateUrl: './district-card-header.html',
  styleUrl: './district-card-header.scss',
})
export class DistrictCardHeader {
  readonly state = input.required<DistrictListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly title = computed(() => districtName(this.state(), this.locale.language()));
  readonly subtitle = computed(() =>
    districtName(this.state(), this.locale.language() === 'ar' ? 'en' : 'ar'),
  );
  readonly quality = computed(() => districtQualityAppearance(this.state()));
  readonly qualityLabel = computed(
    () => districtNumber(this.quality().quality, this.locale.language()) + '%',
  );
}
