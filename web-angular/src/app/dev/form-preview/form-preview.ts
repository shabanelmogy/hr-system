import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { themePaletteOrder } from '@app/tokens';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import {
  ActionButton,
  applyServerFieldErrors,
  FormContainer,
  TextField,
} from '../../shared/ui/public-api';
import { ThemeService } from '../../../theme/public-api';
import { createAccessFixture, createProfileFixture } from '../form-fixture-validation';

@Component({
  imports: [ReactiveFormsModule, ActionButton, FormContainer, TextField, UiTextPipe],
  templateUrl: './form-preview.html',
  styleUrl: './form-preview.scss',
})
export class FormPreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly palettes = themePaletteOrder;
  readonly ready = signal(false);
  readonly access = createAccessFixture();
  readonly profile = createProfileFixture();
  readonly pending = signal(false);
  readonly saved = signal(0);
  readonly messages = computed(() => ({
    required: this.runtime.translate('validation.required'),
    email: this.runtime.translate('validation.invalidEmail'),
    minlength: this.runtime.translate('validation.invalidPassword'),
  }));
  constructor() {
    void Promise.all([
      this.runtime.loadNamespace('core'),
      this.runtime.loadNamespace('platform-auth'),
    ]).then(() => this.ready.set(true));
  }
  serverError(): void {
    applyServerFieldErrors(this.profile, {
      'profile.name': this.runtime.translate('validation.required'),
    });
  }
  patch(): void {
    void Promise.resolve().then(() =>
      this.profile.patchValue({ profile: { name: 'Asynchronous fixture' } }),
    );
  }
}
