import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, readonly } from '@angular/forms/signals';
import { UiTextPipe } from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  FormContainer,
  TextField,
  StatusBadge,
} from '../../../../../../shared/ui/public-api';
import type { CountryDetail } from '../../types/country';

@Component({
  selector: 'erp-country-read-details',
  imports: [FormField, FormContainer, TextField, ActionButton, StatusBadge, UiTextPipe],
  templateUrl: './country-read-details.html',
  styleUrl: './country-read-details.scss',
})
export class CountryReadDetails {
  readonly country = input.required<CountryDetail>();
  readonly closed = output<void>();
  readonly form = form(
    signal({
      nameAr: '',
      nameEn: '',
      alpha2Code: '',
      alpha3Code: '',
      phoneCode: '',
      currencyCode: '',
    }),
    (path) => readonly(path),
  );
  constructor() {
    effect(() => {
      const country = this.country();
      this.form().reset({
        nameAr: country.nameAr,
        nameEn: country.nameEn,
        alpha2Code: country.alpha2Code ?? '',
        alpha3Code: country.alpha3Code ?? '',
        phoneCode: country.phoneCode ?? '',
        currencyCode: country.currencyCode ?? '',
      });
    });
  }
}
