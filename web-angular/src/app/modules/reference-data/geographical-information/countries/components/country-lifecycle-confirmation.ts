import { Component, inject } from '@angular/core';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/presentation.public-api';
import { ConfirmationDialog } from '../../../../../shared/ui/public-api';
import { CountryLifecycleState } from '../state/country-lifecycle-state';
import { countryName } from '../utils/country-presentation';
import type { CountryListItem } from '../types/country';

@Component({
  imports: [ConfirmationDialog, UiTextPipe],
  selector: 'erp-country-lifecycle-confirmation',
  templateUrl: './country-lifecycle-confirmation.html',
})
export class CountryLifecycleConfirmation {
  readonly lifecycle = inject(CountryLifecycleState);
  readonly locale = inject(LocalizationRuntime);
  rowLabel(row: CountryListItem): string { return countryName(row, this.locale.language()); }
  text(key: string): string { return this.locale.translate(key); }
}
