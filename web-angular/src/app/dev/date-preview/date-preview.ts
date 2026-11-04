import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  DateField,
  FormContainer,
  PageHeader,
  applyServerFieldErrors,
} from '../../shared/ui/public-api';

@Component({
  imports: [ReactiveFormsModule, ActionButton, DateField, FormContainer, PageHeader, UiTextPipe],
  templateUrl: './date-preview.html',
  styleUrl: './date-preview.scss',
})
export class DatePreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly form = new FormGroup({
    start: new FormControl('2024-02-29', { nonNullable: true, validators: Validators.required }),
    end: new FormControl('2024-03-01', { nonNullable: true }),
  });
  readonly readonly = signal(false);
  readonly saved = signal(0);
  readonly increment = (n: number) => n + 1;
  constructor() {
    void this.locale.loadNamespace('core');
  }
  messages() {
    return { required: this.locale.translate('validation.required') };
  }
  reset() {
    this.form.reset({ start: '', end: '' });
    this.saved.set(0);
  }
  patch() {
    this.form.patchValue({ start: '2024-02-29', end: '2024-03-01' });
  }
  serverError() {
    applyServerFieldErrors(this.form, { start: this.locale.translate('validation.invalidDate') });
  }
  toggleDisabled() {
    if (this.form.controls.start.disabled) this.form.enable();
    else this.form.disable();
  }
}
