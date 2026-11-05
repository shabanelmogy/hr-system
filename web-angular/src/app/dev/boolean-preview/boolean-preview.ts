import { Component, effect, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  disabled,
  form,
  FormField,
  readonly as readOnly,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  BooleanField,
  FormContainer,
  PageHeader,
  TextField,
  mapServerFieldErrors,
} from '../../shared/ui/public-api';

@Component({
  imports: [
    FormField,
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
  readonly disabledState = signal(false);
  readonly form = form(
    signal({ name: '', checkbox: false, switch: false, consent: false }),
    (path) => {
      disabled(path, { when: () => this.disabledState() });
      required(path.name);
      for (const field of [path.checkbox, path.switch, path.consent])
        readOnly(field, { when: () => this.readonly() });
      required(path.consent);
      validate(path.consent, ({ value }) => (value() === true ? undefined : { kind: 'required' }));
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
  readonly swapped = signal(false);
  readonly saved = signal(0);
  readonly changes = signal(0);
  readonly snapshot = signal('');
  constructor() {
    void this.locale.loadNamespace('core');
    effect(() => {
      this.form().value();
      this.changes.update((n) => n + 1);
    });
  }
  messages() {
    return { required: this.locale.translate('validation.required') };
  }
  reset() {
    this.form().reset({ name: '', checkbox: false, switch: false, consent: false });
    this.saved.set(0);
    this.snapshot.set('');
  }
  patch() {
    this.form().value.update((value) => ({ ...value, checkbox: true, switch: true }));
  }
  serverError() {
    void submit(this.form, {
      ignoreValidators: 'all',
      action: () =>
        Promise.resolve(
          mapServerFieldErrors(
            this.form,
            { checkbox: this.locale.translate('booleanField.invalid') },
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
