import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  TextField,
  NumericField,
  BooleanField,
  FormContainer,
  PageHeader,
  applyServerFieldErrors,
} from '../../shared/ui/public-api';
@Component({
  imports: [
    ReactiveFormsModule,
    ActionButton,
    TextField,
    NumericField,
    BooleanField,
    FormContainer,
    PageHeader,
    UiTextPipe,
  ],
  templateUrl: './multiline-preview.html',
  styleUrl: './multiline-preview.scss',
})
export class MultilinePreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly readonly = signal(false);
  readonly multiline = signal(true);
  readonly saved = signal(0);
  readonly changes = signal(0);
  readonly snapshot = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    value: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(160)],
    }),
    optional: new FormControl('', { nonNullable: true }),
    number: new FormControl('', { nonNullable: true }),
    flag: new FormControl(false, { nonNullable: true }),
  });
  constructor() {
    void this.locale.loadNamespace('core');
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.changes.update((n) => n + 1));
  }
  messages() {
    return {
      required: this.locale.translate('validation.required'),
      maxlength: this.locale.translate('validation.maxLength', 'core', { count: 160 }),
    };
  }
  reset() {
    this.form.reset();
    this.saved.set(0);
    this.snapshot.set('');
  }
  serverError() {
    applyServerFieldErrors(this.form, { value: this.locale.translate('common.error') });
  }
  toggleDisabled() {
    if (this.form.controls.value.disabled) this.form.enable();
    else this.form.disable();
  }
  save() {
    this.snapshot.set(JSON.stringify(this.form.getRawValue()));
    this.saved.update((n) => n + 1);
  }
}
