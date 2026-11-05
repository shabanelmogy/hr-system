import { Component, computed, inject, output, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  DialogPanel,
  FeedbackState,
  FormCloseGuard,
  FormContainer,
  TextField,
  type FieldMessages,
} from '../../../../../../shared/ui/public-api';
import { CountryEditorState, type CountrySaved } from '../../state/country-editor-state';
import {
  countryFieldLimits,
  countryMutationFields,
  type CountryMutationField,
} from '../../validation/country-mutation';

@Component({
  selector: 'erp-country-editor',
  imports: [
    FormField,
    ActionButton,
    AppIcon,
    DialogPanel,
    FeedbackState,
    FormCloseGuard,
    FormContainer,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './country-editor.html',
})
export class CountryEditor {
  readonly state = inject(CountryEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly fields = countryMutationFields;
  readonly limits = countryFieldLimits;
  readonly saved = output<CountrySaved>();
  readonly closeGuard = viewChild.required(FormCloseGuard);
  private readonly form = viewChild<FormContainer>('entryForm');

  readonly messages = computed(() => {
    const message = (pattern: string): FieldMessages => ({
      required: this.locale.translate('validation.required'),
      minlength: this.locale.translate('validation.minLength', 'core', { count: 2 }),
      maxlength: this.locale.translate('validation.maxLength', 'core', { count: 100 }),
      invalidText: this.locale.translate('validation.invalidText'),
      pattern: this.locale.translate('countries.' + pattern, 'reference-countries'),
    });
    return {
      nameAr: message('invalidCode'),
      nameEn: message('invalidCode'),
      alpha2Code: message('invalidAlpha2Code'),
      alpha3Code: message('invalidAlpha3Code'),
      phoneCode: message('invalidPhoneCode'),
      currencyCode: message('invalidCurrency'),
    };
  });

  constructor() {
    this.state.saved.pipe(takeUntilDestroyed()).subscribe((value) => this.saved.emit(value));
    this.state.errorsChanged
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form()?.revealErrors());
  }

  label(field: CountryMutationField): string {
    return field === 'nameAr' || field === 'nameEn'
      ? this.locale.translate('general.' + field)
      : this.locale.translate('countries.' + field, 'reference-countries');
  }
}
