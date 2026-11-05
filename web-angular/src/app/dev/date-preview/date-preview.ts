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
  DateField,
  FormContainer,
  PageHeader,
  mapServerFieldErrors,
  validateDateOnly,
} from '../../shared/ui/public-api';

@Component({
  imports: [FormField, ActionButton, DateField, FormContainer, PageHeader, UiTextPipe],
  templateUrl: './date-preview.html',
  styleUrl: './date-preview.scss',
})
export class DatePreview {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocalizationRuntime);
  readonly palettes = themePaletteOrder;
  readonly disabledState = signal(false);
  readonly form = form(
    signal({ start: '2024-02-29', end: '2024-03-01' }),
    (path) => {
      disabled(path, { when: () => this.disabledState() });
      readOnly(path, { when: () => this.readonly() });
      required(path.start);
      validateDateOnly(path.start);
      validateDateOnly(path.end, () => ({ min: '2024-02-01', max: '2024-03-31' }));
    },
    {
      submission: {
        ignoreValidators: 'none',
        action: () => {
          this.saved.update(this.increment);
          return Promise.resolve();
        },
      },
    },
  );
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
    this.form().reset({ start: '', end: '' });
    this.saved.set(0);
  }
  patch() {
    this.form().value.update((value) => ({ ...value, start: '2024-02-29', end: '2024-03-01' }));
  }
  serverError() {
    void submit(this.form, {
      ignoreValidators: 'all',
      action: () =>
        Promise.resolve(
          mapServerFieldErrors(
            this.form,
            { start: this.locale.translate('validation.invalidDate') },
            this.form().value(),
          ),
        ),
    });
  }
  toggleDisabled() {
    this.disabledState.update((value) => !value);
  }
}
