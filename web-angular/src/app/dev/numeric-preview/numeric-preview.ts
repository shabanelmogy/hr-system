import { Component, inject, signal } from '@angular/core';
import {
  disabled,
  form,
  FormField,
  readonly as readOnly,
  required,
  submit,
} from '@angular/forms/signals';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  NumericField,
  FormContainer,
  PageHeader,
  mapServerFieldErrors,
  validateNumericText,
} from '../../shared/ui/public-api';

@Component({
  imports: [FormField, ActionButton, NumericField, FormContainer, PageHeader, UiTextPipe],
  templateUrl: './numeric-preview.html',
  styleUrl: './numeric-preview.scss',
})
export class NumericPreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly disabledState = signal(false);
  readonly form = form(
    signal({ decimal: '0.10000000000000001', integer: '9007199254740993' }),
    (path) => {
      disabled(path, { when: () => this.disabledState() });
      readOnly(path, { when: () => this.readonly() });
      required(path.decimal);
      validateNumericText(path.decimal, () => ({ maxFractionDigits: this.limited() ? 2 : null }));
      validateNumericText(path.integer, () => ({
        mode: 'integer',
        min: '0',
        max: '9007199254740993',
      }));
    },
    {
      submission: {
        ignoreValidators: 'none',
        action: () => {
          this.save();
          return Promise.resolve();
        },
      },
    },
  );
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
    this.form().reset({ decimal: '', integer: '' });
    this.limited.set(false);
    this.saved.set(0);
    this.snapshot.set('');
  }
  patch() {
    this.form().value.update((value) => ({
      ...value,
      decimal: '0.10000000000000001',
      integer: '9007199254740993',
    }));
  }
  serverError() {
    void submit(this.form, {
      ignoreValidators: 'all',
      action: () =>
        Promise.resolve(
          mapServerFieldErrors(
            this.form,
            { decimal: this.locale.translate('numericField.invalid') },
            this.form().value(),
          ),
        ),
    });
  }
  toggleDisabled() {
    this.disabledState.update((value) => !value);
  }
  save() {
    this.snapshot.set(JSON.stringify(this.form().value()));
    this.saved.update((n) => n + 1);
  }
}
