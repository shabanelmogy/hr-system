import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  imports: [ReactiveFormsModule, FormContainer, TextField, ActionButton, StatusBadge, UiTextPipe],
  templateUrl: './country-read-details.html',
  styleUrl: './country-read-details.scss',
})
export class CountryReadDetails {
  readonly country = input.required<CountryDetail>();
  readonly closed = output<void>();
  readonly form = new FormGroup({
    nameAr: new FormControl('', { nonNullable: true }),
    nameEn: new FormControl('', { nonNullable: true }),
    alpha2Code: new FormControl('', { nonNullable: true }),
    alpha3Code: new FormControl('', { nonNullable: true }),
    phoneCode: new FormControl('', { nonNullable: true }),
    currencyCode: new FormControl('', { nonNullable: true }),
  });
  constructor() {
    effect(() => {
      const country = this.country();
      this.form.reset({
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
