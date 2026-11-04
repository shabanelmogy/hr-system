import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../shell/auth-layout/auth-layout';
import { FormContainer, TextField } from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { BrowserAuthService } from '../../services/browser-auth-service';
import { createPasswordRequestForm } from '../../validation/login-validation';

@Component({
  imports: [ReactiveFormsModule, RouterLink, AuthLayout, FormContainer, TextField, UiTextPipe],
  templateUrl: './password-request-page.html',
  styleUrl: './password-request-page.scss',
})
export class PasswordRequestPage {
  private readonly service = inject(BrowserAuthService);
  private readonly locale = inject(LocalizationRuntime);
  readonly form = createPasswordRequestForm();
  readonly pending = signal(false);
  readonly feedback = signal('');
  readonly messages = computed(() => ({
    required: this.locale.translate('validation.required'),
    email: this.locale.translate('validation.invalidEmail'),
  }));
  constructor() {
    void Promise.all([
      this.locale.loadNamespace('core'),
      this.locale.loadNamespace('platform-auth'),
    ]);
  }
  async request(): Promise<void> {
    if (this.pending()) return;
    this.pending.set(true);
    this.feedback.set('');
    try {
      await this.service.requestPasswordReset(this.form.getRawValue().email.trim());
      this.feedback.set('angularAuth.passwordRequestSent');
    } catch {
      this.feedback.set('angularAuth.unavailable');
    } finally {
      this.pending.set(false);
    }
  }
}
