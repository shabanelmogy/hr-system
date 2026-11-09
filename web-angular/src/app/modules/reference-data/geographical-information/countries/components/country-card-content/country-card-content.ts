import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/presentation.public-api';
import { AppIcon, StatusBadge, ProgressMeter } from '../../../../../../shared/ui/public-api';
import type { CountryListItem } from '../../types/country';
import {
  countryDate,
  countryNumber,
  countryPhone,
  countryQualityAppearance,
} from '../../utils/country-presentation';

@Component({
  imports: [AppIcon, StatusBadge, ProgressMeter, UiTextPipe],
  selector: 'erp-country-card-content',
  templateUrl: './country-card-content.html',
  styleUrl: './country-card-content.scss',
})
export class CountryCardContent {
  readonly country = input.required<CountryListItem>();
  private readonly locale = inject(LocalizationRuntime);
  readonly quality = computed(() => countryQualityAppearance(this.country()));
  readonly qualityLevel = computed(() =>
    this.locale
      .translate('general.' + this.quality().level)
      .toLocaleUpperCase(this.locale.language()),
  );
  readonly qualityLabel = computed(
    () =>
      countryNumber(this.quality().quality, this.locale.language()) + '% · ' + this.qualityLevel(),
  );
  readonly statesCount = computed(() =>
    countryNumber(this.country().statesCount, this.locale.language()),
  );
  readonly createdOn = computed(() =>
    countryDate(this.country().createdOn, this.locale.language()),
  );
  readonly phone = computed(() => countryPhone(this.country().phoneCode));
}
