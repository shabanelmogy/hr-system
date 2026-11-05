import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { StatusBadge } from '../../../../../../shared/ui/public-api';
import type { CountryListItem } from '../../types/country';
import {
  countryName,
  countryOtherName,
  countryNumber,
  countryQualityAppearance,
} from '../../utils/country-presentation';

@Component({
  imports: [StatusBadge, UiTextPipe],
  selector: 'erp-country-card-header',
  templateUrl: './country-card-header.html',
  styleUrl: './country-card-header.scss',
})
export class CountryCardHeader {
  readonly country = input.required<CountryListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly title = computed(() => countryName(this.country(), this.locale.language()));
  readonly subtitle = computed(() => countryOtherName(this.country(), this.locale.language()));
  readonly quality = computed(() => countryQualityAppearance(this.country()));
  readonly qualityLabel = computed(
    () => countryNumber(this.quality().quality, this.locale.language()) + '%',
  );
}
