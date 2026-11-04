import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  NumericField,
  FormContainer,
  PageHeader,
  applyServerFieldErrors,
} from '../../shared/ui/public-api';

@Component({
  imports: [ReactiveFormsModule, ActionButton, NumericField, FormContainer, PageHeader, UiTextPipe],
  templateUrl: './numeric-preview.html',
  styleUrl: './numeric-preview.scss',
})
export class NumericPreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly form = new FormGroup({
    decimal: new FormControl('0.10000000000000001', {
      nonNullable: true,
      validators: Validators.required,
    }),
    integer: new FormControl('9007199254740993', { nonNullable: true }),
  });
  readonly readonly = signal(false);
  readonly limited = signal(false);
  readonly saved = signal(0);
  readonly snapshot = signal('');
  constructor() {
    void this.locale.loadNamespace('core');
  }
  messages() {
    return { required: this.locale.translate('validation.required') };
  }
  reset() {
    this.form.reset({ decimal: '', integer: '' });
    this.limited.set(false);
    this.saved.set(0);
    this.snapshot.set('');
  }
  patch() {
    this.form.patchValue({ decimal: '0.10000000000000001', integer: '9007199254740993' });
  }
  serverError() {
    applyServerFieldErrors(this.form, { decimal: this.locale.translate('numericField.invalid') });
  }
  toggleDisabled() {
    if (this.form.controls.decimal.disabled) this.form.enable();
    else this.form.disable();
  }
  save() {
    this.snapshot.set(JSON.stringify(this.form.getRawValue()));
    this.saved.update((n) => n + 1);
  }
}
