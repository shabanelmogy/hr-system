import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  BooleanField,
  FormContainer,
  PageHeader,
  TextField,
  applyServerFieldErrors,
} from '../../shared/ui/public-api';

@Component({
  imports: [
    ReactiveFormsModule,
    ActionButton,
    BooleanField,
    TextField,
    FormContainer,
    PageHeader,
    UiTextPipe,
    JsonPipe,
  ],
  templateUrl: './boolean-preview.html',
  styleUrl: './boolean-preview.scss',
})
export class BooleanPreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    checkbox: new FormControl(false, { nonNullable: true }),
    switch: new FormControl(false, { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  readonly readonly = signal(false);
  readonly swapped = signal(false);
  readonly saved = signal(0);
  readonly changes = signal(0);
  readonly snapshot = signal('');
  constructor() {
    void this.locale.loadNamespace('core');
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.changes.update((n) => n + 1));
  }
  messages() {
    return { required: this.locale.translate('validation.required') };
  }
  reset() {
    this.form.reset();
    this.saved.set(0);
    this.snapshot.set('');
  }
  patch() {
    this.form.patchValue({ checkbox: true, switch: true });
  }
  serverError() {
    applyServerFieldErrors(this.form, { checkbox: this.locale.translate('booleanField.invalid') });
  }
  toggleDisabled() {
    if (this.form.controls.checkbox.disabled) this.form.enable();
    else this.form.disable();
  }
  save() {
    this.snapshot.set(JSON.stringify(this.form.getRawValue()));
    this.saved.update((n) => n + 1);
  }
}
